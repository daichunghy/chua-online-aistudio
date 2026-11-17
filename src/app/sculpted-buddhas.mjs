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

  // Flowing Quán Thế Âm Head Veil (Khăn trùm Quan Âm)
  if (withVeil) {
    const vMat = veilMat || headMat;
    const hood = new T.Mesh(
      new T.CylinderGeometry(radius * 1.12, radius * 1.75, radius * 2.4, 14, 1, false, -Math.PI * 0.62, Math.PI * 1.24),
      vMat
    );
    hood.position.set(0, -radius * 0.18, -radius * 0.14);
    hg.add(hood);
    const crest = new T.Mesh(new T.ConeGeometry(radius * 0.32, radius * 0.75, 8), crownMat || headMat);
    crest.position.set(0, radius * 1.08, radius * 0.24);
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
