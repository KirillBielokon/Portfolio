import React, { useEffect, useId, useRef, useState } from "react";
import "./hero-scene.css";
import useSceneActivity from "./useSceneActivity";

function FallbackSculpture({ id }) {
  return (
    <svg
      className="hscene-fallback"
      viewBox="0 0 620 580"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={`${id}-body`}
          x1="190"
          y1="120"
          x2="440"
          y2="440"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#d5dcff" />
          <stop offset=".22" stopColor="#748aff" />
          <stop offset=".55" stopColor="#6042ed" />
          <stop offset=".78" stopColor="#ab8aff" />
          <stop offset="1" stopColor="#3d51d9" />
        </linearGradient>
        <linearGradient
          id={`${id}-edge`}
          x1="160"
          y1="90"
          x2="420"
          y2="450"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#f4eaff" />
          <stop offset=".37" stopColor="#8b99ff" />
          <stop offset=".7" stopColor="#3525a2" />
          <stop offset="1" stopColor="#b0caff" />
        </linearGradient>
        <radialGradient id={`${id}-pink`} cx=".3" cy=".22" r=".85">
          <stop stopColor="#fff0ff" />
          <stop offset=".28" stopColor="#efbdff" />
          <stop offset=".7" stopColor="#ae6af1" />
          <stop offset="1" stopColor="#543caa" />
        </radialGradient>
        <radialGradient id={`${id}-blue`} cx=".3" cy=".2" r=".9">
          <stop stopColor="#f3ffff" />
          <stop offset=".25" stopColor="#b8efff" />
          <stop offset=".66" stopColor="#608aff" />
          <stop offset="1" stopColor="#344dc0" />
        </radialGradient>
      </defs>
      <g
        className="hscene-fallback-orbits"
        opacity=".5"
        stroke="#8d9fff"
        strokeWidth="1"
      >
        <ellipse
          cx="310"
          cy="300"
          rx="250"
          ry="102"
          transform="rotate(-24 310 300)"
        />
        <ellipse
          cx="310"
          cy="300"
          rx="190"
          ry="214"
          transform="rotate(28 310 300)"
          opacity=".35"
        />
      </g>
      <g className="hscene-fallback-stars" fill="#b0c6ff">
        <circle cx="94" cy="218" r="1.5" />
        <circle cx="477" cy="98" r="1" />
        <circle cx="525" cy="350" r="1.5" />
        <circle cx="176" cy="464" r="1" />
        <circle cx="338" cy="62" r="1.5" />
        <circle cx="78" cy="312" r="1" />
      </g>
      <g transform="translate(26 20) rotate(-8 310 290)">
        <path
          d="M164 118H240V256L359 118H449L307 282L468 450H366L240 310V450H164V118Z"
          fill="#282066"
          stroke="#292476"
          strokeWidth="18"
          strokeLinejoin="round"
        />
      </g>
      <g className="hscene-fallback-monogram" transform="rotate(-8 310 290)">
        <path
          d="M164 118H240V256L359 118H449L307 282L468 450H366L240 310V450H164V118Z"
          fill={`url(#${id}-body)`}
          stroke={`url(#${id}-edge)`}
          strokeWidth="15"
          strokeLinejoin="round"
        />
        <path
          d="M176 130H227V273L365 130H431"
          stroke="#e9e7ff"
          strokeOpacity=".6"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <circle
        className="hscene-fallback-orb-a"
        cx="490"
        cy="194"
        r="35"
        fill={`url(#${id}-pink)`}
      />
      <circle
        className="hscene-fallback-orb-b"
        cx="114"
        cy="385"
        r="22"
        fill={`url(#${id}-blue)`}
      />
      <g
        className="hscene-fallback-crystal"
        transform="translate(466 406) rotate(12)"
      >
        <path d="M0-18L17 0 0 19-16 0Z" fill={`url(#${id}-body)`} />
        <path d="M0-18V19L17 0Z" fill="#a2b7ff" fillOpacity=".5" />
        <path
          d="M0-18L17 0 0 19-16 0Z"
          stroke="#d3deff"
          strokeOpacity=".55"
          strokeWidth=".7"
        />
      </g>
      <circle cx="411" cy="469" r="5" fill="#b3c4ff" />
    </svg>
  );
}

/** A local, asset-free WebGL sculpture with a complete SVG fallback. */
export default function HeroScene({ paused = false, active = true }) {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const controlsRef = useRef(null);
  const activity = useSceneActivity(rootRef, { paused, active });
  const latestRef = useRef(activity);
  latestRef.current = activity;
  const [ready, setReady] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const id = `hscene-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  // Once a visitor reaches the scene, preserve its GPU resources across scrolls.
  // Initial reduced motion, hidden tabs and hash links to later sections keep
  // the SVG and do not download Three until the visitor can use the animation.
  useEffect(() => {
    if (activity.running) setHasEntered(true);
  }, [activity.running]);

  useEffect(() => {
    if (!hasEntered) return undefined;
    let disposed = false;
    const disposers = [];
    let startFrame = 0;
    let ownedControls = null;
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return undefined;
    const track = (resource) => {
      disposers.push(() => resource.dispose());
      return resource;
    };
    // Registration happens as resources are created, so failures at any point
    // release everything acquired so far. Cleanup is safe to call again.
    const cleanup = () => {
      if (controlsRef.current === ownedControls) controlsRef.current = null;
      while (disposers.length) {
        try {
          disposers.pop()();
        } catch {
          /* Continue releasing other resources. */
        }
      }
    };

    async function initialize() {
      try {
        // Check GPU capability before downloading Three. Low-power and software
        // devices retain the fully composed, animated SVG sculpture.
        const context = canvas.getContext("webgl2", {
          alpha: true,
          antialias: true,
          powerPreference: "low-power",
          failIfMajorPerformanceCaveat: true,
        });
        if (!context) return;
        disposers.push(() =>
          context.getExtension("WEBGL_lose_context")?.loseContext(),
        );
        // Some Chromium builds accept the caveat flag for a CPU rasterizer.
        // Detect only explicit software renderers; privacy-filtered/unknown and
        // ordinary Intel/AMD/Apple GPUs keep the interactive WebGL sculpture.
        const debug = context.getExtension("WEBGL_debug_renderer_info");
        const rendererName = debug
          ? String(context.getParameter(debug.UNMASKED_RENDERER_WEBGL))
          : "";
        if (
          /SwiftShader|llvmpipe|softpipe|Software Rasterizer|Microsoft Basic Render Driver/i.test(
            rendererName,
          )
        ) {
          cleanup();
          return;
        }
        const [THREE, { RoomEnvironment }] = await Promise.all([
          import("three"),
          import("three/addons/environments/RoomEnvironment.js"),
        ]);
        if (disposed) return;
        const renderer = track(
          new THREE.WebGLRenderer({
            canvas,
            context,
            alpha: true,
            antialias: true,
            powerPreference: "low-power",
          }),
        );
        renderer.setClearColor(0x000000, 0);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.25;
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
        camera.position.set(0, 0.12, 7.3);
        const pmrem = new THREE.PMREMGenerator(renderer);
        let room;
        let environment;
        try {
          room = new RoomEnvironment();
          environment = track(pmrem.fromScene(room, 0.045));
          scene.environment = environment.texture;
        } finally {
          room?.dispose();
          pmrem.dispose();
        }
        scene.add(new THREE.HemisphereLight(0xd7e5ff, 0x251041, 2.4));
        const key = new THREE.DirectionalLight(0xe8f4ff, 6);
        key.position.set(-3, 5, 4);
        scene.add(key);
        const violet = new THREE.PointLight(0x9c67ff, 20, 14, 2);
        violet.position.set(3, 1.2, 3);
        scene.add(violet);
        const blue = new THREE.PointLight(0x4e8bff, 18, 13, 2);
        blue.position.set(-3, -1.5, 2);
        scene.add(blue);
        const sculpture = new THREE.Group();
        scene.add(sculpture);
        const k = new THREE.Shape();
        k.moveTo(-1.06, 1.35);
        k.lineTo(-0.38, 1.35);
        k.lineTo(-0.38, 0.16);
        k.lineTo(0.68, 1.35);
        k.lineTo(1.38, 1.35);
        k.lineTo(0.14, -0.02);
        k.lineTo(1.48, -1.35);
        k.lineTo(0.61, -1.35);
        k.lineTo(-0.38, -0.26);
        k.lineTo(-0.38, -1.35);
        k.lineTo(-1.06, -1.35);
        k.closePath();
        const kGeometry = track(
          new THREE.ExtrudeGeometry(k, {
            depth: 0.32,
            bevelEnabled: true,
            bevelSegments: 8,
            steps: 1,
            bevelSize: 0.15,
            bevelThickness: 0.17,
            curveSegments: 12,
          }),
        );
        kGeometry.center();
        const frontMaterial = track(
          new THREE.MeshPhysicalMaterial({
            color: 0x606aff,
            metalness: 0.65,
            roughness: 0.17,
            clearcoat: 1,
            clearcoatRoughness: 0.08,
            iridescence: 0.3,
            iridescenceIOR: 1.32,
            iridescenceThicknessRange: [180, 350],
            envMapIntensity: 1.6,
          }),
        );
        const edgeMaterial = track(frontMaterial.clone());
        edgeMaterial.color.setHex(0x6650db);
        edgeMaterial.roughness = 0.12;
        const monogram = new THREE.Mesh(kGeometry, [
          frontMaterial,
          edgeMaterial,
        ]);
        sculpture.add(monogram);
        const orbitGroup = new THREE.Group();
        scene.add(orbitGroup);
        const ringMaterial = track(
          new THREE.MeshBasicMaterial({
            color: 0x9eaeff,
            transparent: true,
            opacity: 0.24,
            depthWrite: false,
          }),
        );
        const ringGeometry = track(
          new THREE.TorusGeometry(2.05, 0.005, 5, 100),
        );
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.set(1.08, -0.18, -0.32);
        orbitGroup.add(ring);
        const ringTwo = new THREE.Mesh(ringGeometry, ringMaterial);
        ringTwo.rotation.set(0.2, 0.98, 0.4);
        ringTwo.scale.setScalar(0.92);
        orbitGroup.add(ringTwo);
        const sphereGeometry = track(new THREE.SphereGeometry(1, 28, 20));
        const pinkMaterial = track(
          new THREE.MeshPhysicalMaterial({
            color: 0xbfa4ff,
            metalness: 0.4,
            roughness: 0.16,
            clearcoat: 1,
            iridescence: 0.2,
            envMapIntensity: 1.25,
          }),
        );
        const cyanMaterial = track(pinkMaterial.clone());
        cyanMaterial.color.setHex(0x8fddff);
        const pinkOrb = new THREE.Mesh(sphereGeometry, pinkMaterial);
        pinkOrb.scale.setScalar(0.27);
        const cyanOrb = new THREE.Mesh(sphereGeometry, cyanMaterial);
        cyanOrb.scale.setScalar(0.17);
        const accentOrb = new THREE.Mesh(sphereGeometry, cyanMaterial);
        accentOrb.scale.setScalar(0.055);
        orbitGroup.add(pinkOrb, cyanOrb, accentOrb);
        const crystalGeometry = track(new THREE.OctahedronGeometry(0.14));
        const crystal = new THREE.Mesh(crystalGeometry, cyanMaterial);
        orbitGroup.add(crystal);
        const particlesGeometry = track(new THREE.BufferGeometry());
        const particlePositions = new Float32Array(22 * 3);
        for (let i = 0; i < 22; i++) {
          const a = i * 2.39996,
            radius = 1.85 + (i % 4) * 0.13;
          particlePositions[i * 3] = Math.cos(a) * radius;
          particlePositions[i * 3 + 1] = Math.sin(a) * radius;
          particlePositions[i * 3 + 2] = Math.sin(i * 1.7) * 0.55 - 0.3;
        }
        particlesGeometry.setAttribute(
          "position",
          new THREE.BufferAttribute(particlePositions, 3),
        );
        const particleMaterial = track(
          new THREE.PointsMaterial({
            color: 0xa9bcff,
            size: 0.017,
            transparent: true,
            opacity: 0.55,
            depthWrite: false,
          }),
        );
        const particles = new THREE.Points(particlesGeometry, particleMaterial);
        scene.add(particles);
        const mobile = matchMedia("(max-width: 760px)");
        let lost = false;
        let frame = 0;
        let lastPaint = 0;
        let lastSimulation = 0;
        let elapsed = 0;
        const pointer = { x: 0, y: 0, currentX: 0, currentY: 0 };
        const canAnimate = () =>
          !disposed && latestRef.current.running && !lost;

        function render(time = 0, simulate = false) {
          if (disposed || lost) return;
          if (simulate) {
            const delta = lastSimulation
              ? Math.min((time - lastSimulation) / 1000, 0.06)
              : 1 / 60;
            elapsed += delta;
            lastSimulation = time;
            const blend = 1 - Math.exp(-5 * delta);
            pointer.currentX += (pointer.x - pointer.currentX) * blend;
            pointer.currentY += (pointer.y - pointer.currentY) * blend;
          }
          const t = latestRef.current.reducedMotion ? 0 : elapsed;
          sculpture.rotation.set(
            0.08 + pointer.currentY * 0.18,
            -0.27 + Math.sin(t * 0.42) * 0.2 + pointer.currentX * 0.3,
            -0.105 + Math.sin(t * 0.3) * 0.025,
          );
          sculpture.position.y = Math.sin(t * 0.72) * 0.1;
          pinkOrb.position.set(
            1.82 * Math.cos(t * 0.38 + 0.6),
            0.78 * Math.sin(t * 0.38 + 0.6) + 0.32,
            1.23 * Math.sin(t * 0.38 + 0.6),
          );
          cyanOrb.position.set(
            1.83 * Math.cos(t * 0.31 + 3.1),
            0.95 * Math.sin(t * 0.31 + 3.1) - 0.25,
            1.05 * Math.sin(t * 0.31 + 3.1),
          );
          accentOrb.position.set(
            1.65 * Math.cos(t * 0.24 + 4.4),
            1.4 * Math.sin(t * 0.24 + 4.4),
            -0.5,
          );
          crystal.position.set(
            1.75 * Math.cos(t * 0.26 + 5.4),
            1.1 * Math.sin(t * 0.26 + 5.4),
            0.8 * Math.cos(t * 0.26 + 5.4),
          );
          crystal.rotation.set(t * 0.4, t * 0.55, t * 0.2);
          particles.rotation.z = t * 0.012;
          particles.rotation.y = Math.sin(t * 0.1) * 0.06;
          orbitGroup.rotation.z = Math.sin(t * 0.16) * 0.075;
          renderer.render(scene, camera);
        }
        function tick(time) {
          frame = 0;
          if (!canAnimate()) return;
          const interval = mobile.matches ? 1000 / 30 : 1000 / 60;
          if (time - lastPaint >= interval - 1) {
            render(time, true);
            lastPaint = time;
          }
          frame = requestAnimationFrame(tick);
        }
        function synchronize() {
          cancelAnimationFrame(frame);
          frame = 0;
          lastPaint = 0;
          lastSimulation = 0;
          if (latestRef.current.reducedMotion) {
            pointer.currentX = 0;
            pointer.currentY = 0;
            leave();
          }
          if (canAnimate()) frame = requestAnimationFrame(tick);
          else if (latestRef.current.visible && latestRef.current.pageVisible)
            render();
        }
        let pointerBounds = null;
        let lastSize = "";
        function resize() {
          const width = root.clientWidth,
            height = root.clientHeight;
          if (!width || !height || disposed) return;
          pointerBounds = null;
          const ratio = Math.min(
            devicePixelRatio || 1,
            mobile.matches ? 1.25 : 1.4,
          );
          const size = `${width}:${height}:${ratio}`;
          if (size === lastSize) return;
          lastSize = size;
          renderer.setPixelRatio(ratio);
          renderer.setSize(width, height, false);
          camera.aspect = width / height;
          camera.position.z = camera.aspect < 0.9 ? 8.2 : 7.3;
          camera.updateProjectionMatrix();
          render();
        }
        function point(event) {
          if (!canAnimate()) return;
          const bounds = (pointerBounds ||= root.getBoundingClientRect());
          pointer.x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
          pointer.y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
        }
        function leave() {
          pointer.x = 0;
          pointer.y = 0;
        }
        function release(event) {
          if (event.pointerType !== "mouse") leave();
        }
        function invalidateBounds() {
          pointerBounds = null;
        }
        function contextLost(event) {
          event.preventDefault();
          lost = true;
          cancelAnimationFrame(frame);
          frame = 0;
          setReady(false);
        }
        function contextRestored() {
          if (disposed) return;
          // Three restores its context before this listener runs.
          lost = false;
          lastSize = "";
          resize();
          render();
          setReady(true);
          synchronize();
        }
        const resizeObserver = new ResizeObserver(resize);
        disposers.push(() => {
          cancelAnimationFrame(frame);
          resizeObserver.disconnect();
          root.removeEventListener("pointermove", point);
          root.removeEventListener("pointerdown", point);
          root.removeEventListener("pointerleave", leave);
          root.removeEventListener("pointerup", release);
          root.removeEventListener("pointercancel", leave);
          window.removeEventListener("scroll", invalidateBounds);
          mobile.removeEventListener("change", resize);
          canvas.removeEventListener("webglcontextlost", contextLost);
          canvas.removeEventListener("webglcontextrestored", contextRestored);
        });
        resizeObserver.observe(root);
        root.addEventListener("pointermove", point, { passive: true });
        root.addEventListener("pointerdown", point, { passive: true });
        root.addEventListener("pointerleave", leave);
        root.addEventListener("pointerup", release);
        root.addEventListener("pointercancel", leave);
        window.addEventListener("scroll", invalidateBounds, { passive: true });
        mobile.addEventListener("change", resize);
        canvas.addEventListener("webglcontextlost", contextLost);
        canvas.addEventListener("webglcontextrestored", contextRestored);
        ownedControls = { synchronize };
        controlsRef.current = ownedControls;
        resize();
        render();
        setReady(true);
        synchronize();
      } catch {
        cleanup();
        if (!disposed) setReady(false);
      }
    }
    // Keep the first React paint independent of the 3D chunk and GPU setup.
    startFrame = requestAnimationFrame(() => {
      initialize();
    });
    return () => {
      disposed = true;
      cancelAnimationFrame(startFrame);
      cleanup();
    };
  }, [hasEntered]);

  useEffect(() => {
    controlsRef.current?.synchronize();
  }, [
    activity.running,
    activity.reducedMotion,
    activity.visible,
    activity.pageVisible,
  ]);
  return (
    <div
      ref={rootRef}
      className={`hero-scene hscene-root ${ready ? "hscene-ready" : ""}`}
      data-running={activity.running}
      aria-hidden="true"
    >
      <div className="hscene-floor" />
      <FallbackSculpture id={id} />
      <canvas ref={canvasRef} className="hscene-canvas" />
    </div>
  );
}
