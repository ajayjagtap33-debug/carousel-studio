// Reel scenes in real 3D (three.js through @remotion/three). Ajay, 2026-11-04: "use 3D models to explain things".
//
//   orbit3d  a team around a lead: a lit core (`core` label) with named chips orbiting it on a tilted ring, each chip
//            landing on its time while a counter above ticks up; `focus {name, at}` swings that chip to the front
//            and lights it. Chips are canvas textures, so their text is real type (fonts waited for).
import React, { useEffect, useMemo, useState } from "react";
import { continueRender, delayRender } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { clamp01, ramp, useC, useNow } from "../studio/kit";
import type { Box, Face, SScene } from "../studio/scenes";

type View = React.FC<{ s: SScene; box: Box; face: Face }>;
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const outBack = (x: number) => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };

/** Wait for a font before baking text into canvas textures. */
const useFontReady = (font: string) => {
  const [ok, setOk] = useState(false);
  const [h] = useState(() => delayRender(`font ${font}`));
  useEffect(() => {
    document.fonts.load(font).then(() => document.fonts.ready).then(() => { setOk(true); continueRender(h); }).catch(() => { setOk(true); continueRender(h); });
  }, [font, h]);
  return ok;
};

const chipTexture = (text: string, fam: string, bg: string, fg: string, border: string) => {
  const W = 640, H = 150, c = document.createElement("canvas");
  c.width = W; c.height = H;
  const g = c.getContext("2d")!;
  g.fillStyle = bg; g.strokeStyle = border; g.lineWidth = 6;
  g.beginPath(); g.roundRect(6, 6, W - 12, H - 12, 52); g.fill(); g.stroke();
  g.fillStyle = fg; g.font = `500 64px ${fam}`; g.textAlign = "center"; g.textBaseline = "middle";
  g.fillText(text, W / 2, H / 2 + 3, W - 70);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  return tex;
};

const LookAt: React.FC<{ y: number }> = ({ y }) => {
  const { camera } = useThree();
  camera.lookAt(0, y, 0);
  return null;
};

const Orbit3d: View = ({ s }) => {
  const C = useC();
  const t = useNow();
  const fam = `"Open Sauce Sans"`; // local file (loaded by the reel): Inter came out as a fallback serif in the canvas
  const ready = useFontReady(`500 64px ${fam}`);
  const names = s.names as string[];
  const ats = s.ats as number[];
  const brand: string = s.brand ?? "#5B54E0";
  const focus = s.focus as { name: string; at: number } | undefined;
  const coreTex = useMemo(() => (ready ? chipTexture(s.core ?? "Commander", fam, "#FFFFFF", "#171A23", brand) : null), [ready, fam, brand, s.core]);

  const n = names.length, R = s.radius ?? 1.6, R2 = s.radius2 ?? 2.55;
  const fi = focus ? names.indexOf(focus.name) : -1;
  const spin = t * 0.32;
  // swing the focus chip to the front (angle where z is largest = PI/2 on this ring)
  const fp = focus ? ease(clamp01((t - focus.at) / 0.6)) : 0;
  const base = (i: number) => (i / n) * Math.PI * 2;
  let rot = spin;
  if (fi >= 0 && fp > 0) {
    const want = Math.PI / 2 - (Math.floor(fi / 2) / Math.ceil(n / 2)) * Math.PI * 2;
    const cur = spin;
    let d = (want - cur) % (Math.PI * 2); if (d < -Math.PI) d += Math.PI * 2; if (d > Math.PI) d -= Math.PI * 2;
    rot = cur + d * fp;
  }
  const landed = ats.filter((a) => t >= a).length;
  const enter = ramp(t, s.start, 0.5);
  const tilt = 0.32;
  const cam = new THREE.Vector3(0, 2.6, 8.3);
  const dummy = new THREE.Object3D();
  const H: number = s.canvasH ?? 900;
  const camObj = new THREE.PerspectiveCamera(38, 960 / H, 0.1, 100);
  camObj.position.copy(cam); camObj.lookAt(0, 0.2, 0); camObj.updateMatrixWorld(); camObj.updateProjectionMatrix();

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: s.countTop ?? 0, display: "flex", flexDirection: "column", alignItems: "center", opacity: enter, zIndex: 2 }}>
        <div style={{ fontFamily: C.fonts.display, fontSize: 210, lineHeight: 0.95, color: "#FFF", fontVariantNumeric: "tabular-nums",
          textShadow: `0 0 50px ${brand}88` }}>{landed}</div>
        <div style={{ fontFamily: C.fonts.plain, fontWeight: 500, fontSize: 40, color: "rgba(255,255,255,0.8)", marginTop: 4 }}>{s.label ?? "AI agents"}</div>
      </div>
      <div style={{ position: "absolute", left: 0, top: s.canvasTop ?? 180, opacity: enter }}>
        <ThreeCanvas width={960} height={H} camera={{ position: [cam.x, cam.y, cam.z], fov: 38 }} gl={{ antialias: true, alpha: true }}>
          <LookAt y={0.2} />
          <ambientLight intensity={0.7} />
          <directionalLight position={[4, 6, 6]} intensity={1.6} />
          <pointLight position={[0, 0, 0]} intensity={30} distance={8} color={brand} />
          {/* the core: a glossy sphere in a slowly turning wire shell */}
          <mesh position={[0, 0, 0]} scale={0.9 + 0.1 * outBack(clamp01((t - s.start) / 0.6))}>
            <sphereGeometry args={[1.05, 64, 64]} />
            <meshStandardMaterial color={brand} metalness={0.35} roughness={0.22} emissive={brand} emissiveIntensity={0.35} />
          </mesh>
          <mesh rotation={[t * 0.4, t * 0.55, 0]}>
            <icosahedronGeometry args={[1.55, 1]} />
            <meshBasicMaterial color="#FFFFFF" wireframe transparent opacity={0.22} />
          </mesh>
          {/* the ring the agents ride on */}
          <mesh rotation={[Math.PI / 2 + tilt, 0, 0]}>
            <torusGeometry args={[R, 0.012, 8, 160]} />
            <meshBasicMaterial color="#FFFFFF" transparent opacity={0.25} />
          </mesh>
          <mesh rotation={[Math.PI / 2 + tilt, 0, 0]}>
            <torusGeometry args={[R2, 0.01, 8, 160]} />
            <meshBasicMaterial color="#FFFFFF" transparent opacity={0.16} />
          </mesh>
        </ThreeCanvas>
        {(() => {
          const c = new THREE.Vector3(0, 1.75, 0).project(camObj);
          return <div style={{ position: "absolute", left: (c.x + 1) / 2 * 960, top: (1 - c.y) / 2 * H, transform: "translate(-50%,-50%)", zIndex: 60,
            fontFamily: fam, fontWeight: 500, fontSize: 34, color: "#171A23", background: "#FFF", padding: "10px 26px", borderRadius: 999,
            boxShadow: `0 0 0 3px ${brand}, 0 10px 30px rgba(0,0,0,0.4)` }}>{s.core ?? "Commander"}</div>;
        })()}
        {/* the agents: HTML chips projected through the same camera (crisp type), two rings turning opposite ways */}
        {names.map((name, i) => {
          const p = clamp01((t - ats[i]) / 0.45);
          if (p <= 0) return null;
          const inner = i % 2 === 0, rr = inner ? R : R2, slot = Math.floor(i / 2), m = Math.ceil(n / 2);
          const a = (slot / m) * Math.PI * 2 + (inner ? rot : -rot * 0.8 + 0.4);
          const r = rr * (1 + (1 - outBack(p)) * 0.5);
          const pos = new THREE.Vector3(Math.cos(a) * r, -Math.sin(a) * r * Math.sin(tilt), Math.sin(a) * r * Math.cos(tilt)).project(camObj);
          const depth = clamp01((Math.sin(a) + 1) / 2);
          const on = i === fi ? clamp01((t - (focus!.at + 0.25)) / 0.3) : 0;
          const fs = (20 + 12 * depth) * (1 + 0.5 * on);
          return (
            <div key={name} style={{ position: "absolute", left: (pos.x + 1) / 2 * 960, top: (1 - pos.y) / 2 * H, transform: "translate(-50%,-50%)",
              zIndex: Math.round(depth * 100) + (on > 0 ? 200 : 0), opacity: (0.4 + 0.6 * depth) * Math.min(1, p * 2), filter: depth < 0.35 ? `blur(${(0.35 - depth) * 5}px)` : undefined,
              fontFamily: fam, fontWeight: 500, fontSize: fs, whiteSpace: "nowrap", color: "#FFF", padding: `${fs * 0.32}px ${fs * 0.6}px`, borderRadius: 999,
              background: on > 0.5 ? brand : "rgba(26,28,36,0.88)", border: `${on > 0.5 ? 3 : 1.5}px solid ${on > 0.5 ? "#FFF" : "rgba(255,255,255,0.3)"}`,
              boxShadow: on > 0.5 ? `0 0 40px ${brand}` : "0 6px 18px rgba(0,0,0,0.4)" }}>{name}</div>
          );
        })}
      </div>
    </div>
  );
};

export const REEL_3D_SCENES: Record<string, View> = { orbit3d: Orbit3d };
