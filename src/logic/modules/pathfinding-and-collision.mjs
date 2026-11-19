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
