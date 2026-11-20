function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function pointToCirclePush(x, z, cx, cz, minDist) {
  const dx = x - cx;
  const dz = z - cz;
  const distSq = dx * dx + dz * dz;
  if (distSq >= minDist * minDist) return null;
  const dist = Math.sqrt(distSq);
  if (dist < 1e-5) {
    return { x: cx, z: cz + minDist };
  }
  const push = (minDist - dist) + 0.002;
  return {
    x: x + (dx / dist) * push,
    z: z + (dz / dist) * push
  };
}

function pointToRectPush(x, z, rect, radius) {
  const minX = rect.minX;
  const maxX = rect.maxX;
  const minZ = rect.minZ;
  const maxZ = rect.maxZ;
  const closestX = clamp(x, minX, maxX);
  const closestZ = clamp(z, minZ, maxZ);
  const dx = x - closestX;
  const dz = z - closestZ;
  const distSq = dx * dx + dz * dz;

  if (distSq >= radius * radius) return null;

  if (distSq > 1e-6) {
    const dist = Math.sqrt(distSq);
    const push = (radius - dist) + 0.002;
    return {
      x: x + (dx / dist) * push,
      z: z + (dz / dist) * push
    };
  }

  // Point center is inside the rectangle — push out along the shallowest axis
  const leftDist = Math.abs(x - minX);
  const rightDist = Math.abs(maxX - x);
  const topDist = Math.abs(z - minZ);
  const bottomDist = Math.abs(maxZ - z);
  const minPen = Math.min(leftDist, rightDist, topDist, bottomDist);
  if (minPen === leftDist) return { x: minX - radius - 0.002, z };
  if (minPen === rightDist) return { x: maxX + radius + 0.002, z };
  if (minPen === topDist) return { x, z: minZ - radius - 0.002 };
  return { x, z: maxZ + radius + 0.002 };
}

/**
 * Multi-pass iterative Minimum Translation Vector (MTV) collision solver.
 * Produces smooth wall sliding without corner jitter or prevInside tunneling.
 */
export function resolveMultiPassCollision(curX, curZ, targetX, targetZ, config = {}) {
  const radius = Number.isFinite(config.radius) ? config.radius : 0.72;
  const bounds = config.bounds || { minX: -54, maxX: 54, minZ: -64, maxZ: 68 };
  const circles = Array.isArray(config.circles) ? config.circles : [];
  const rects = Array.isArray(config.rects) ? config.rects : [];
  const passes = Math.max(1, Math.min(6, Number(config.passes) || 3));

  let x = clamp(targetX, bounds.minX + radius, bounds.maxX - radius);
  let z = clamp(targetZ, bounds.minZ + radius, bounds.maxZ - radius);
  let collided = false;

  for (let pass = 0; pass < passes; pass++) {
    let passMoved = false;

    for (let i = 0; i < circles.length; i++) {
      const c = circles[i];
      const pushed = pointToCirclePush(x, z, c.x, c.z, c.r + radius);
      if (pushed) {
        x = pushed.x;
        z = pushed.z;
        collided = true;
        passMoved = true;
      }
    }

    for (let i = 0; i < rects.length; i++) {
      const r = rects[i];
      const pushed = pointToRectPush(x, z, r, radius);
      if (pushed) {
        x = pushed.x;
        z = pushed.z;
        collided = true;
        passMoved = true;
      }
    }

    const clampedX = clamp(x, bounds.minX + radius, bounds.maxX - radius);
    const clampedZ = clamp(z, bounds.minZ + radius, bounds.maxZ - radius);
    if (clampedX !== x || clampedZ !== z) {
      x = clampedX;
      z = clampedZ;
      collided = true;
    }

    if (!passMoved) break;
  }

  // Final safety check: if solver still overlaps deeply inside a wall due to extreme step,
  // blend back toward curX/curZ so we never tunnel through thin barriers.
  const stepDist = Math.hypot(targetX - curX, targetZ - curZ);
  const resolvedStep = Math.hypot(x - curX, z - curZ);
  if (stepDist > 0.001 && resolvedStep > stepDist + 2.2) {
    return { x: curX, z: curZ, collided: true };
  }

  return { x, z, collided };
}

function isPointBlocked(x, z, circles, rects, padRadius) {
  for (let i = 0; i < circles.length; i++) {
    const c = circles[i];
    const minDist = c.r + padRadius;
    const dx = x - c.x;
    const dz = z - c.z;
    if (dx * dx + dz * dz < minDist * minDist) return true;
  }
  for (let i = 0; i < rects.length; i++) {
    const r = rects[i];
    if (
      x >= r.minX - padRadius &&
      x <= r.maxX + padRadius &&
      z >= r.minZ - padRadius &&
      z <= r.maxZ + padRadius
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Builds a 2D occupancy grid for fast A* obstacle avoidance.
 */
export function buildNavigationGrid({
  bounds,
  cellSize = 1.4,
  circles = [],
  rects = [],
  agentRadius = 0.72,
  clearance = 0.16
}) {
  const minX = bounds.minX;
  const maxX = bounds.maxX;
  const minZ = bounds.minZ;
  const maxZ = bounds.maxZ;
  const cols = Math.max(4, Math.ceil((maxX - minX) / cellSize));
  const rows = Math.max(4, Math.ceil((maxZ - minZ) / cellSize));
  const blocked = new Uint8Array(cols * rows);
  const pad = agentRadius + clearance;

  for (let row = 0; row < rows; row++) {
    const wz = minZ + (row + 0.5) * cellSize;
    for (let col = 0; col < cols; col++) {
      const wx = minX + (col + 0.5) * cellSize;
      if (
        wx < minX + agentRadius ||
        wx > maxX - agentRadius ||
        wz < minZ + agentRadius ||
        wz > maxZ - agentRadius ||
        isPointBlocked(wx, wz, circles, rects, pad)
      ) {
        blocked[row * cols + col] = 1;
      }
    }
  }

  return {
    minX,
    maxX,
    minZ,
    maxZ,
    cellSize,
    cols,
    rows,
    blocked
  };
}

function worldToCell(grid, x, z) {
  const col = clamp(Math.floor((x - grid.minX) / grid.cellSize), 0, grid.cols - 1);
  const row = clamp(Math.floor((z - grid.minZ) / grid.cellSize), 0, grid.rows - 1);
  return { col, row };
}

function cellToWorld(grid, col, row) {
  return {
    x: grid.minX + (col + 0.5) * grid.cellSize,
    z: grid.minZ + (row + 0.5) * grid.cellSize
  };
}

function isCellWalkable(grid, col, row) {
  if (col < 0 || col >= grid.cols || row < 0 || row >= grid.rows) return false;
  return grid.blocked[row * grid.cols + col] === 0;
}

function findNearestWalkableCell(grid, col, row, maxRadius = 10) {
  if (isCellWalkable(grid, col, row)) return { col, row };
  let best = null;
  let bestDistSq = Infinity;
  for (let r = 1; r <= maxRadius; r++) {
    for (let dr = -r; dr <= r; dr++) {
      for (let dc = -r; dc <= r; dc++) {
        if (Math.abs(dr) !== r && Math.abs(dc) !== r) continue;
        const nc = col + dc;
        const nr = row + dr;
        if (!isCellWalkable(grid, nc, nr)) continue;
        const dSq = dc * dc + dr * dr;
        if (dSq < bestDistSq) {
          bestDistSq = dSq;
          best = { col: nc, row: nr };
        }
      }
    }
    if (best) return best;
  }
  return null;
}

class MinHeap {
  constructor() {
    this.items = [];
  }
  get size() {
    return this.items.length;
  }
  push(node) {
    this.items.push(node);
    this._bubbleUp(this.items.length - 1);
  }
  pop() {
    if (this.items.length === 0) return null;
    const top = this.items[0];
    const last = this.items.pop();
    if (this.items.length > 0) {
      this.items[0] = last;
      this._sinkDown(0);
    }
    return top;
  }
  _bubbleUp(index) {
    while (index > 0) {
      const parent = (index - 1) >> 1;
      if (this.items[parent].f <= this.items[index].f) break;
      const tmp = this.items[parent];
      this.items[parent] = this.items[index];
      this.items[index] = tmp;
      index = parent;
    }
  }
  _sinkDown(index) {
    const len = this.items.length;
    while (true) {
      const left = index * 2 + 1;
      const right = left + 1;
      let smallest = index;
      if (left < len && this.items[left].f < this.items[smallest].f) smallest = left;
      if (right < len && this.items[right].f < this.items[smallest].f) smallest = right;
      if (smallest === index) break;
      const tmp = this.items[index];
      this.items[index] = this.items[smallest];
      this.items[smallest] = tmp;
      index = smallest;
    }
  }
}

const ASTAR_DIRS = [
  [1, 0, 1],
  [-1, 0, 1],
  [0, 1, 1],
  [0, -1, 1],
  [1, 1, Math.SQRT2],
  [1, -1, Math.SQRT2],
  [-1, 1, Math.SQRT2],
  [-1, -1, Math.SQRT2]
];

function hasGridLineOfSight(grid, ax, az, bx, bz) {
  const dist = Math.hypot(bx - ax, bz - az);
  const steps = Math.max(2, Math.ceil(dist / (grid.cellSize * 0.45)));
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const sx = ax + (bx - ax) * t;
    const sz = az + (bz - az) * t;
    const cell = worldToCell(grid, sx, sz);
    if (!isCellWalkable(grid, cell.col, cell.row)) return false;
  }
  return true;
}

/**
 * String-pulling path smoother over the occupancy grid.
 */
export function smoothGridPath(grid, waypoints) {
  if (!Array.isArray(waypoints) || waypoints.length <= 2) return waypoints || [];
  const smoothed = [waypoints[0]];
  let anchorIdx = 0;

  while (anchorIdx < waypoints.length - 1) {
    let furthest = anchorIdx + 1;
    for (let testIdx = waypoints.length - 1; testIdx > anchorIdx + 1; testIdx--) {
      if (
        hasGridLineOfSight(
          grid,
          waypoints[anchorIdx].x,
          waypoints[anchorIdx].z,
          waypoints[testIdx].x,
          waypoints[testIdx].z
        )
      ) {
        furthest = testIdx;
        break;
      }
    }
    smoothed.push(waypoints[furthest]);
    anchorIdx = furthest;
  }
  return smoothed;
}

/**
 * 8-directional A* pathfinder avoiding ponds, walls, pillars, and statue pedestals.
 */
export function findGridPathAStar(grid, startX, startZ, goalX, goalZ) {
  if (!grid) return [{ x: goalX, z: goalZ }];

  const rawStart = worldToCell(grid, startX, startZ);
  const rawGoal = worldToCell(grid, goalX, goalZ);
  const start = findNearestWalkableCell(grid, rawStart.col, rawStart.row, 10);
  const goal = findNearestWalkableCell(grid, rawGoal.col, rawGoal.row, 12);

  if (!start || !goal) {
    return [{ x: goalX, z: goalZ }];
  }

  const goalWorldExact = isCellWalkable(grid, rawGoal.col, rawGoal.row)
    ? { x: goalX, z: goalZ }
    : cellToWorld(grid, goal.col, goal.row);

  if (start.col === goal.col && start.row === goal.row) {
    return [goalWorldExact];
  }

  // Fast direct-line check if unobstructed
  if (hasGridLineOfSight(grid, startX, startZ, goalWorldExact.x, goalWorldExact.z)) {
    return [goalWorldExact];
  }

  const totalCells = grid.cols * grid.rows;
  const gScore = new Float32Array(totalCells);
  gScore.fill(Infinity);
  const cameFrom = new Int32Array(totalCells);
  cameFrom.fill(-1);
  const closed = new Uint8Array(totalCells);

  const startIdx = start.row * grid.cols + start.col;
  const goalIdx = goal.row * grid.cols + goal.col;

  const heuristic = (c, r) => {
    const dc = Math.abs(c - goal.col);
    const dr = Math.abs(r - goal.row);
    const diag = Math.min(dc, dr);
    const straight = Math.max(dc, dr) - diag;
    return diag * Math.SQRT2 + straight;
  };

  gScore[startIdx] = 0;
  const open = new MinHeap();
  open.push({ idx: startIdx, col: start.col, row: start.row, f: heuristic(start.col, start.row) });

  let found = false;
  let iterations = 0;
  const maxIterations = totalCells * 2;

  while (open.size > 0 && iterations++ < maxIterations) {
    const current = open.pop();
    if (!current) break;
    if (closed[current.idx]) continue;
    closed[current.idx] = 1;

    if (current.idx === goalIdx) {
      found = true;
      break;
    }

    const baseG = gScore[current.idx];

    for (let d = 0; d < ASTAR_DIRS.length; d++) {
      const [dc, dr, stepCost] = ASTAR_DIRS[d];
      const nc = current.col + dc;
      const nr = current.row + dr;
      if (!isCellWalkable(grid, nc, nr)) continue;

      // Prevent diagonal corner cutting through solid corners
      if (dc !== 0 && dr !== 0) {
        if (!isCellWalkable(grid, current.col + dc, current.row)) continue;
        if (!isCellWalkable(grid, current.col, current.row + dr)) continue;
      }

      const nIdx = nr * grid.cols + nc;
      if (closed[nIdx]) continue;

      const tentativeG = baseG + stepCost;
      if (tentativeG < gScore[nIdx]) {
        gScore[nIdx] = tentativeG;
        cameFrom[nIdx] = current.idx;
        open.push({ idx: nIdx, col: nc, row: nr, f: tentativeG + heuristic(nc, nr) });
      }
    }
  }

  if (!found) {
    return [goalWorldExact];
  }

  const rawPoints = [];
  let cursor = goalIdx;
  while (cursor !== -1 && cursor !== startIdx) {
    const r = Math.floor(cursor / grid.cols);
    const c = cursor % grid.cols;
    rawPoints.push(cellToWorld(grid, c, r));
    cursor = cameFrom[cursor];
  }
  rawPoints.reverse();

  // Anchor start and exact goal for string-pulling, then strip the start anchor
  const withAnchors = [{ x: startX, z: startZ }, ...rawPoints];
  withAnchors[withAnchors.length - 1] = goalWorldExact;
  const smoothed = smoothGridPath(grid, withAnchors);
  return smoothed.slice(1);
}

/**
 * Actual site layout constants for Chùa Vĩnh Tràng's straight 170m approach road & outer parking area.
 */
export const TEMPLE_APPROACH_LAYOUT = Object.freeze({
  roadCenterX: 40.5,
  roadMinX: 33.7,
  roadMaxX: 47.3,
  gateZ: 41.5,
  outerParking: {
    minX: 47.5,
    maxX: 78.0,
    minZ: 98.0,
    maxZ: 140.0,
    apronExitX: 46.8,
    apronExitZ: 112.0
  }
});

/**
 * Removes redundant nearly-collinear intermediate waypoints so straight corridors stay strictly linear.
 */
export function pruneCollinearWaypoints(waypoints, angleToleranceRad = 0.075, minSpacing = 0.45) {
  if (!Array.isArray(waypoints) || waypoints.length <= 2) return Array.isArray(waypoints) ? waypoints.slice() : [];
  const compact = [waypoints[0]];
  for (let i = 1; i < waypoints.length; i++) {
    const prev = compact[compact.length - 1];
    const cur = waypoints[i];
    if (i === waypoints.length - 1 || Math.hypot(cur.x - prev.x, cur.z - prev.z) >= minSpacing) {
      compact.push(cur);
    }
  }
  if (compact.length <= 2) return compact;

  const result = [compact[0]];
  const cosThresh = Math.cos(angleToleranceRad);
  for (let i = 1; i < compact.length - 1; i++) {
    const a = result[result.length - 1];
    const b = compact[i];
    const c = compact[i + 1];
    const v1x = b.x - a.x;
    const v1z = b.z - a.z;
    const v2x = c.x - b.x;
    const v2z = c.z - b.z;
    const l1 = Math.hypot(v1x, v1z);
    const l2 = Math.hypot(v2x, v2z);
    if (l1 < 1e-4 || l2 < 1e-4) continue;
    const dot = (v1x * v2x + v1z * v2z) / (l1 * l2);
    if (dot >= cosThresh) {
      // b lies virtually on the straight segment a -> c; skip it
      continue;
    }
    result.push(b);
  }
  result.push(compact[compact.length - 1]);
  return result;
}

/**
 * Computes a smooth, straight-aligned navigation path that eliminates non-linear detours
 * along the 170m approach road between Bãi Giữ Xe (outer parking area) and Cổng Phụ (x=40.5, z=41.5).
 */
export function optimizeEntrancePath(grid, fromX, fromZ, toX, toZ, inInterior = false) {
  const segments = [];
  const { roadCenterX, gateZ, outerParking } = TEMPLE_APPROACH_LAYOUT;

  if (!inInterior) {
    const curOutside = fromZ > gateZ + 0.6;
    const destInside = toZ < gateZ - 0.6;
    const curInside = fromZ < gateZ - 0.6;
    const destOutside = toZ > gateZ + 0.6;

    const inParkingLot =
      fromX >= outerParking.minX &&
      fromZ >= outerParking.minZ &&
      fromZ <= outerParking.maxZ;
    const destInParkingLot =
      toX >= outerParking.minX &&
      toZ >= outerParking.minZ &&
      toZ <= outerParking.maxZ;

    // Straight exit from outer parking area onto the 170m approach road centerline (x = 40.5)
    if (inParkingLot && toX < outerParking.minX) {
      const mergeZ = clamp(fromZ - 4.0, outerParking.minZ + 2.0, outerParking.maxZ - 2.0);
      segments.push({ x: roadCenterX, z: mergeZ });
    }

    // Crossing Cổng Phụ Tịnh Độ Huyền Môn along the exact straight road axis (x = 40.5, no x=39.2 zigzag!)
    if (curOutside && destInside) {
      if (Math.abs(fromX - roadCenterX) > 2.6 || fromZ > gateZ + 12) {
        segments.push({ x: roadCenterX, z: Math.min(fromZ, gateZ + 6.0) });
      }
      segments.push({ x: roadCenterX, z: gateZ });
      // Continue straight past the gate into the inner entrance lane if heading further North
      if (toZ < gateZ - 4.5 && Math.abs(toX - roadCenterX) <= 4.5) {
        segments.push({ x: roadCenterX, z: Math.max(toZ, gateZ - 6.0) });
      }
    } else if (curInside && destOutside) {
      segments.push({ x: roadCenterX, z: gateZ });
      if (destInParkingLot) {
        segments.push({ x: roadCenterX, z: clamp(toZ, outerParking.minZ + 2.0, outerParking.maxZ - 2.0) });
      }
    } else if (curOutside && destOutside && destInParkingLot && fromX < outerParking.minX) {
      segments.push({ x: roadCenterX, z: clamp(toZ, outerParking.minZ + 2.0, outerParking.maxZ - 2.0) });
    }
  }

  segments.push({ x: toX, z: toZ });

  // Deduplicate redundant consecutive segment targets
  const cleanSegments = [];
  for (let i = 0; i < segments.length; i++) {
    const s = segments[i];
    const prev = cleanSegments[cleanSegments.length - 1];
    if (!prev || Math.hypot(s.x - prev.x, s.z - prev.z) > 0.6) {
      cleanSegments.push(s);
    }
  }

  const combined = [{ x: fromX, z: fromZ }];
  let curX = fromX;
  let curZ = fromZ;

  for (let s = 0; s < cleanSegments.length; s++) {
    const seg = cleanSegments[s];
    const leg = grid
      ? findGridPathAStar(grid, curX, curZ, seg.x, seg.z)
      : [{ x: seg.x, z: seg.z }];
    for (let i = 0; i < leg.length; i++) {
      const p = leg[i];
      const last = combined[combined.length - 1];
      if (!last || Math.hypot(p.x - last.x, p.z - last.z) > 0.35) {
        combined.push({ x: p.x, z: p.z });
      }
    }
    curX = seg.x;
    curZ = seg.z;
  }

  // Global string-pulling across the whole merged route removes segment boundary kinks
  const globalSmoothed = grid ? smoothGridPath(grid, combined) : combined;
  const pruned = pruneCollinearWaypoints(globalSmoothed, 0.08, 0.45);
  const out = pruned.slice(1);
  if (out.length === 0) {
    return [{ x: toX, z: toZ }];
  }
  return out;
}

/**
 * Samples realistic terrain elevation (in meters) matching the 3D scene geometry:
 * - Chánh Điện interior floor: 0.0m
 * - Stilt dining porch & access ramp: 0.0m -> 1.14m
 * - Straight 170m approach road crown & subtle Mekong asphalt undulation: ~0.015..0.065m
 * - Temple courtyard tiles: 0.0m
 */
export function getTerrainGroundHeight(x, z, inInterior = false) {
  if (inInterior) return 0;
  // Stilt porch / raised hall platform & ramp (x in [52.0..64.6], z in [7.6..21.4])
  if (x >= 54.4 && x <= 64.6 && z >= 7.6 && z <= 21.4) {
    return 1.14;
  }
  if (x >= 52.0 && x < 54.4 && z >= 12.6 && z <= 16.4) {
    return ((x - 52.0) / 2.4) * 1.14;
  }
  // Straight 170m outer approach road (x in [33.7..47.3], z in [41.5..212.0]) — subtle road crown
  if (x >= 33.7 && x <= 47.3 && z >= 41.5 && z <= 212.0) {
    const roadHalfW = 6.8;
    const normOffset = clamp(Math.abs(x - 40.5) / roadHalfW, 0, 1);
    const crown = (1 - normOffset * normOffset) * 0.045;
    const microRipple = Math.sin(z * 0.14) * 0.012 + Math.cos(x * 0.55) * 0.008;
    return Math.max(0, 0.015 + crown + microRipple);
  }
  // Outer parking pad apron (x in [48.5..76.5], z in [102..138])
  if (x >= 48.5 && x <= 76.5 && z >= 102.0 && z <= 138.0) {
    return 0.055;
  }
  return 0;
}

/**
 * Realistic walking physics step with smooth acceleration, deceleration, cornering slowdown,
 * arrival braking, and stride phase advancement for footstep sync & zero foot sliding.
 */
export function stepWalkingPhysics(state, desiredDirX, desiredDirZ, options = {}) {
  const dt = Math.max(0.001, Math.min(0.1, Number(options.dt) || 0.016));
  const maxSpeed = Number.isFinite(options.maxSpeed) ? options.maxSpeed : 4.4;
  const accel = Number.isFinite(options.accel) ? options.accel : 10.5;
  const decel = Number.isFinite(options.decel) ? options.decel : 14.0;
  const inputScale = clamp(Number.isFinite(options.inputScale) ? options.inputScale : 1.0, 0, 1);
  const distToFinal = Number.isFinite(options.distToFinal) ? options.distToFinal : Infinity;
  const strideLength = Number.isFinite(options.strideLength) ? options.strideLength : 1.38;

  let vx = Number.isFinite(state?.vx) ? state.vx : 0;
  let vz = Number.isFinite(state?.vz) ? state.vz : 0;
  let stridePhase = Number.isFinite(state?.stridePhase) ? state.stridePhase : 0;

  const dirLen = Math.hypot(desiredDirX, desiredDirZ);
  let targetVx = 0;
  let targetVz = 0;

  if (dirLen > 1e-4 && inputScale > 0.02) {
    const nx = desiredDirX / dirLen;
    const nz = desiredDirZ / dirLen;
    let targetSpeed = maxSpeed * inputScale;

    // Gentle arrival deceleration within 2.4m of final stop
    if (distToFinal < 2.4) {
      const brakeFactor = clamp(distToFinal / 2.4, 0.24, 1.0);
      targetSpeed *= brakeFactor;
    }

    // Natural cornering speed moderation when turning sharply relative to current momentum
    const curSpeed = Math.hypot(vx, vz);
    if (curSpeed > 0.6) {
      const alignDot = clamp((vx * nx + vz * nz) / curSpeed, -1, 1);
      if (alignDot < 0.72) {
        const cornerScale = 0.55 + 0.45 * Math.max(0, alignDot);
        targetSpeed *= cornerScale;
      }
    }

    targetVx = nx * targetSpeed;
    targetVz = nz * targetSpeed;
  }

  const dvx = targetVx - vx;
  const dvz = targetVz - vz;
  const dvMag = Math.hypot(dvx, dvz);
  const isBraking = Math.hypot(targetVx, targetVz) < Math.hypot(vx, vz);
  const rate = isBraking ? decel : accel;
  const maxChange = rate * dt;

  if (dvMag <= maxChange) {
    vx = targetVx;
    vz = targetVz;
  } else if (dvMag > 1e-5) {
    vx += (dvx / dvMag) * maxChange;
    vz += (dvz / dvMag) * maxChange;
  }

  let speed = Math.hypot(vx, vz);
  if (speed < 0.04 && Math.hypot(targetVx, targetVz) < 0.04) {
    vx = 0;
    vz = 0;
    speed = 0;
  }

  const stepDx = vx * dt;
  const stepDz = vz * dt;
  const prevCycle = Math.floor(stridePhase / Math.PI);
  if (speed > 0.08) {
    stridePhase += (speed * dt / Math.max(0.5, strideLength)) * Math.PI * 2;
  }
  const nextCycle = Math.floor(stridePhase / Math.PI);
  const footstepTriggered = speed > 0.35 && nextCycle > prevCycle;

  return {
    vx,
    vz,
    speed,
    stepDx,
    stepDz,
    stridePhase: stridePhase % (Math.PI * 200),
    footstepTriggered,
    moving: speed > 0.08,
    normalizedSpeed: maxSpeed > 0.01 ? clamp(speed / maxSpeed, 0, 1.35) : 0
  };
}

/**
 * Potentially Visible Set (PVS) occlusion culling map for Chánh Điện's walled sub-zones.
 * Hides heavy geometry (e.g. 18 Arhats + Tam Bảo vs 8 East Corridor shrines) when behind solid walls.
 */
export function getVisibleInteriorZones(activeZoneKey, playerX = 15, playerZ = 16, cutaway = false) {
  if (cutaway) {
    return {
      shared_shell: true,
      east_corridor: true,
      center_courtyard: true,
      west_chanh_dien: true,
      north_gallery: true,
      south_gallery: true
    };
  }

  const vis = {
    shared_shell: true,
    east_corridor: false,
    center_courtyard: false,
    west_chanh_dien: false,
    north_gallery: false,
    south_gallery: false
  };

  // Determine visibility through open portals & sightlines
  if (activeZoneKey === 'chanh_dien' || playerX <= -15.2) {
    // Inside Grand West Chánh Điện (x <= -15.2): East Corridor is completely occluded by center courtyard + solid East walls!
    vis.west_chanh_dien = true;
    // Near the rear doorway (x > -23.5), glimpses of Hồ Sen Bộ courtyard are visible through the open Bức Bàn portals
    vis.center_courtyard = playerX > -24.5;
    vis.north_gallery = playerX > -18.0 && playerZ < -5.0;
    vis.south_gallery = playerX > -18.0 && playerZ > 5.0;
    vis.east_corridor = false;
  } else if (activeZoneKey === 'day_ban_tho_phai' || activeZoneKey === 'trai_duong' || playerX >= 10.6) {
    // Inside East Arrival Corridor & Veranda (x >= 10.6): Grand West Chánh Điện (Tam Bảo + 18 Arhats) is behind solid Bức Bàn wall!
    vis.east_corridor = true;
    vis.center_courtyard = playerZ > -22.0;
    vis.north_gallery = playerZ < -6.0;
    vis.south_gallery = playerZ > 4.0;
    vis.west_chanh_dien = false;
  } else if (activeZoneKey === 'ho_sen_bo') {
    // Center Open Courtyard: looks toward East colonnade, North/South galleries, and West Chánh Điện entrance facade
    vis.center_courtyard = true;
    vis.east_corridor = playerX > -4.0;
    vis.west_chanh_dien = playerX < 2.0;
    vis.north_gallery = playerZ < 5.0;
    vis.south_gallery = playerZ > -5.0;
  } else if (activeZoneKey === 'hanh_lang_trai') {
    // North Gallery (Tổ Đường)
    vis.north_gallery = true;
    vis.center_courtyard = true;
    vis.east_corridor = playerX > -2.0;
    vis.west_chanh_dien = playerX < -6.0;
  } else {
    // South Gallery
    vis.south_gallery = true;
    vis.center_courtyard = true;
    vis.east_corridor = playerX > -2.0;
    vis.west_chanh_dien = playerX < -6.0;
  }

  return vis;
}

