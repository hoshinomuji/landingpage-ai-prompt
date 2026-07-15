/**
 * Atelier Object — procedural timepiece + orbit-camera story.
 *
 * Watch stays put; the camera orbits on a smooth spherical path.
 * That kills the "warp" feel of lerping between random cam positions
 * while also spinning the model.
 */
import * as THREE from "three";

/** Orbit shot: camera lives on a sphere around a look target. */
export type OrbitShot = {
  az: number;
  el: number;
  dist: number;
  look: THREE.Vector3Tuple;
  fov: number;
  exposure: number;
  keyIntensity: number;
  haloOpacity: number;
  /** Positive → object drifts right of center (copy on left). */
  frameX: number;
};

export type WatchSceneHandle = {
  dispose: () => void;
  setReducedMotion: (reduced: boolean) => void;
  setScrollProgress: (t: number) => void;
  setShotIndex: (index: number) => void;
};

type Options = {
  canvas: HTMLCanvasElement;
  reducedMotion?: boolean;
};

/** 0 hero · 1 case · 2 bezel · 3 dial · 4 crown · 5 exit */
export const STORY_SHOTS: OrbitShot[] = [
  {
    az: 0.55,
    el: 0.32,
    dist: 5.4,
    look: [0, 0.05, 0],
    fov: 30,
    exposure: 1.12,
    keyIntensity: 2.05,
    haloOpacity: 0.22,
    frameX: 0.55,
  },
  {
    az: 1.25,
    el: 0.12,
    dist: 3.35,
    look: [0.15, -0.02, 0.15],
    fov: 28,
    exposure: 1.08,
    keyIntensity: 2.3,
    haloOpacity: 0.06,
    frameX: 0.7,
  },
  {
    az: 0.35,
    el: 0.95,
    dist: 3.15,
    look: [0, 0.14, 0],
    fov: 29,
    exposure: 1.18,
    keyIntensity: 2.45,
    haloOpacity: 0.04,
    frameX: -0.55,
  },
  {
    az: 0.2,
    el: 1.15,
    dist: 2.75,
    look: [0, 0.16, 0],
    fov: 26,
    exposure: 1.1,
    keyIntensity: 2.0,
    haloOpacity: 0.02,
    frameX: 0.65,
  },
  {
    az: 1.55,
    el: 0.18,
    dist: 2.45,
    look: [1.05, 0.04, 0],
    fov: 24,
    exposure: 1.15,
    keyIntensity: 2.25,
    haloOpacity: 0.02,
    frameX: -0.6,
  },
  {
    az: -0.35,
    el: 0.4,
    dist: 6.2,
    look: [0, 0.02, 0],
    fov: 32,
    exposure: 1.02,
    keyIntensity: 1.85,
    haloOpacity: 0.14,
    frameX: 0,
  },
];

function clamp01(t: number) {
  return Math.min(1, Math.max(0, t));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function lerpAngle(a: number, b: number, t: number) {
  let d = b - a;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
}

function smoothstep(t: number) {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
}

/** Hold on A for ~55% of the segment, then ease to B. */
function holdThenEase(t: number) {
  const x = clamp01(t);
  if (x < 0.55) return 0;
  return smoothstep((x - 0.55) / 0.45);
}

/**
 * 0–0.12 hero · 0.12–0.92 four chapters · 0.92–1 exit
 */
function scrollToShotProgress(scroll: number) {
  const s = clamp01(scroll);
  if (s < 0.12) return 0;
  if (s < 0.92) {
    const u = (s - 0.12) / (0.92 - 0.12);
    return u * 4;
  }
  return 4 + clamp01((s - 0.92) / 0.08);
}

function sampleOrbit(shotProgress: number): OrbitShot {
  const shots = STORY_SHOTS;
  const max = shots.length - 1;
  const p = clamp01(shotProgress / max) * max;
  const i = Math.min(max - 1, Math.floor(p));
  const local = holdThenEase(p - i);
  const a = shots[i];
  const b = shots[i + 1];

  return {
    az: lerpAngle(a.az, b.az, local),
    el: lerp(a.el, b.el, local),
    dist: lerp(a.dist, b.dist, local),
    look: [
      lerp(a.look[0], b.look[0], local),
      lerp(a.look[1], b.look[1], local),
      lerp(a.look[2], b.look[2], local),
    ],
    fov: lerp(a.fov, b.fov, local),
    exposure: lerp(a.exposure, b.exposure, local),
    keyIntensity: lerp(a.keyIntensity, b.keyIntensity, local),
    haloOpacity: lerp(a.haloOpacity, b.haloOpacity, local),
    frameX: lerp(a.frameX, b.frameX, local),
  };
}

function orbitToCartesian(
  az: number,
  el: number,
  dist: number,
  look: THREE.Vector3,
  out: THREE.Vector3,
) {
  const cosEl = Math.cos(el);
  out.set(
    look.x + dist * cosEl * Math.sin(az),
    look.y + dist * Math.sin(el),
    look.z + dist * cosEl * Math.cos(az),
  );
}

function buildWatch(materials: {
  steel: THREE.MeshStandardMaterial;
  steelDark: THREE.MeshStandardMaterial;
  brass: THREE.MeshStandardMaterial;
  brassBright: THREE.MeshStandardMaterial;
  dial: THREE.MeshStandardMaterial;
  dialRing: THREE.MeshStandardMaterial;
  crystal: THREE.MeshPhysicalMaterial;
  hand: THREE.MeshStandardMaterial;
  leather: THREE.MeshStandardMaterial;
  leatherEdge: THREE.MeshStandardMaterial;
}) {
  const root = new THREE.Group();
  root.rotation.x = -0.42;
  root.rotation.z = 0.08;

  const {
    steel,
    steelDark,
    brass,
    brassBright,
    dial,
    dialRing,
    crystal,
    hand,
    leather,
    leatherEdge,
  } = materials;

  const caseMid = new THREE.Mesh(
    new THREE.CylinderGeometry(1.12, 1.14, 0.32, 72),
    steel,
  );
  caseMid.castShadow = true;
  caseMid.receiveShadow = true;
  root.add(caseMid);

  const caseBack = new THREE.Mesh(
    new THREE.CylinderGeometry(1.05, 1.08, 0.08, 64),
    steelDark,
  );
  caseBack.position.y = -0.18;
  caseBack.castShadow = true;
  root.add(caseBack);

  const caseLip = new THREE.Mesh(
    new THREE.CylinderGeometry(1.16, 1.12, 0.06, 72),
    steel,
  );
  caseLip.position.y = 0.16;
  caseLip.castShadow = true;
  root.add(caseLip);

  const groove = new THREE.Mesh(
    new THREE.TorusGeometry(1.135, 0.018, 12, 96),
    steelDark,
  );
  groove.rotation.x = Math.PI / 2;
  groove.position.y = 0.02;
  root.add(groove);

  const midAccent = new THREE.Mesh(
    new THREE.TorusGeometry(1.15, 0.022, 14, 100),
    brass,
  );
  midAccent.rotation.x = Math.PI / 2;
  midAccent.position.y = 0.08;
  midAccent.castShadow = true;
  root.add(midAccent);

  const bezel = new THREE.Mesh(
    new THREE.TorusGeometry(1.2, 0.09, 24, 100),
    brass,
  );
  bezel.rotation.x = Math.PI / 2;
  bezel.position.y = 0.2;
  bezel.castShadow = true;
  bezel.name = "bezel";
  root.add(bezel);

  const bezelFlat = new THREE.Mesh(
    new THREE.RingGeometry(1.08, 1.28, 72),
    brassBright,
  );
  bezelFlat.rotation.x = -Math.PI / 2;
  bezelFlat.position.y = 0.255;
  root.add(bezelFlat);

  const bezelTicks = new THREE.Group();
  for (let i = 0; i < 60; i++) {
    const major = i % 5 === 0;
    const tick = new THREE.Mesh(
      new THREE.BoxGeometry(major ? 0.028 : 0.014, 0.012, major ? 0.09 : 0.05),
      major ? brassBright : steelDark,
    );
    const a = (i / 60) * Math.PI * 2;
    const r = 1.18;
    tick.position.set(Math.sin(a) * r, 0.26, Math.cos(a) * r);
    tick.rotation.y = a;
    bezelTicks.add(tick);
  }
  root.add(bezelTicks);

  const rehaut = new THREE.Mesh(
    new THREE.TorusGeometry(1.02, 0.025, 12, 80),
    steelDark,
  );
  rehaut.rotation.x = Math.PI / 2;
  rehaut.position.y = 0.2;
  root.add(rehaut);

  const dialMesh = new THREE.Mesh(new THREE.CircleGeometry(0.98, 72), dial);
  dialMesh.rotation.x = -Math.PI / 2;
  dialMesh.position.y = 0.185;
  dialMesh.receiveShadow = true;
  dialMesh.name = "dial";
  root.add(dialMesh);

  const chapter = new THREE.Mesh(
    new THREE.RingGeometry(0.84, 0.96, 72),
    dialRing,
  );
  chapter.rotation.x = -Math.PI / 2;
  chapter.position.y = 0.188;
  root.add(chapter);

  const indices = new THREE.Group();
  for (let i = 0; i < 12; i++) {
    const cardinal = i % 3 === 0;
    const idx = new THREE.Mesh(
      new THREE.BoxGeometry(
        cardinal ? 0.07 : 0.04,
        0.035,
        cardinal ? 0.18 : 0.11,
      ),
      brassBright,
    );
    const a = (i / 12) * Math.PI * 2;
    const r = 0.78;
    idx.position.set(Math.sin(a) * r, 0.205, Math.cos(a) * r);
    idx.rotation.y = a;
    idx.castShadow = true;
    indices.add(idx);
  }
  for (let i = 0; i < 60; i++) {
    if (i % 5 === 0) continue;
    const pip = new THREE.Mesh(
      new THREE.BoxGeometry(0.012, 0.01, 0.035),
      steel,
    );
    const a = (i / 60) * Math.PI * 2;
    const r = 0.9;
    pip.position.set(Math.sin(a) * r, 0.195, Math.cos(a) * r);
    pip.rotation.y = a;
    indices.add(pip);
  }
  root.add(indices);

  const hands = new THREE.Group();
  hands.position.y = 0.22;
  hands.name = "hands";

  function makeHand(
    length: number,
    width: number,
    height: number,
    y: number,
    mat: THREE.Material,
    angle: number,
  ) {
    const pivot = new THREE.Group();
    pivot.rotation.y = angle;
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, length),
      mat,
    );
    mesh.position.set(0, y, length * 0.38);
    mesh.castShadow = true;
    pivot.add(mesh);
    return pivot;
  }

  const hourPivot = makeHand(0.48, 0.08, 0.02, 0.01, hand, 0.75);
  const minutePivot = makeHand(0.7, 0.05, 0.016, 0.025, hand, -0.95);
  const secondPivot = makeHand(0.82, 0.014, 0.01, 0.04, brassBright, 0.35);

  const counter = new THREE.Mesh(
    new THREE.BoxGeometry(0.03, 0.01, 0.12),
    brassBright,
  );
  counter.position.set(0, 0.04, -0.22);
  secondPivot.add(counter);

  const pinion = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.055, 0.05, 20),
    brass,
  );
  pinion.position.y = 0.03;
  hands.add(pinion);

  const pinionTop = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.03, 0.03, 16),
    brassBright,
  );
  pinionTop.position.y = 0.055;
  hands.add(pinionTop);

  hands.add(hourPivot, minutePivot, secondPivot);
  root.add(hands);

  const crystalMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(1.0, 1.0, 0.07, 64),
    crystal,
  );
  crystalMesh.position.y = 0.27;
  root.add(crystalMesh);

  const crownGroup = new THREE.Group();
  crownGroup.name = "crown";
  crownGroup.position.set(1.28, 0.02, 0);

  const crownStem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.055, 0.12, 16),
    steel,
  );
  crownStem.rotation.z = Math.PI / 2;
  crownStem.position.x = -0.04;
  crownGroup.add(crownStem);

  const crownBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.11, 0.16, 24),
    brass,
  );
  crownBody.rotation.z = Math.PI / 2;
  crownBody.position.x = 0.08;
  crownBody.castShadow = true;
  crownGroup.add(crownBody);

  for (let i = 0; i < 16; i++) {
    const flute = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, 0.155, 0.018),
      brassBright,
    );
    const a = (i / 16) * Math.PI * 2;
    flute.position.set(0.08, Math.sin(a) * 0.095, Math.cos(a) * 0.095);
    crownGroup.add(flute);
  }

  const crownCap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.085, 0.085, 0.04, 20),
    steelDark,
  );
  crownCap.rotation.z = Math.PI / 2;
  crownCap.position.x = 0.18;
  crownGroup.add(crownCap);

  root.add(crownGroup);

  for (const side of [-1, 1] as const) {
    const lugGroup = new THREE.Group();
    lugGroup.position.set(0, -0.02, side * 1.12);

    const lugOuter = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.14, 0.28),
      steel,
    );
    lugOuter.position.z = side * 0.08;
    lugOuter.castShadow = true;
    lugGroup.add(lugOuter);

    const lugInner = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.1, 0.18),
      steelDark,
    );
    lugInner.position.set(0, -0.02, side * 0.18);
    lugGroup.add(lugInner);

    const bar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 0.3, 12),
      steelDark,
    );
    bar.rotation.x = Math.PI / 2;
    bar.position.set(0, -0.02, side * 0.28);
    lugGroup.add(bar);

    root.add(lugGroup);
  }

  for (const side of [-1, 1] as const) {
    const strap = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.06, 0.9),
      leather,
    );
    strap.position.set(0, -0.12, side * 1.7);
    strap.rotation.x = side * 0.12;
    strap.castShadow = true;
    strap.receiveShadow = true;
    root.add(strap);

    const stitch = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.01, 0.015),
      leatherEdge,
    );
    stitch.position.set(0, -0.085, side * 1.55);
    root.add(stitch);

    const stitch2 = stitch.clone();
    stitch2.position.z = side * 1.85;
    root.add(stitch2);
  }

  return { root, hands, hourPivot, minutePivot, secondPivot, crownGroup, bezel };
}

export function createWatchScene({
  canvas,
  reducedMotion = false,
}: Options): WatchSceneHandle {
  let preferReduced = reducedMotion;
  let disposed = false;
  let raf = 0;

  let scrollTarget = 0;
  let scrollSmooth = 0;
  let forcedShot: number | null = null;

  const currentOrbit = {
    az: STORY_SHOTS[0].az,
    el: STORY_SHOTS[0].el,
    dist: STORY_SHOTS[0].dist,
    look: new THREE.Vector3(...STORY_SHOTS[0].look),
    fov: STORY_SHOTS[0].fov,
    exposure: STORY_SHOTS[0].exposure,
    keyIntensity: STORY_SHOTS[0].keyIntensity,
    haloOpacity: STORY_SHOTS[0].haloOpacity,
    frameX: STORY_SHOTS[0].frameX,
  };
  const targetOrbit = { ...currentOrbit, look: currentOrbit.look.clone() };
  const camPos = new THREE.Vector3();
  const lookScratch = new THREE.Vector3();

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0a0908, 0.038);

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 80);
  camera.position.set(0, 0.5, 5.4);

  const ambient = new THREE.AmbientLight(0xfff1e0, 0.32);
  scene.add(ambient);
  const hemi = new THREE.HemisphereLight(0xffe8cc, 0x0a0a0c, 0.6);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffd7a8, 2.05);
  key.position.set(3.8, 5.2, 3.5);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.radius = 3;
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xb8c4d8, 0.38);
  fill.position.set(-3.5, 1.2, -1.5);
  scene.add(fill);
  const rim = new THREE.PointLight(0xffc978, 12, 14, 2);
  rim.position.set(-2.2, 1.6, 3.2);
  scene.add(rim);
  const spark = new THREE.PointLight(0xffe0b0, 5, 9, 2);
  spark.position.set(1.8, -0.2, 2.5);
  scene.add(spark);

  const steel = new THREE.MeshStandardMaterial({
    color: new THREE.Color().setHSL(0.08, 0.05, 0.46),
    metalness: 0.94,
    roughness: 0.32,
  });
  const steelDark = new THREE.MeshStandardMaterial({
    color: new THREE.Color().setHSL(0.08, 0.04, 0.28),
    metalness: 0.9,
    roughness: 0.4,
  });
  const brass = new THREE.MeshStandardMaterial({
    color: new THREE.Color().setHSL(0.1, 0.52, 0.5),
    metalness: 0.96,
    roughness: 0.24,
  });
  const brassBright = new THREE.MeshStandardMaterial({
    color: new THREE.Color().setHSL(0.11, 0.58, 0.58),
    metalness: 0.97,
    roughness: 0.18,
  });
  const dial = new THREE.MeshStandardMaterial({
    color: new THREE.Color().setHSL(0.08, 0.1, 0.11),
    metalness: 0.25,
    roughness: 0.6,
  });
  const dialRing = new THREE.MeshStandardMaterial({
    color: new THREE.Color().setHSL(0.09, 0.15, 0.22),
    metalness: 0.55,
    roughness: 0.42,
  });
  const crystal = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0,
    roughness: 0.04,
    transmission: 0.88,
    thickness: 0.3,
    transparent: true,
    opacity: 0.28,
    ior: 1.45,
  });
  const hand = new THREE.MeshStandardMaterial({
    color: new THREE.Color().setHSL(0.1, 0.4, 0.55),
    metalness: 0.92,
    roughness: 0.22,
  });
  const leather = new THREE.MeshStandardMaterial({
    color: new THREE.Color().setHSL(0.06, 0.35, 0.18),
    metalness: 0.05,
    roughness: 0.85,
  });
  const leatherEdge = new THREE.MeshStandardMaterial({
    color: new THREE.Color().setHSL(0.08, 0.25, 0.35),
    metalness: 0.1,
    roughness: 0.7,
  });

  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x0c0b0a,
    metalness: 0.15,
    roughness: 0.92,
  });
  const ground = new THREE.Mesh(new THREE.CircleGeometry(4, 64), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.85;
  ground.receiveShadow = true;
  scene.add(ground);

  const { root: watch, secondPivot } = buildWatch({
    steel,
    steelDark,
    brass,
    brassBright,
    dial,
    dialRing,
    crystal,
    hand,
    leather,
    leatherEdge,
  });
  scene.add(watch);

  const haloMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color().setHSL(0.1, 0.3, 0.35),
    metalness: 0.95,
    roughness: 0.4,
    transparent: true,
    opacity: 0.18,
  });
  const halo = new THREE.Mesh(
    new THREE.TorusGeometry(2.1, 0.008, 12, 120),
    haloMat,
  );
  halo.rotation.x = Math.PI / 2.2;
  halo.position.y = -0.15;
  scene.add(halo);

  const pointer = { x: 0, y: 0 };
  const targetPointer = { x: 0, y: 0 };

  function onPointerMove(e: PointerEvent) {
    const w = window.innerWidth || 1;
    const h = window.innerHeight || 1;
    targetPointer.x = (e.clientX / w) * 2 - 1;
    targetPointer.y = (e.clientY / h) * 2 - 1;
  }

  function resize() {
    const parent = canvas.parentElement;
    const w = Math.max(1, parent?.clientWidth || window.innerWidth);
    const h = Math.max(1, parent?.clientHeight || window.innerHeight);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }

  function pushTargetFromScroll(scroll: number) {
    let shot: OrbitShot;
    if (forcedShot !== null && preferReduced) {
      shot = STORY_SHOTS[Math.min(STORY_SHOTS.length - 1, forcedShot)];
    } else {
      shot = sampleOrbit(scrollToShotProgress(scroll));
    }
    targetOrbit.az = shot.az;
    targetOrbit.el = shot.el;
    targetOrbit.dist = shot.dist;
    targetOrbit.look.set(shot.look[0], shot.look[1], shot.look[2]);
    targetOrbit.fov = shot.fov;
    targetOrbit.exposure = shot.exposure;
    targetOrbit.keyIntensity = shot.keyIntensity;
    targetOrbit.haloOpacity = shot.haloOpacity;
    targetOrbit.frameX = shot.frameX;
  }

  const clock = new THREE.Clock();
  let time = 0;
  let heroSpin = 0;

  function frame() {
    if (disposed) return;
    raf = requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05);
    if (!preferReduced) time += dt;

    const scrollRate = preferReduced ? 1 : 1 - Math.exp(-dt * 3.2);
    scrollSmooth += (scrollTarget - scrollSmooth) * scrollRate;
    pushTargetFromScroll(scrollSmooth);

    const orbitRate = preferReduced ? 1 : 1 - Math.exp(-dt * 2.6);
    currentOrbit.az = lerpAngle(currentOrbit.az, targetOrbit.az, orbitRate);
    currentOrbit.el = lerp(currentOrbit.el, targetOrbit.el, orbitRate);
    currentOrbit.dist = lerp(currentOrbit.dist, targetOrbit.dist, orbitRate);
    currentOrbit.look.lerp(targetOrbit.look, orbitRate);
    currentOrbit.fov = lerp(currentOrbit.fov, targetOrbit.fov, orbitRate);
    currentOrbit.exposure = lerp(
      currentOrbit.exposure,
      targetOrbit.exposure,
      orbitRate,
    );
    currentOrbit.keyIntensity = lerp(
      currentOrbit.keyIntensity,
      targetOrbit.keyIntensity,
      orbitRate,
    );
    currentOrbit.haloOpacity = lerp(
      currentOrbit.haloOpacity,
      targetOrbit.haloOpacity,
      orbitRate,
    );
    currentOrbit.frameX = lerp(
      currentOrbit.frameX,
      targetOrbit.frameX,
      orbitRate,
    );

    if (!preferReduced) {
      pointer.x += (targetPointer.x - pointer.x) * 0.04;
      pointer.y += (targetPointer.y - pointer.y) * 0.04;
    } else {
      pointer.x = 0;
      pointer.y = 0;
    }

    const spinFade = 1 - clamp01(scrollSmooth / 0.14);
    if (!preferReduced) {
      heroSpin += dt * 0.16 * spinFade;
      secondPivot.rotation.y = 0.35 + time * 0.35;
      rim.position.x = -2.2 + Math.sin(time * 0.4) * 0.25 * spinFade;
      spark.intensity = 7 + Math.sin(time * 1.0) * 1.1;
      halo.rotation.z = time * 0.05;
    }

    const viewAz = currentOrbit.az + heroSpin * 0.55 * spinFade;
    orbitToCartesian(
      viewAz,
      currentOrbit.el,
      currentOrbit.dist,
      currentOrbit.look,
      camPos,
    );

    lookScratch.copy(currentOrbit.look);
    const viewDir = camPos.clone().sub(lookScratch).normalize();
    const right = new THREE.Vector3()
      .crossVectors(viewDir, camera.up)
      .normalize();
    if (right.lengthSq() < 0.01) right.set(1, 0, 0);
    camPos.addScaledVector(right, currentOrbit.frameX * 0.9);

    const pScale = preferReduced ? 0 : 0.35 * spinFade + 0.06;
    camPos.addScaledVector(right, pointer.x * 0.3 * pScale);
    camPos.y += -pointer.y * 0.16 * pScale;

    camera.position.copy(camPos);
    camera.lookAt(currentOrbit.look);

    if (Math.abs(camera.fov - currentOrbit.fov) > 0.02) {
      camera.fov = currentOrbit.fov;
      camera.updateProjectionMatrix();
    }

    renderer.toneMappingExposure = currentOrbit.exposure;
    key.intensity = currentOrbit.keyIntensity;
    haloMat.opacity = currentOrbit.haloOpacity;

    renderer.render(scene, camera);
  }

  resize();
  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  pushTargetFromScroll(0);
  Object.assign(currentOrbit, {
    az: targetOrbit.az,
    el: targetOrbit.el,
    dist: targetOrbit.dist,
    fov: targetOrbit.fov,
    exposure: targetOrbit.exposure,
    keyIntensity: targetOrbit.keyIntensity,
    haloOpacity: targetOrbit.haloOpacity,
    frameX: targetOrbit.frameX,
  });
  currentOrbit.look.copy(targetOrbit.look);
  frame();

  return {
    setReducedMotion(reduced: boolean) {
      preferReduced = reduced;
      if (reduced) {
        pointer.x = 0;
        pointer.y = 0;
        targetPointer.x = 0;
        targetPointer.y = 0;
      }
    },
    setScrollProgress(t: number) {
      scrollTarget = clamp01(t);
      if (preferReduced) {
        scrollSmooth = scrollTarget;
        forcedShot = null;
        pushTargetFromScroll(scrollSmooth);
        currentOrbit.az = targetOrbit.az;
        currentOrbit.el = targetOrbit.el;
        currentOrbit.dist = targetOrbit.dist;
        currentOrbit.look.copy(targetOrbit.look);
        currentOrbit.fov = targetOrbit.fov;
        currentOrbit.frameX = targetOrbit.frameX;
      }
    },
    setShotIndex(index: number) {
      forcedShot = index;
      if (index <= 0) scrollTarget = 0;
      else if (index >= 5) scrollTarget = 1;
      else scrollTarget = 0.14 + (index / 4) * 0.76;
      if (preferReduced) {
        scrollSmooth = scrollTarget;
        pushTargetFromScroll(scrollSmooth);
        currentOrbit.az = targetOrbit.az;
        currentOrbit.el = targetOrbit.el;
        currentOrbit.dist = targetOrbit.dist;
        currentOrbit.look.copy(targetOrbit.look);
        currentOrbit.fov = targetOrbit.fov;
        currentOrbit.frameX = targetOrbit.frameX;
      }
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose();
          const mat = obj.material;
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
          else mat?.dispose();
        }
      });
      renderer.dispose();
    },
  };
}
