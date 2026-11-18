/**
 * Sculpted Sacred Statues & Iconography Builders (Three.js)
 * Multi-part procedural sculpting with LatheGeometry lotus thrones, draped kāṣāya folds,
 * serene facial proportions (uṣṇīṣa, ūrṇā, elongated earlobes), mudrās, nimbus halos,
 * and traditional sacred implements for Chùa Vĩnh Tràng.
 */
import * as THREE from 'three';

function createLotusThroneGeometry(T, radius = 0.56, height = 0.42) {
  const pts = [
    new T.Vector2(0.01, 0),
    new T.Vector2(radius * 1.12, 0),
    new T.Vector2(radius * 1.04, height * 0.18),
    new T.Vector2(radius * 0.78, height * 0.36),
    new T.Vector2(radius * 0.68, height * 0.52),
    new T.Vector2(radius * 0.92, height * 0.72),
    new T.Vector2(radius * 1.02, height * 0.88),
    new T.Vector2(radius * 0.88, height),
    new T.Vector2(0.01, height)
  ];
  return new T.LatheGeometry(pts, 24);
}

function addSereneFaceAndHead(T, parent, {
  headMat,
  hairMat = null,
  y = 1.0,
  z = 0,
  radius = 0.2,
  withCrown = false,
  crownMat = null,
  withVeil = false,
  veilMat = null,
  calmEyes = true
}) {
  const hg = new T.Group();
  hg.position.set(0, y, z);

  // Cranium slightly oval
  const cranium = new T.Mesh(new T.SphereGeometry(radius, 18, 16), headMat);
  cranium.scale.set(0.94, 1.08, 0.96);
  cranium.castShadow = true;
  hg.add(cranium);

  // Sculpted nose bridge & soft chin
  const nose = new T.Mesh(new T.ConeGeometry(radius * 0.14, radius * 0.42, 6), headMat);
  nose.position.set(0, -radius * 0.04, radius * 0.94);
  nose.rotation.x = 0.28;
  hg.add(nose);

  // Elongated auspicious Buddha earlobes (Nhĩ thùy)
  for (const side of [-1, 1]) {
    const ear = new T.Mesh(new T.CylinderGeometry(radius * 0.12, radius * 0.16, radius * 0.68, 8), headMat);
    ear.position.set(side * radius * 0.94, -radius * 0.12, -radius * 0.02);
    ear.rotation.z = side * -0.08;
    hg.add(ear);
    const lobe = new T.Mesh(new T.SphereGeometry(radius * 0.13, 8, 6), headMat);
    lobe.position.set(side * radius * 0.95, -radius * 0.46, -0.01);
    hg.add(lobe);
  }

  // Calm downcast eyes & Ūrṇā (Bạch hào)
  if (calmEyes) {
    const browMat = new T.MeshStandardMaterial({ color: 0x3E2818, roughness: 0.7 });
    for (const side of [-1, 1]) {
      const eye = new T.Mesh(
        new T.TorusGeometry(radius * 0.16, radius * 0.024, 5, 10, Math.PI),
        browMat
      );
      eye.position.set(side * radius * 0.36, radius * 0.12, radius * 0.86);
      eye.rotation.z = Math.PI;
      hg.add(eye);
    }
    const urna = new T.Mesh(
      new T.SphereGeometry(radius * 0.08, 8, 8),
      new T.MeshBasicMaterial({ color: 0xFFE684 })
    );
    urna.position.set(0, radius * 0.34, radius * 0.9);
    hg.add(urna);
  }

  // Hairline / Snail curls + Uṣṇīṣa (Nhục kế)
  const hMat = hairMat || headMat;
  if (!withCrown && !withVeil) {
    const cap = new T.Mesh(
      new T.SphereGeometry(radius * 1.03, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.56),
      hMat
    );
    cap.position.y = radius * 0.06;
    hg.add(cap);
    const usnisa = new T.Mesh(new T.SphereGeometry(radius * 0.48, 12, 10), hMat);
    usnisa.position.set(0, radius * 1.06, -radius * 0.06);
    hg.add(usnisa);
    const jewel = new T.Mesh(
      new T.SphereGeometry(radius * 0.16, 8, 8),
      new T.MeshStandardMaterial({ color: 0xFFE885, emissive: 0xFFAE38, emissiveIntensity: 0.25, metalness: 0.6, roughness: 0.25 })
    );
    jewel.position.set(0, radius * 1.48, -radius * 0.04);
    hg.add(jewel);
  }

  // Ornate Bodhisattva / Guardian Crown (Thiên quan)
  if (withCrown) {
    const cMat = crownMat || headMat;
    const band = new T.Mesh(new T.CylinderGeometry(radius * 1.06, radius * 0.98, radius * 0.42, 16), cMat);
    band.position.y = radius * 0.72;
    hg.add(band);
    for (let pi = -2; pi <= 2; pi++) {
      const ang = pi * 0.34;
      const panelH = radius * (0.95 - Math.abs(pi) * 0.16);
      const panel = new T.Mesh(new T.ConeGeometry(radius * 0.24, panelH, 6), cMat);
      panel.position.set(
        Math.sin(ang) * radius * 0.92,
        radius * 0.92 + panelH * 0.38,
        Math.cos(ang) * radius * 0.88
      );
      panel.rotation.x = 0.16;
      hg.add(panel);
    }
    const topKnot = new T.Mesh(new T.CylinderGeometry(radius * 0.34, radius * 0.44, radius * 0.72, 12), hMat);
    topKnot.position.set(0, radius * 1.15, -radius * 0.04);
    hg.add(topKnot);
  }

  // Flowing Quán Thế Âm Head Veil (Khăn trùm Quan Âm — wraps behind head -Z so +Z face is open)
  if (withVeil) {
    const vMat = veilMat || headMat;
    const hood = new T.Mesh(
      new T.CylinderGeometry(radius * 1.12, radius * 1.72, radius * 2.35, 16, 1, true, Math.PI * 0.38, Math.PI * 1.24),
      vMat
    );
    hood.material = vMat.clone ? vMat.clone() : vMat;
    hood.material.side = T.DoubleSide;
    hood.position.set(0, -radius * 0.16, -radius * 0.12);
    hg.add(hood);
    const capTop = new T.Mesh(
      new T.SphereGeometry(radius * 1.1, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.52),
      vMat
    );
    capTop.position.set(0, radius * 0.12, -radius * 0.04);
    hg.add(capTop);
    const crest = new T.Mesh(new T.ConeGeometry(radius * 0.28, radius * 0.68, 8), crownMat || headMat);
    crest.position.set(0, radius * 1.06, radius * 0.26);
    hg.add(crest);
  }

  parent.add(hg);
  return hg;
}

function addNimbusHalo(T, parent, y, z, rInner = 0.42, rOuter = 0.56, colorHex = 0xFFE38A) {
  const ring = new T.Mesh(
    new T.RingGeometry(rInner, rOuter, 28),
    new T.MeshBasicMaterial({ color: colorHex, side: T.DoubleSide })
  );
  ring.position.set(0, y, z);
  parent.add(ring);

  const innerDisc = new T.Mesh(
    new T.CircleGeometry(rInner * 0.96, 24),
    new T.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.18, side: T.DoubleSide })
  );
  innerDisc.position.set(0, y, z - 0.01);
  parent.add(innerDisc);

  // Subtle flame spikes around outer halo rim
  const rayMat = new T.MeshBasicMaterial({ color: 0xFFD060 });
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const spike = new T.Mesh(new T.ConeGeometry(rOuter * 0.08, rOuter * 0.24, 4), rayMat);
    spike.position.set(Math.cos(a) * (rOuter + rOuter * 0.08), y + Math.sin(a) * (rOuter + rOuter * 0.08), z);
    spike.rotation.z = a - Math.PI / 2;
    parent.add(spike);
  }
}

function addDrapedLotusPetals(T, parent, radius, yBase, petalMat, crimsonMat) {
  const throne = new T.Mesh(createLotusThroneGeometry(T, radius, 0.38), crimsonMat);
  throne.position.y = yBase;
  throne.castShadow = true;
  throne.receiveShadow = true;
  parent.add(throne);

  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const petal = new T.Mesh(new T.SphereGeometry(radius * 0.24, 8, 6), petalMat);
    petal.scale.set(0.85, 1.35, 0.42);
    petal.position.set(Math.cos(a) * radius * 0.88, yBase + 0.34, Math.sin(a) * radius * 0.88);
    petal.rotation.y = -a + Math.PI / 2;
    petal.rotation.x = 0.48;
    parent.add(petal);
  }
}

/**
 * 1. Sculpted Seated Buddha (Thích Ca / A Di Đà tọa thiền) — used for Nhà Hậu & interior shrines
 */
export function createSculptedSeatedBuddha(T = THREE, opts = {}) {
  const g = new T.Group();
  const bodyMat = opts.bodyMat || new T.MeshStandardMaterial({ color: 0xE2AF3B, metalness: 0.62, roughness: 0.24 });
  const innerMat = opts.innerMat || new T.MeshStandardMaterial({ color: 0xC68C28, metalness: 0.45, roughness: 0.34 });
  const crimsonMat = opts.crimsonMat || new T.MeshStandardMaterial({ color: 0x7E2A22, roughness: 0.48 });
  const hairMat = opts.hairMat || new T.MeshStandardMaterial({ color: 0x261B16, roughness: 0.55 });
  const scale = opts.scale || 1.0;

  addDrapedLotusPetals(T, g, 0.72, 0, bodyMat, crimsonMat);

  // Folded Padmāsana cross-legged robe base
  const lap = new T.Mesh(new T.CylinderGeometry(0.46, 0.64, 0.32, 18), bodyMat);
  lap.scale.set(1.22, 1.0, 0.86);
  lap.position.set(0, 0.52, 0.04);
  lap.castShadow = true;
  g.add(lap);

  // Sculpted knee folds
  for (const side of [-1, 1]) {
    const knee = new T.Mesh(new T.SphereGeometry(0.24, 12, 10), bodyMat);
    knee.scale.set(1.25, 0.76, 1.08);
    knee.position.set(side * 0.44, 0.48, 0.14);
    g.add(knee);
  }

  // Sculpted tapering chest & draped collar folds
  const torso = new T.Mesh(new T.CylinderGeometry(0.32, 0.42, 0.74, 16), bodyMat);
  torso.scale.set(1.12, 1, 0.82);
  torso.position.set(0, 0.96, 0);
  torso.castShadow = true;
  g.add(torso);

  const sash = new T.Mesh(new T.TorusGeometry(0.35, 0.065, 8, 20), innerMat);
  sash.position.set(0, 1.02, 0.03);
  sash.rotation.set(Math.PI / 2.4, 0.42, 0);
  g.add(sash);

  // Draped forearms resting in Dhyāna (meditation) mudrā + golden alms bowl / pearl
  for (const side of [-1, 1]) {
    const sh = new T.Mesh(new T.SphereGeometry(0.14, 10, 8), bodyMat);
    sh.position.set(side * 0.36, 1.24, 0);
    g.add(sh);
    const arm = new T.Mesh(new T.CylinderGeometry(0.095, 0.11, 0.54, 10), bodyMat);
    arm.position.set(side * 0.42, 0.96, 0.08);
    arm.rotation.set(-0.32, 0, side * 0.24);
    g.add(arm);
    const forearm = new T.Mesh(new T.CylinderGeometry(0.085, 0.095, 0.36, 10), bodyMat);
    forearm.position.set(side * 0.22, 0.7, 0.28);
    forearm.rotation.set(Math.PI / 2.2, 0, side * -1.1);
    g.add(forearm);
  }
  const almsBowl = new T.Mesh(
    new T.SphereGeometry(0.16, 14, 10, 0, Math.PI * 2, Math.PI * 0.42, Math.PI * 0.58),
    innerMat
  );
  almsBowl.position.set(0, 0.76, 0.36);
  g.add(almsBowl);

  addSereneFaceAndHead(T, g, {
    headMat: bodyMat,
    hairMat,
    y: 1.54,
    z: 0.02,
    radius: 0.22
  });
  addNimbusHalo(T, g, 1.58, -0.24, 0.48, 0.64, 0xFFE684);

  g.scale.setScalar(scale);
  return g;
}

/**
 * 2. Sculpted Standing Bodhisattva ('quan_am' | 'dia_tang' | 'the_chi')
 */
export function createSculptedBodhisattva(T = THREE, opts = {}) {
  const g = new T.Group();
  const variant = opts.variant || 'quan_am';
  const isIvory = variant === 'quan_am' && opts.ivory !== false;
  const bodyMat = isIvory
    ? new T.MeshStandardMaterial({ color: 0xF5EFE3, roughness: 0.38, metalness: 0.06 })
    : opts.bodyMat || new T.MeshStandardMaterial({ color: 0xE2AF3B, metalness: 0.6, roughness: 0.24 });
  const trimMat = opts.trimMat || new T.MeshStandardMaterial({ color: 0xE2AF3B, metalness: 0.62, roughness: 0.24 });
  const crimsonMat = opts.crimsonMat || new T.MeshStandardMaterial({ color: 0x7E2A22, roughness: 0.48 });
  const hairMat = new T.MeshStandardMaterial({ color: 0x241B16, roughness: 0.55 });
  const scale = opts.scale || 1.0;

  addDrapedLotusPetals(T, g, 0.56, 0, trimMat, crimsonMat);

  // Flowing pleated standing skirt + layered upper robe (Lathe profile for smooth silhouette)
  const robePts = [
    new T.Vector2(0.01, 0),
    new T.Vector2(0.46, 0),
    new T.Vector2(0.4, 0.45),
    new T.Vector2(0.32, 0.95),
    new T.Vector2(0.24, 1.35),
    new T.Vector2(0.34, 1.62),
    new T.Vector2(0.26, 1.88),
    new T.Vector2(0.12, 1.94)
  ];
  const robe = new T.Mesh(new T.LatheGeometry(robePts, 20), bodyMat);
  robe.position.y = 0.36;
  robe.castShadow = true;
  g.add(robe);

  // Vertical pleat ribs
  for (let pi = 0; pi < 8; pi++) {
    const a = (pi / 8) * Math.PI * 2;
    const pleat = new T.Mesh(new T.CylinderGeometry(0.028, 0.048, 1.35, 6), bodyMat);
    pleat.position.set(Math.cos(a) * 0.33, 1.05, Math.sin(a) * 0.33);
    g.add(pleat);
  }

  // Golden celestial scarf draped across chest & sides
  const chestSash = new T.Mesh(new T.TorusGeometry(0.28, 0.04, 7, 18), trimMat);
  chestSash.position.set(0, 1.78, 0.04);
  chestSash.rotation.set(Math.PI / 2.6, 0.35, 0);
  g.add(chestSash);

  // Mudrā Arms & Sacred Attributes
  for (const side of [-1, 1]) {
    const sh = new T.Mesh(new T.SphereGeometry(0.11, 8, 8), bodyMat);
    sh.position.set(side * 0.3, 1.96, 0);
    g.add(sh);
  }
  if (variant === 'dia_tang') {
    // Địa Tạng: Left hand holds glowing Cintāmaṇi pearl, right holds 6-ring Khakkara staff
    const armL = new T.Mesh(new T.CylinderGeometry(0.07, 0.09, 0.48, 8), bodyMat);
    armL.position.set(-0.32, 1.68, 0.16);
    armL.rotation.set(-0.65, 0, -0.18);
    g.add(armL);
    const pearl = new T.Mesh(
      new T.SphereGeometry(0.085, 10, 10),
      new T.MeshBasicMaterial({ color: 0xFFE985 })
    );
    pearl.position.set(-0.24, 1.66, 0.38);
    g.add(pearl);

    const armR = new T.Mesh(new T.CylinderGeometry(0.07, 0.09, 0.48, 8), bodyMat);
    armR.position.set(0.34, 1.72, 0.14);
    armR.rotation.set(-0.55, 0, 0.18);
    g.add(armR);
    const staff = new T.Mesh(new T.CylinderGeometry(0.025, 0.028, 2.15, 8), trimMat);
    staff.position.set(0.42, 1.44, 0.22);
    g.add(staff);
    const staffTop = new T.Mesh(new T.TorusGeometry(0.095, 0.02, 6, 14), trimMat);
    staffTop.position.set(0.42, 2.54, 0.22);
    g.add(staffTop);
  } else if (variant === 'the_chi') {
    // Đại Thế Chí: holds lotus bud stem
    const armL = new T.Mesh(new T.CylinderGeometry(0.075, 0.09, 0.48, 8), bodyMat);
    armL.position.set(-0.28, 1.66, 0.2);
    armL.rotation.set(-0.85, 0, -0.2);
    g.add(armL);
    const armR = new T.Mesh(new T.CylinderGeometry(0.075, 0.09, 0.48, 8), bodyMat);
    armR.position.set(0.28, 1.66, 0.2);
    armR.rotation.set(-0.85, 0, 0.2);
    g.add(armR);
    const stem = new T.Mesh(new T.CylinderGeometry(0.016, 0.018, 0.55, 6), trimMat);
    stem.position.set(0.18, 1.78, 0.34);
    g.add(stem);
    const bud = new T.Mesh(
      new T.ConeGeometry(0.085, 0.18, 8),
      new T.MeshStandardMaterial({ color: 0xF579A8, roughness: 0.35 })
    );
    bud.position.set(0.18, 2.1, 0.34);
    g.add(bud);
  } else {
    // Quán Thế Âm: left hand holds Ngọc Tịnh Bình (Cam Lộ vase), right hand raises Abhaya / willow branch
    const armL = new T.Mesh(new T.CylinderGeometry(0.075, 0.09, 0.48, 8), bodyMat);
    armL.position.set(-0.32, 1.68, 0.18);
    armL.rotation.set(-0.72, 0, -0.22);
    g.add(armL);
    const vase = new T.Mesh(
      new T.CylinderGeometry(0.048, 0.11, 0.28, 12),
      new T.MeshStandardMaterial({ color: 0x3D9E6E, roughness: 0.24, metalness: 0.16 })
    );
    vase.position.set(-0.26, 1.62, 0.38);
    g.add(vase);

    const armR = new T.Mesh(new T.CylinderGeometry(0.075, 0.09, 0.48, 8), bodyMat);
    armR.position.set(0.32, 1.82, 0.18);
    armR.rotation.set(-0.98, 0, 0.18);
    g.add(armR);
    const palm = new T.Mesh(new T.SphereGeometry(0.068, 8, 8), bodyMat);
    palm.scale.set(0.9, 1.35, 0.55);
    palm.position.set(0.28, 2.02, 0.34);
    g.add(palm);
  }

  addSereneFaceAndHead(T, g, {
    headMat: bodyMat,
    hairMat,
    y: 2.38,
    z: 0.02,
    radius: 0.19,
    withCrown: variant !== 'quan_am',
    crownMat: trimMat,
    withVeil: variant === 'quan_am',
    veilMat: bodyMat
  });
  addNimbusHalo(T, g, 2.42, -0.22, 0.36, 0.48, 0xFFE58C);

  g.scale.setScalar(scale);
  return g;
}

/**
 * 3. Sculpted Dharma Guardians ('ho_phap' = Vi Đà Hộ Pháp | 'tieu_dien' = Tiêu Diện Đại Sĩ)
 */
export function createSculptedGuardian(T = THREE, opts = {}) {
  const g = new T.Group();
  const isHoPhap = opts.variant !== 'tieu_dien';
  const armorMat = isHoPhap
    ? new T.MeshStandardMaterial({ color: 0xE2AF3B, metalness: 0.65, roughness: 0.24 })
    : new T.MeshStandardMaterial({ color: 0x7A4B2A, metalness: 0.42, roughness: 0.34 });
  const redMat = new T.MeshStandardMaterial({ color: 0x8E2019, roughness: 0.44 });
  const goldMat = new T.MeshStandardMaterial({ color: 0xF0C24B, metalness: 0.68, roughness: 0.22 });
  const scale = opts.scale || 1.0;

  addDrapedLotusPetals(T, g, 0.52, 0, goldMat, redMat);

  // Armored greaves & martial stance tunic
  const lowerTunic = new T.Mesh(new T.CylinderGeometry(0.32, 0.44, 0.85, 14), redMat);
  lowerTunic.position.y = 0.78;
  lowerTunic.castShadow = true;
  g.add(lowerTunic);

  // Layered chest cuirass & dragon-scale belt
  const cuirass = new T.Mesh(new T.CylinderGeometry(0.36, 0.31, 0.68, 14), armorMat);
  cuirass.position.y = 1.48;
  cuirass.castShadow = true;
  g.add(cuirass);

  const belt = new T.Mesh(new T.CylinderGeometry(0.34, 0.34, 0.14, 14), goldMat);
  belt.position.y = 1.18;
  g.add(belt);

  // Winged pauldrons & flowing celestial ribbons
  for (const side of [-1, 1]) {
    const pauldron = new T.Mesh(new T.SphereGeometry(0.17, 10, 8), goldMat);
    pauldron.scale.set(1.25, 0.8, 1.0);
    pauldron.position.set(side * 0.4, 1.78, 0);
    g.add(pauldron);

    const arm = new T.Mesh(new T.CylinderGeometry(0.085, 0.1, 0.52, 10), armorMat);
    arm.position.set(side * 0.42, 1.46, 0.1);
    arm.rotation.set(-0.42, 0, side * 0.18);
    g.add(arm);

    const ribbon = new T.Mesh(new T.TorusGeometry(0.32, 0.032, 6, 14, Math.PI * 1.15), redMat);
    ribbon.position.set(side * 0.32, 1.4, -0.14);
    ribbon.rotation.y = side * 0.7;
    g.add(ribbon);
  }

  // Head & Guardian Helm / Flaming Crest
  addSereneFaceAndHead(T, g, {
    headMat: isHoPhap ? goldMat : new T.MeshStandardMaterial({ color: 0x4E6878, roughness: 0.38, metalness: 0.25 }),
    hairMat: redMat,
    y: 2.04,
    z: 0,
    radius: 0.2,
    withCrown: true,
    crownMat: goldMat,
    calmEyes: isHoPhap
  });

  if (!isHoPhap) {
    // Tiêu Diện fierce brow crest & sacred tongue emblem
    const flameCrest = new T.Mesh(new T.ConeGeometry(0.09, 0.36, 6), new T.MeshBasicMaterial({ color: 0xFF6B2B }));
    flameCrest.position.set(0, 2.46, 0.08);
    g.add(flameCrest);
  }

  // Upright Vajra Pestle (Vi Đà Chày Kim Cang) / Halberd Banner
  const weaponX = isHoPhap ? 0.48 : -0.48;
  const staff = new T.Mesh(new T.CylinderGeometry(0.032, 0.036, 2.25, 8), goldMat);
  staff.position.set(weaponX, 1.5, 0.2);
  g.add(staff);
  const vajraTip = new T.Mesh(new T.OctahedronGeometry(0.11, 0), isHoPhap ? goldMat : redMat);
  vajraTip.position.set(weaponX, 2.66, 0.2);
  g.add(vajraTip);

  addNimbusHalo(T, g, 2.08, -0.24, 0.38, 0.5, 0xFFE28A);
  g.scale.setScalar(scale);
  return g;
}

/**
 * 4. Sculpted Venerable Patriarch Abbot (Chư vị Tổ Sư khai sơn) — Nhà Tổ altar
 */
export function createSculptedPatriarch(T = THREE, opts = {}) {
  const g = new T.Group();
  const robeMat = opts.robeMat || new T.MeshStandardMaterial({ color: 0x8F4920, roughness: 0.5 });
  const goldMat = opts.goldMat || new T.MeshStandardMaterial({ color: 0xE2AF3B, metalness: 0.58, roughness: 0.26 });
  const skinMat = opts.skinMat || new T.MeshStandardMaterial({ color: 0xE8B98E, roughness: 0.52 });
  const scale = opts.scale || 1.0;

  // Carved lacquer Dharma chair base
  const seat = new T.Mesh(new T.BoxGeometry(0.76, 0.22, 0.68), new T.MeshStandardMaterial({ color: 0x3D1B0D, roughness: 0.42 }));
  seat.position.y = 0.11;
  g.add(seat);
  const backRest = new T.Mesh(new T.BoxGeometry(0.72, 1.05, 0.1), goldMat);
  backRest.position.set(0, 0.64, -0.28);
  g.add(backRest);

  const legs = new T.Mesh(new T.CylinderGeometry(0.32, 0.4, 0.28, 12), robeMat);
  legs.position.set(0, 0.34, 0.04);
  g.add(legs);
  const torso = new T.Mesh(new T.CylinderGeometry(0.24, 0.31, 0.58, 12), robeMat);
  torso.position.set(0, 0.72, 0.02);
  g.add(torso);
  const shawl = new T.Mesh(new T.TorusGeometry(0.26, 0.048, 7, 16), goldMat);
  shawl.position.set(0, 0.8, 0.04);
  shawl.rotation.set(Math.PI / 2.5, 0.45, 0);
  g.add(shawl);

  // Sutra scroll in lap
  const scroll = new T.Mesh(new T.CylinderGeometry(0.032, 0.032, 0.34, 8), goldMat);
  scroll.rotation.z = Math.PI / 2;
  scroll.position.set(0, 0.62, 0.26);
  g.add(scroll);

  addSereneFaceAndHead(T, g, {
    headMat: skinMat,
    hairMat: skinMat,
    y: 1.18,
    z: 0.03,
    radius: 0.16,
    calmEyes: true
  });
  addNimbusHalo(T, g, 1.2, -0.18, 0.28, 0.38, 0xFFD970);

  g.scale.setScalar(scale);
  return g;
}

/**
 * 5. Sculpted Outdoor White-Marble Quán Thế Âm & Outdoor Garden Arhats
 */
export function createSculptedQuanAmOutdoor(T = THREE, opts = {}) {
  return createSculptedBodhisattva(T, {
    variant: 'quan_am',
    ivory: true,
    trimMat: new T.MeshStandardMaterial({ color: 0xE6B94C, metalness: 0.48, roughness: 0.3 }),
    crimsonMat: new T.MeshStandardMaterial({ color: 0xF08FB2, roughness: 0.42 }),
    scale: opts.scale || 1.35
  });
}

export function createSculptedGardenArhat(T = THREE, idx = 0, opts = {}) {
  const g = new T.Group();
  const stoneMat = opts.stoneMat || new T.MeshStandardMaterial({ color: 0xF0EADF, roughness: 0.56 });
  const trimMat = new T.MeshStandardMaterial({ color: 0xD8A842, roughness: 0.38, metalness: 0.35 });
  const lotusMat = new T.MeshStandardMaterial({ color: 0xDC8A9F, roughness: 0.46 });

  addDrapedLotusPetals(T, g, 0.42, 0, lotusMat, stoneMat);
  const skirt = new T.Mesh(new T.CylinderGeometry(0.28, 0.38, 0.92, 12), stoneMat);
  skirt.position.y = 0.82;
  skirt.castShadow = true;
  g.add(skirt);
  const shawl = new T.Mesh(new T.TorusGeometry(0.28, 0.042, 6, 16), trimMat);
  shawl.position.set(0, 1.06, 0.02);
  shawl.rotation.set(Math.PI / 2.5, idx % 2 === 0 ? 0.4 : -0.4, 0);
  g.add(shawl);

  // Attribute variation
  if (idx % 3 === 0) {
    const staff = new T.Mesh(new T.CylinderGeometry(0.02, 0.024, 1.65, 6), trimMat);
    staff.position.set(0.32, 1.15, 0.14);
    g.add(staff);
  } else if (idx % 3 === 1) {
    const bowl = new T.Mesh(new T.SphereGeometry(0.12, 10, 8, 0, Math.PI * 2, Math.PI * 0.4, Math.PI * 0.6), trimMat);
    bowl.position.set(0, 0.98, 0.3);
    g.add(bowl);
  } else {
    const scroll = new T.Mesh(new T.CylinderGeometry(0.032, 0.032, 0.28, 8), trimMat);
    scroll.rotation.z = Math.PI / 4;
    scroll.position.set(0.22, 1.02, 0.24);
    g.add(scroll);
  }

  addSereneFaceAndHead(T, g, {
    headMat: stoneMat,
    hairMat: stoneMat,
    y: 1.48,
    z: 0.02,
    radius: 0.17,
    calmEyes: true
  });
  addNimbusHalo(T, g, 1.5, -0.18, 0.26, 0.34, 0xFFE599);

  if (opts.scale) g.scale.setScalar(opts.scale);
  return g;
}

/**
 * 6. Sculpted Seated Gilded Bodhisattva (Bồ Tát tọa đài sen chầu Tam Bảo — như ảnh Chánh Điện thật)
 */
export function createSeatedBodhisattva(T = THREE, opts = {}) {
  const g = new T.Group();
  const variant = opts.variant || 'quan_am';
  const bodyMat = opts.bodyMat || new T.MeshStandardMaterial({ color: 0xE5B23A, metalness: 0.68, roughness: 0.22 });
  const trimMat = opts.trimMat || new T.MeshStandardMaterial({ color: 0xCE8D24, metalness: 0.58, roughness: 0.28 });
  const crimsonMat = opts.crimsonMat || new T.MeshStandardMaterial({ color: 0x7A2319, roughness: 0.44 });
  const hairMat = new T.MeshStandardMaterial({ color: 0x241B16, roughness: 0.55 });
  const scale = opts.scale || 1.0;

  addDrapedLotusPetals(T, g, 0.58, 0, trimMat, crimsonMat);

  const lap = new T.Mesh(new T.CylinderGeometry(0.38, 0.54, 0.28, 16), bodyMat);
  lap.scale.set(1.18, 1.0, 0.86);
  lap.position.set(0, 0.48, 0.04);
  lap.castShadow = true;
  g.add(lap);

  const torso = new T.Mesh(new T.CylinderGeometry(0.26, 0.35, 0.68, 16), bodyMat);
  torso.scale.set(1.08, 1, 0.82);
  torso.position.set(0, 0.9, 0);
  torso.castShadow = true;
  g.add(torso);

  const sash = new T.Mesh(new T.TorusGeometry(0.28, 0.05, 8, 18), trimMat);
  sash.position.set(0, 0.96, 0.04);
  sash.rotation.set(Math.PI / 2.4, 0.38, 0);
  g.add(sash);

  for (const side of [-1, 1]) {
    const arm = new T.Mesh(new T.CylinderGeometry(0.075, 0.09, 0.44, 10), bodyMat);
    arm.position.set(side * 0.32, 0.92, 0.12);
    arm.rotation.set(-0.55, 0, side * 0.22);
    g.add(arm);
    const hand = new T.Mesh(new T.SphereGeometry(0.065, 8, 8), bodyMat);
    hand.scale.set(0.75, 1.25, 0.65);
    hand.position.set(side * 0.14, 0.84, 0.3);
    g.add(hand);
  }

  addSereneFaceAndHead(T, g, {
    headMat: bodyMat,
    hairMat,
    y: 1.42,
    z: 0.02,
    radius: 0.185,
    withCrown: true,
    crownMat: trimMat,
    withVeil: variant === 'quan_am',
    veilMat: bodyMat
  });

  g.scale.setScalar(scale);
  return g;
}

/**
 * 7. Standing Crimson-Robed Venerating Patriarch / Master (Tượng Tổ Sư / Hòa Thượng áo đỏ mão tỳ lư chắp tay chầu Phật)
 * Matches real Chùa Vĩnh Tràng Chánh Điện foreground statue (image_d908b99f.png).
 */
export function createStandingCrimsonMonkStatue(T = THREE, opts = {}) {
  const g = new T.Group();
  const crimsonRobeMat = opts.robeMat || new T.MeshStandardMaterial({
    color: 0x9E1F1D,
    roughness: 0.42,
    metalness: 0.08
  });
  const deepFoldMat = new T.MeshStandardMaterial({
    color: 0x6E1212,
    roughness: 0.48,
    metalness: 0.06
  });
  const goldTrimMat = opts.goldMat || new T.MeshStandardMaterial({
    color: 0xE2AF3B,
    metalness: 0.65,
    roughness: 0.24
  });
  const skinMat = opts.skinMat || new T.MeshStandardMaterial({
    color: 0xD89E6E,
    roughness: 0.46,
    metalness: 0.04
  });
  const baseMat = new T.MeshStandardMaterial({ color: 0x1E120C, roughness: 0.36 });
  const scale = opts.scale || 1.0;

  // Dark carved wood plinth
  const plinth = new T.Mesh(new T.CylinderGeometry(0.36, 0.42, 0.14, 16), baseMat);
  plinth.position.y = 0.07;
  plinth.castShadow = true;
  plinth.receiveShadow = true;
  g.add(plinth);

  // Tall flowing crimson kāṣāya robe with pleated folds
  const robePts = [
    new T.Vector2(0.01, 0),
    new T.Vector2(0.34, 0),
    new T.Vector2(0.31, 0.48),
    new T.Vector2(0.28, 1.02),
    new T.Vector2(0.3, 1.46),
    new T.Vector2(0.24, 1.66),
    new T.Vector2(0.11, 1.72)
  ];
  const robe = new T.Mesh(new T.LatheGeometry(robePts, 20), crimsonRobeMat);
  robe.position.y = 0.14;
  robe.castShadow = true;
  g.add(robe);

  // Vertical draped crimson sleeve & robe folds
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const fold = new T.Mesh(new T.CylinderGeometry(0.026, 0.044, 1.48, 6), i % 2 === 0 ? crimsonRobeMat : deepFoldMat);
    fold.position.set(Math.cos(a) * 0.27, 0.9, Math.sin(a) * 0.27);
    g.add(fold);
  }

  // Wide ceremonial draped sleeves & clasped Añjali hands (+Z forward)
  for (const side of [-1, 1]) {
    const sleeve = new T.Mesh(new T.CylinderGeometry(0.09, 0.16, 0.56, 10), crimsonRobeMat);
    sleeve.position.set(side * 0.22, 1.38, 0.16);
    sleeve.rotation.set(-0.78, 0, side * 0.26);
    sleeve.castShadow = true;
    g.add(sleeve);

    const sleeveTrim = new T.Mesh(new T.TorusGeometry(0.11, 0.016, 6, 14), goldTrimMat);
    sleeveTrim.position.set(side * 0.12, 1.46, 0.34);
    sleeveTrim.rotation.x = Math.PI / 3;
    g.add(sleeveTrim);

    const palm = new T.Mesh(new T.BoxGeometry(0.036, 0.18, 0.09), skinMat);
    palm.position.set(side * 0.024, 1.55, 0.38);
    palm.rotation.set(-0.24, 0, side * -0.08);
    g.add(palm);
  }

  // Mala prayer beads hanging from clasped wrists
  const mala = new T.Mesh(
    new T.TorusGeometry(0.08, 0.012, 6, 18),
    new T.MeshStandardMaterial({ color: 0x3A1D0E, roughness: 0.5 })
  );
  mala.scale.set(0.65, 1.65, 0.65);
  mala.position.set(0, 1.36, 0.37);
  g.add(mala);

  // Golden kāṣāya clasp & collar border
  const collar = new T.Mesh(new T.TorusGeometry(0.16, 0.022, 6, 16), goldTrimMat);
  collar.position.set(0, 1.76, 0.03);
  collar.rotation.x = Math.PI / 2.2;
  g.add(collar);

  // Venerable sculpted head
  const hg = addSereneFaceAndHead(T, g, {
    headMat: skinMat,
    hairMat: skinMat,
    y: 1.98,
    z: 0.02,
    radius: 0.165,
    withCrown: false,
    withVeil: false,
    calmEyes: true
  });
  // Remove Buddha topknot jewel/usnisa look by adding ceremonial red-and-gold Mão Hiệp Chưởng / Tỳ Lư
  const hatBase = new T.Mesh(new T.CylinderGeometry(0.185, 0.168, 0.12, 18), goldTrimMat);
  hatBase.position.set(0, 0.1, 0);
  hg.add(hatBase);
  const hatDome = new T.Mesh(new T.CylinderGeometry(0.215, 0.185, 0.22, 18), crimsonRobeMat);
  hatDome.position.set(0, 0.24, -0.01);
  hg.add(hatDome);
  const hatRim = new T.Mesh(new T.TorusGeometry(0.21, 0.018, 6, 20), goldTrimMat);
  hatRim.position.set(0, 0.34, -0.01);
  hatRim.rotation.x = Math.PI / 2;
  hg.add(hatRim);
  for (let p = -2; p <= 2; p++) {
    const ang = p * 0.36;
    const petal = new T.Mesh(new T.BoxGeometry(0.075, 0.16, 0.022), goldTrimMat);
    petal.position.set(Math.sin(ang) * 0.195, 0.24, Math.cos(ang) * 0.195);
    petal.rotation.y = ang;
    hg.add(petal);
  }

  g.scale.setScalar(scale);
  return g;
}

/**
 * 8. Thousand-Armed Thousand-Eyed Avalokiteshvara (Phật Bà Nghìn Mắt Nghìn Tay — Thiên Thủ Thiên Nhãn)
 * Multi-tier lotus pedestal + seated golden Bodhisattva + symmetrical radiating fan of 24 golden arms & halo.
 */
export function createThousandArmedQuanAm(T = THREE, opts = {}) {
  const g = new T.Group();
  const goldMat = opts.bodyMat || new T.MeshStandardMaterial({ color: 0xE6B43C, metalness: 0.72, roughness: 0.22 });
  const deepGoldMat = new T.MeshStandardMaterial({ color: 0xC88A22, metalness: 0.62, roughness: 0.28 });
  const crimsonMat = new T.MeshStandardMaterial({ color: 0x7A1E16, roughness: 0.42 });
  const scale = opts.scale || 1.0;

  // Sculpted lotus throne
  addDrapedLotusPetals(T, g, 0.68, 0, goldMat, crimsonMat);

  // radiating mandorla backplate & 24-arm golden fan (kept visible even when GLB statue mounts in front!)
  const haloGroup = new T.Group();
  haloGroup.position.set(0, 1.28, -0.22);

  const outerRim = new T.Mesh(new T.RingGeometry(0.92, 1.04, 36), goldMat);
  outerRim.material = goldMat.clone();
  outerRim.material.side = T.DoubleSide;
  haloGroup.add(outerRim);

  const innerGlow = new T.Mesh(
    new T.CircleGeometry(0.92, 32),
    new T.MeshStandardMaterial({
      color: 0x5E1910,
      emissive: 0x8A3210,
      emissiveIntensity: 0.35,
      roughness: 0.45,
      side: T.DoubleSide
    })
  );
  innerGlow.position.z = -0.02;
  haloGroup.add(innerGlow);

  const armCount = 24;
  for (let i = 0; i < armCount; i++) {
    const frac = i / (armCount - 1);
    const ang = -Math.PI * 0.12 + frac * Math.PI * 1.24;
    const armGrp = new T.Group();
    const rMid = 0.56 + (i % 2) * 0.14;
    const armShaft = new T.Mesh(new T.CylinderGeometry(0.026, 0.038, 0.58, 8), i % 2 === 0 ? goldMat : deepGoldMat);
    armShaft.position.set(Math.cos(ang) * rMid, Math.sin(ang) * rMid, 0.03 + (i % 2) * 0.02);
    armShaft.rotation.z = ang - Math.PI / 2;
    armGrp.add(armShaft);

    const palm = new T.Mesh(new T.SphereGeometry(0.052, 8, 6), goldMat);
    palm.scale.set(0.75, 1.35, 0.42);
    palm.position.set(Math.cos(ang) * (rMid + 0.3), Math.sin(ang) * (rMid + 0.3), 0.045);
    palm.rotation.z = ang - Math.PI / 2;
    armGrp.add(palm);

    const eyeDot = new T.Mesh(
      new T.SphereGeometry(0.016, 6, 6),
      new T.MeshBasicMaterial({ color: 0xFFF3B0 })
    );
    eyeDot.position.set(Math.cos(ang) * (rMid + 0.3), Math.sin(ang) * (rMid + 0.3), 0.072);
    armGrp.add(eyeDot);

    haloGroup.add(armGrp);
  }
  g.add(haloGroup);

  // Core seated figure (can be replaced by Meshy tuong-phat-nghin-mat-nghin-tay.glb while preserving halo fan)
  const coreBody = createSeatedBodhisattva(T, {
    variant: 'the_chi',
    bodyMat: goldMat,
    trimMat: deepGoldMat,
    crimsonMat,
    scale: 1.02
  });
  coreBody.position.set(0, 0.04, 0.05);
  // Extra multi-tiered eleven-head / Amitabha tall crown
  const tallCrown = new T.Mesh(new T.ConeGeometry(0.14, 0.42, 10), goldMat);
  tallCrown.position.set(0, 1.88, 0.04);
  coreBody.add(tallCrown);
  g.add(coreBody);
  g.userData.placeholderBody = coreBody;

  g.scale.setScalar(scale);
  return g;
}

/**
 * 9. Indoor Sacred Sleeping Buddha Canopy Bed Shrine (Khám Thờ & Giường Bệ Chỗ Ngủ Của Phật)
 * Ornate carved rosewood & gold-leaf ceremonial couch bed, tied-back crimson silk curtains,
 * embroidered lotus bolster pillow, and serene golden Reclining Buddha resting on his right side.
 */
export function createIndoorSleepingBuddhaBed(T = THREE, opts = {}) {
  const g = new T.Group();
  const darkRosewoodMat = new T.MeshStandardMaterial({ color: 0x2B130B, roughness: 0.32, metalness: 0.1 });
  const crimsonSilkMat = new T.MeshStandardMaterial({ color: 0x8F1D18, roughness: 0.44, side: T.DoubleSide });
  const goldMat = new T.MeshStandardMaterial({ color: 0xE6B43C, metalness: 0.68, roughness: 0.22 });
  const robeGoldMat = new T.MeshStandardMaterial({ color: 0xD49B2A, metalness: 0.56, roughness: 0.28 });
  const mattressMat = new T.MeshStandardMaterial({ color: 0xA6261B, roughness: 0.52 });
  const hairMat = new T.MeshStandardMaterial({ color: 0x241A15, roughness: 0.58 });
  const scale = opts.scale || 1.0;

  // 1. Stepped Rosewood Ceremonial Couch Bed ("Giường Bệ Long Sàng Chỗ Ngủ Của Phật" — width 3.4m, depth 1.55m)
  const plinth = new T.Mesh(new T.BoxGeometry(3.48, 0.22, 1.62), darkRosewoodMat);
  plinth.position.y = 0.11;
  plinth.castShadow = true;
  plinth.receiveShadow = true;
  g.add(plinth);

  const bedFrame = new T.Mesh(new T.BoxGeometry(3.26, 0.68, 1.44), darkRosewoodMat);
  bedFrame.position.y = 0.56;
  bedFrame.castShadow = true;
  g.add(bedFrame);

  const bedGoldRim = new T.Mesh(new T.BoxGeometry(3.34, 0.08, 1.52), goldMat);
  bedGoldRim.position.y = 0.92;
  g.add(bedGoldRim);

  // Carved gilded lotus relief panels along front of bed
  for (const rx of [-1.1, 0, 1.1]) {
    const panel = new T.Mesh(new T.BoxGeometry(0.82, 0.38, 0.05), goldMat);
    panel.position.set(rx, 0.56, 0.74);
    g.add(panel);
  }

  // Brocade silk sleeping mattress & carved headboard/footboard armrests
  const mattress = new T.Mesh(new T.BoxGeometry(3.06, 0.14, 1.26), mattressMat);
  mattress.position.y = 0.99;
  g.add(mattress);

  for (const sx of [-1.58, 1.58]) {
    const sideRest = new T.Mesh(new T.BoxGeometry(0.14, 0.48, 1.38), darkRosewoodMat);
    sideRest.position.set(sx, 1.16, 0);
    g.add(sideRest);
    const sideCap = new T.Mesh(new T.BoxGeometry(0.18, 0.07, 1.42), goldMat);
    sideCap.position.set(sx, 1.42, 0);
    g.add(sideCap);
  }
  // Low carved backrest rail + open gilded lattice finials (keeps sightline open to dining platforms & monk quarters behind)
  const backRail = new T.Mesh(new T.BoxGeometry(3.28, 0.42, 0.12), darkRosewoodMat);
  backRail.position.set(0, 1.24, -0.68);
  g.add(backRail);
  const backTopBar = new T.Mesh(new T.BoxGeometry(3.32, 0.1, 0.14), goldMat);
  backTopBar.position.set(0, 3.04, -0.68);
  g.add(backTopBar);
  for (const bx of [-0.92, 0, 0.92]) {
    const mullion = new T.Mesh(new T.CylinderGeometry(0.025, 0.03, 1.62, 8), goldMat);
    mullion.position.set(bx, 2.22, -0.68);
    g.add(mullion);
  }
  const backHalo = new T.Mesh(new T.RingGeometry(0.36, 0.48, 28), goldMat);
  backHalo.position.set(-0.92, 1.88, -0.66);
  g.add(backHalo);

  // 2. Four Canopy Bed Pillars, Carved Gilded Canopy Roof & Tied-Back Crimson Silk Curtains ("Khám Thờ Màn Thêu")
  for (const px of [-1.58, 1.58]) {
    for (const pz of [-0.66, 0.66]) {
      const post = new T.Mesh(new T.CylinderGeometry(0.055, 0.065, 2.35, 10), darkRosewoodMat);
      post.position.set(px, 2.08, pz);
      g.add(post);
    }
  }
  const canopyFrame = new T.Mesh(new T.BoxGeometry(3.48, 0.24, 1.58), darkRosewoodMat);
  canopyFrame.position.y = 3.28;
  g.add(canopyFrame);
  const canopyValance = new T.Mesh(new T.BoxGeometry(3.54, 0.18, 1.64), goldMat);
  canopyValance.position.set(0, 3.12, 0);
  g.add(canopyValance);

  // Tied-back crimson brocade curtains on left & right front posts (framing the sleeping Buddha clearly!)
  for (const side of [-1, 1]) {
    const drapeTop = new T.Mesh(new T.CylinderGeometry(0.12, 0.26, 1.05, 10), crimsonSilkMat);
    drapeTop.position.set(side * 1.42, 2.55, 0.64);
    drapeTop.rotation.z = side * 0.16;
    g.add(drapeTop);
    const sashTie = new T.Mesh(new T.TorusGeometry(0.16, 0.025, 6, 14), goldMat);
    sashTie.position.set(side * 1.48, 2.04, 0.64);
    sashTie.rotation.x = Math.PI / 2;
    g.add(sashTie);
  }

  // 3. Procedural Reclining Buddha resting peacefully on right side (replaced cleanly when cho-ngu-cua-phat.glb loads)
  const recBuddha = new T.Group();
  recBuddha.position.set(0, 1.06, 0.04);

  // Crimson & gold lotus bolster pillow on left (-X)
  const bolster = new T.Mesh(new T.CylinderGeometry(0.18, 0.18, 0.62, 16), crimsonSilkMat);
  bolster.rotation.x = Math.PI / 2;
  bolster.position.set(-1.08, 0.18, 0);
  recBuddha.add(bolster);
  for (const bz of [-0.31, 0.31]) {
    const cap = new T.Mesh(new T.CircleGeometry(0.18, 16), goldMat);
    cap.position.set(-1.08, 0.18, bz);
    if (bz < 0) cap.rotation.y = Math.PI;
    recBuddha.add(cap);
  }

  // Reclining torso & draped robe legs extending toward +X
  const torso = new T.Mesh(new T.CylinderGeometry(0.24, 0.28, 1.05, 16), goldMat);
  torso.rotation.z = -Math.PI / 2 + 0.12;
  torso.position.set(-0.36, 0.3, 0);
  torso.castShadow = true;
  recBuddha.add(torso);

  const legs = new T.Mesh(new T.CylinderGeometry(0.16, 0.25, 1.18, 16), robeGoldMat);
  legs.rotation.z = -Math.PI / 2 + 0.03;
  legs.position.set(0.68, 0.23, 0);
  legs.castShadow = true;
  recBuddha.add(legs);

  // Stacked auspicious feet on lotus rest (+X)
  const feetRest = new T.Mesh(new T.CylinderGeometry(0.2, 0.22, 0.12, 12), crimsonSilkMat);
  feetRest.rotation.z = Math.PI / 2;
  feetRest.position.set(1.32, 0.2, 0);
  recBuddha.add(feetRest);

  // Right arm supporting serene head, left arm resting peacefully along hip
  const rightUpperArm = new T.Mesh(new T.CylinderGeometry(0.065, 0.075, 0.38, 10), goldMat);
  rightUpperArm.position.set(-0.88, 0.24, 0.14);
  rightUpperArm.rotation.z = 0.52;
  recBuddha.add(rightUpperArm);
  const leftArm = new T.Mesh(new T.CylinderGeometry(0.06, 0.075, 0.92, 10), goldMat);
  leftArm.rotation.z = -Math.PI / 2 + 0.06;
  leftArm.position.set(0.12, 0.48, 0.04);
  recBuddha.add(leftArm);

  // Serene Buddha head tilted gently on right palm facing +Z viewer
  const headGrp = new T.Group();
  headGrp.position.set(-1.02, 0.46, 0.04);
  headGrp.rotation.z = -0.32;
  addSereneFaceAndHead(T, headGrp, {
    headMat: goldMat,
    hairMat,
    y: 0,
    z: 0,
    radius: 0.19,
    calmEyes: true
  });
  recBuddha.add(headGrp);

  g.add(recBuddha);
  g.userData.placeholderBody = recBuddha;

  g.scale.setScalar(scale);
  return g;
}

