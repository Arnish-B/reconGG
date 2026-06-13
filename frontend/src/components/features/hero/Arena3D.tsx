"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

// Refined "gyroscope core": central wireframe spike + counter-rotating rings +
// soft particle field, with subtle cursor parallax.
export function Arena3D() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const css = getComputedStyle(document.documentElement);
    const blue = new THREE.Color((css.getPropertyValue("--blue") || "#4d8dff").trim());
    const red = new THREE.Color((css.getPropertyValue("--red") || "#ff4655").trim());

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 18;

    const world = new THREE.Group();
    scene.add(world);

    // --- central spike: nested wireframe octahedrons ---
    const wire = (r: number, color: THREE.Color, op: number) => {
      const geo = new THREE.OctahedronGeometry(r, 0);
      const m = new THREE.LineSegments(
        new THREE.EdgesGeometry(geo),
        new THREE.LineBasicMaterial({ color, transparent: true, opacity: op }),
      );
      geo.dispose();
      return m;
    };
    const spikeOuter = wire(3.0, red, 0.9);
    const spikeInner = wire(1.7, blue, 0.95);
    const core = new THREE.Mesh(
      new THREE.OctahedronGeometry(1.66, 0),
      new THREE.MeshBasicMaterial({ color: blue, transparent: true, opacity: 0.12 }),
    );
    const spike = new THREE.Group();
    spike.add(spikeOuter, spikeInner, core);
    world.add(spike);

    // --- gyroscope rings (torus) at varied orientations ---
    const rings: THREE.Mesh[] = [];
    const ringDefs = [
      { r: 4.6, c: red, op: 0.55, rot: [Math.PI / 2.2, 0, 0], spin: [0, 0.18, 0] },
      { r: 5.5, c: blue, op: 0.45, rot: [0, 0, Math.PI / 3], spin: [0.12, 0, 0.04] },
      { r: 6.4, c: red, op: 0.25, rot: [Math.PI / 3, Math.PI / 4, 0], spin: [0.05, -0.09, 0] },
    ] as const;
    ringDefs.forEach((d) => {
      const torus = new THREE.Mesh(
        new THREE.TorusGeometry(d.r, 0.012, 8, 140),
        new THREE.MeshBasicMaterial({ color: d.c, transparent: true, opacity: d.op }),
      );
      torus.rotation.set(d.rot[0], d.rot[1], d.rot[2]);
      torus.userData.spin = d.spin;
      rings.push(torus);
      world.add(torus);
    });

    // --- particle field, split blue (left) / red (right), subtle ---
    const N = 340;
    const pos = new Float32Array(N * 3);
    const col = new Float32Array(N * 3);
    const spd = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const x = (Math.random() * 2 - 1) * 22;
      const y = (Math.random() * 2 - 1) * 13;
      const z = (Math.random() * 2 - 1) * 10;
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
      const c = x < 0 ? blue : red;
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
      spd[i] = 0.003 + Math.random() * 0.008;
    }
    const pgeo = new THREE.BufferGeometry();
    pgeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    pgeo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    const pmat = new THREE.PointsMaterial({
      size: 0.07,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const points = new THREE.Points(pgeo, pmat);
    scene.add(points);

    function resize() {
      const w = parent!.clientWidth,
        h = parent!.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(parent);

    let tx = 0,
      ty = 0,
      cx = 0,
      cy = 0;
    const onMove = (e: PointerEvent) => {
      const r = parent.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - 0.5;
      ty = (e.clientY - r.top) / r.height - 0.5;
    };
    parent.addEventListener("pointermove", onMove);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const clock = new THREE.Clock();
    let raf = 0;

    function render() {
      const t = clock.getElapsedTime();
      spike.rotation.set(t * 0.14, t * 0.22, 0);
      spikeInner.rotation.set(-t * 0.3, -t * 0.2, t * 0.1);
      rings.forEach((ring) => {
        const s = ring.userData.spin as number[];
        ring.rotation.x += s[0] * 0.02;
        ring.rotation.y += s[1] * 0.02;
        ring.rotation.z += s[2] * 0.02;
      });
      cx += (tx - cx) * 0.05;
      cy += (ty - cy) * 0.05;
      world.rotation.y = cx * 0.6;
      world.rotation.x = cy * 0.4;

      const p = pgeo.attributes.position.array as Float32Array;
      for (let i = 0; i < N; i++) {
        p[i * 3 + 1] += spd[i];
        if (p[i * 3 + 1] > 13) p[i * 3 + 1] = -13;
      }
      pgeo.attributes.position.needsUpdate = true;
      points.rotation.y = t * 0.015;

      renderer.render(scene, camera);
    }
    function loop() {
      render();
      raf = requestAnimationFrame(loop);
    }
    if (reduced) render();
    else loop();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      parent.removeEventListener("pointermove", onMove);
      [spikeOuter, spikeInner].forEach((o) => {
        o.geometry.dispose();
        (o.material as THREE.Material).dispose();
      });
      core.geometry.dispose();
      (core.material as THREE.Material).dispose();
      rings.forEach((r) => {
        r.geometry.dispose();
        (r.material as THREE.Material).dispose();
      });
      pgeo.dispose();
      pmat.dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas className="absolute inset-0 z-0 block h-full w-full" ref={ref} />;
}
