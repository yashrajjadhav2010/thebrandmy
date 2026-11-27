import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { buildHQScene } from './buildHQScene';
import {
  HQ_CAMERA_PRESETS,
  HQ_ZONES,
  type HQInteriorLightingMode,
  type HQTimeOfDay,
  type HQViewMode,
  type HQZone,
} from './hqData';

function detectSoftwareWebGL(): boolean {
  try {
    const probeCanvas = document.createElement('canvas');
    const gl = probeCanvas.getContext('webgl2');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) ?? '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

export interface GlobalHQViewportHandle {
  resetView: () => void;
  focusZone: (zone: HQZone) => void;
  focusCamera: (
    pos: [number, number, number],
    target: [number, number, number]
  ) => void;
  skipIntro: () => void;
}

interface GlobalHQViewportProps {
  timeOfDay: HQTimeOfDay;
  viewMode: HQViewMode;
  interiorLighting: HQInteriorLightingMode;
  autoExplore: boolean;
  showPins: boolean;
  selectedZoneId: string | null;
  hoveredZoneId: string | null;
  onSelectZone: (zone: HQZone | null) => void;
  onHoverZone: (zoneId: string | null) => void;
  onIntroStateChange?: (active: boolean) => void;
  onUserInteract?: () => void;
}

// Pre-allocated math helpers outside animation loop (Zero GC per frame)
const _raycaster = new THREE.Raycaster();
const _ndc = new THREE.Vector2();
const _projVec = new THREE.Vector3();
const _targetCamPos = new THREE.Vector3();
const _targetLookAt = new THREE.Vector3();
const _heroPos = new THREE.Vector3();
const _heroTarget = new THREE.Vector3();

export const GlobalHQViewport = forwardRef<
  GlobalHQViewportHandle,
  GlobalHQViewportProps
>(function GlobalHQViewport(
  {
    timeOfDay,
    viewMode,
    interiorLighting,
    autoExplore,
    showPins,
    selectedZoneId,
    hoveredZoneId,
    onSelectZone,
    onHoverZone,
    onIntroStateChange,
    onUserInteract,
  },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const pinRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [webglUnavailable, setWebglUnavailable] = useState(false);

  // Store reactive React props in refs so WebGL scene never tears down on UI state changes
  const stateRef = useRef({
    timeOfDay,
    viewMode,
    interiorLighting,
    autoExplore,
    showPins,
    selectedZoneId,
    hoveredZoneId,
    onSelectZone,
    onHoverZone,
    onIntroStateChange,
    onUserInteract,
  });
  stateRef.current = {
    timeOfDay,
    viewMode,
    interiorLighting,
    autoExplore,
    showPins,
    selectedZoneId,
    hoveredZoneId,
    onSelectZone,
    onHoverZone,
    onIntroStateChange,
    onUserInteract,
  };

  // Camera transition controller ref shared with imperative methods
  const cameraCtrlRef = useRef<{
    transitionActive: boolean;
    introActive: boolean;
    introStarted: boolean;
    introElapsed: number;
    setGoal: (
      pos: [number, number, number],
      target: [number, number, number]
    ) => void;
    cancelTransition: () => void;
    resetHero: () => void;
  }>({
    transitionActive: false,
    introActive: false,
    introStarted: false,
    introElapsed: 0,
    setGoal: () => {},
    cancelTransition: () => {},
    resetHero: () => {},
  });

  useImperativeHandle(ref, () => ({
    resetView: () => {
      cameraCtrlRef.current.resetHero();
    },
    focusZone: (zone: HQZone) => {
      cameraCtrlRef.current.introActive = false;
      stateRef.current.onIntroStateChange?.(false);
      cameraCtrlRef.current.setGoal(zone.cameraPos, zone.cameraTarget);
    },
    focusCamera: (pos, target) => {
      cameraCtrlRef.current.introActive = false;
      stateRef.current.onIntroStateChange?.(false);
      cameraCtrlRef.current.setGoal(pos, target);
    },
    skipIntro: () => {
      cameraCtrlRef.current.introActive = false;
      stateRef.current.onIntroStateChange?.(false);
      cameraCtrlRef.current.resetHero();
    },
  }));

  useEffect(() => {
    const container = containerRef.current;
    const mount = canvasMountRef.current;
    if (!container || !mount) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const isSoftwareGl = detectSoftwareWebGL();
    const isMobile = window.innerWidth < 768;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglUnavailable(true);
      return;
    }

    const width = container.clientWidth || 1024;
    const height = container.clientHeight || 640;

    renderer.setSize(width, height);
    renderer.setPixelRatio(
      isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2)
    );
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.06;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.touchAction = 'none';
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    // Procedural Studio Reflection Environment (RoomEnvironment via PMREM)
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    pmrem.dispose();

    const camera = new THREE.PerspectiveCamera(
      isMobile ? 44 : 38,
      width / height,
      0.3,
      260
    );

    const heroPreset = isMobile
      ? HQ_CAMERA_PRESETS.heroMobile
      : HQ_CAMERA_PRESETS.heroDesktop;
    _heroPos.set(...heroPreset.pos);
    _heroTarget.set(...heroPreset.target);

    if (prefersReducedMotion) {
      camera.position.copy(_heroPos);
    } else {
      camera.position.set(...HQ_CAMERA_PRESETS.introStart.pos);
    }

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.copy(
      prefersReducedMotion
        ? _heroTarget
        : new THREE.Vector3(...HQ_CAMERA_PRESETS.introStart.target)
    );
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.065;
    controls.enableRotate = true;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.screenSpacePanning = false;
    controls.minDistance = 4.6;
    controls.maxDistance = isMobile ? 74 : 66;
    controls.minPolarAngle = 0.14;
    controls.maxPolarAngle = Math.PI / 2 - 0.045;
    controls.rotateSpeed = isMobile ? 0.65 : 0.78;
    controls.zoomSpeed = isMobile ? 0.65 : 0.85;
    controls.panSpeed = 0.7;
    controls.autoRotateSpeed = 0.52;
    controls.update();

    // Build complete layered procedural architectural headquarters scene
    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const hq = buildHQScene(scene, maxAniso, isSoftwareGl, isMobile);

    // Pre-warm shaders on GPU devices
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    const ctrl = cameraCtrlRef.current;
    ctrl.introActive = !prefersReducedMotion;
    ctrl.introStarted = false;
    ctrl.introElapsed = 0;
    ctrl.transitionActive = false;

    ctrl.setGoal = (pos, target) => {
      _targetCamPos.set(pos[0], pos[1], pos[2]);
      _targetLookAt.set(target[0], target[1], target[2]);
      ctrl.transitionActive = true;
    };
    ctrl.cancelTransition = () => {
      ctrl.transitionActive = false;
      if (ctrl.introActive) {
        ctrl.introActive = false;
        stateRef.current.onIntroStateChange?.(false);
      }
    };
    ctrl.resetHero = () => {
      const mobileNow = container.clientWidth < 768;
      const preset = mobileNow
        ? HQ_CAMERA_PRESETS.heroMobile
        : HQ_CAMERA_PRESETS.heroDesktop;
      ctrl.introActive = false;
      stateRef.current.onIntroStateChange?.(false);
      ctrl.setGoal(preset.pos, preset.target);
    };

    // Cancel automated camera motion the moment the user takes manual control
    const onControlStart = () => {
      ctrl.cancelTransition();
      stateRef.current.onUserInteract?.();
    };
    controls.addEventListener('start', onControlStart);

    // WebGL Context loss / restoration resilience
    const onContextLost = (e: Event) => {
      e.preventDefault();
      setWebglUnavailable(true);
    };
    const onContextRestored = () => {
      setWebglUnavailable(false);
    };
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);
    renderer.domElement.addEventListener(
      'webglcontextrestored',
      onContextRestored
    );

    // Pointer hover (throttled ~20fps) & click-to-select zone raycasting
    let lastHoverCheck = 0;
    let pointerDownX = 0;
    let pointerDownY = 0;
    let pointerIsDown = false;

    const getZoneAtClientPoint = (clientX: number, clientY: number): string | null => {
      const rect = renderer.domElement.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return null;
      _ndc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      _ndc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      _raycaster.setFromCamera(_ndc, camera);
      const hits = _raycaster.intersectObjects(hq.hitProxies, false);
      if (hits.length > 0) {
        return (hits[0].object.userData.zoneId as string) ?? null;
      }
      return null;
    };

    const onPointerDown = (e: PointerEvent) => {
      pointerIsDown = true;
      pointerDownX = e.clientX;
      pointerDownY = e.clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (pointerIsDown) return;
      const now = performance.now();
      if (now - lastHoverCheck < 52) return;
      lastHoverCheck = now;

      const hitZoneId = getZoneAtClientPoint(e.clientX, e.clientY);
      if (hitZoneId !== stateRef.current.hoveredZoneId) {
        stateRef.current.onHoverZone(hitZoneId);
      }
      renderer.domElement.style.cursor = hitZoneId ? 'pointer' : 'grab';
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!pointerIsDown) return;
      pointerIsDown = false;
      const moveDist = Math.hypot(
        e.clientX - pointerDownX,
        e.clientY - pointerDownY
      );
      if (moveDist > 6) return; // Was an orbit/pan drag, not a zone click

      const hitZoneId = getZoneAtClientPoint(e.clientX, e.clientY);
      if (hitZoneId) {
        const zone = HQ_ZONES.find((z) => z.id === hitZoneId);
        if (zone) {
          ctrl.introActive = false;
          stateRef.current.onIntroStateChange?.(false);
          stateRef.current.onSelectZone(zone);
          ctrl.setGoal(zone.cameraPos, zone.cameraTarget);
        }
      }
    };

    const onPointerLeave = () => {
      pointerIsDown = false;
      if (stateRef.current.hoveredZoneId !== null) {
        stateRef.current.onHoverZone(null);
      }
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerup', onPointerUp);
    renderer.domElement.addEventListener('pointerleave', onPointerLeave);

    // Responsive ResizeObserver
    let viewW = width;
    let viewH = height;
    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const nextW = Math.max(280, Math.round(entry.contentRect.width));
      const nextH = Math.max(360, Math.round(entry.contentRect.height));
      if (nextW === viewW && nextH === viewH) return;
      viewW = nextW;
      viewH = nextH;
      camera.aspect = viewW / viewH;
      camera.fov = viewW < 768 ? 44 : 38;
      camera.updateProjectionMatrix();
      renderer.setSize(viewW, viewH);
    });
    resizeObserver.observe(container);

    // Visibility pause + trigger opening cinematic camera glide when entering viewport
    let isVisible = true;
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        isVisible = entry.isIntersecting;
        if (isVisible && ctrl.introActive && !ctrl.introStarted) {
          ctrl.introStarted = true;
          stateRef.current.onIntroStateChange?.(true);
        }
      },
      { threshold: 0.12 }
    );
    intersectionObserver.observe(container);

    // Smoothly project 3D architectural zone anchors to crisp DOM markers (Zero React re-renders)
    const updateDomPins = () => {
      const visiblePins = stateRef.current.showPins;
      for (const zone of HQ_ZONES) {
        const el = pinRefs.current[zone.id];
        if (!el) continue;
        if (!visiblePins) {
          el.style.opacity = '0';
          el.style.pointerEvents = 'none';
          continue;
        }
        _projVec.set(zone.anchor[0], zone.anchor[1], zone.anchor[2]);
        _projVec.project(camera);

        const inFront = _projVec.z >= -1 && _projVec.z <= 1;
        const px = (_projVec.x * 0.5 + 0.5) * viewW;
        const py = (-_projVec.y * 0.5 + 0.5) * viewH;
        const inBounds =
          inFront && px > 24 && px < viewW - 24 && py > 28 && py < viewH - 64;

        if (!inBounds) {
          el.style.opacity = '0';
          el.style.pointerEvents = 'none';
        } else {
          el.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0) translate(-50%, -50%)`;
          el.style.opacity = '1';
          el.style.pointerEvents = 'auto';
        }
      }
    };

    // Main Render Loop (with Software-WebGL afterDraw pacing per Three.js skill)
    let nightMix = stateRef.current.timeOfDay === 'night' ? 1.0 : 0.0;
    let interiorMix = stateRef.current.viewMode === 'interior' ? 1.0 : 0.0;
    let holoFocusMix =
      stateRef.current.interiorLighting === 'holo-focus' ? 1.0 : 0.0;
    let frameId = 0;
    let disposed = false;
    const clock = new THREE.Clock();

    const afterDraw = (cb: () => void) => {
      if (disposed) return;
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) {
          if (sync) gl.deleteSync(sync);
          return;
        }
        const status = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (status === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 8);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 8);
    };

    const tick = () => {
      if (disposed) return;

      if (!isVisible) {
        frameId = window.setTimeout(tick, 220);
        return;
      }

      const dt = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.getElapsedTime();

      // 1. Cinematic Opening Aerial Glide (~2.6s, smooth cubic ease-out, instantly interruptible)
      if (ctrl.introActive && ctrl.introStarted) {
        ctrl.introElapsed += dt;
        const duration = 2.6;
        const u = Math.min(1, ctrl.introElapsed / duration);
        const ease = 1 - Math.pow(1 - u, 3);

        const mobileNow = viewW < 768;
        const heroEnd = mobileNow
          ? HQ_CAMERA_PRESETS.heroMobile
          : HQ_CAMERA_PRESETS.heroDesktop;

        camera.position.set(
          THREE.MathUtils.lerp(HQ_CAMERA_PRESETS.introStart.pos[0], heroEnd.pos[0], ease),
          THREE.MathUtils.lerp(HQ_CAMERA_PRESETS.introStart.pos[1], heroEnd.pos[1], ease),
          THREE.MathUtils.lerp(HQ_CAMERA_PRESETS.introStart.pos[2], heroEnd.pos[2], ease)
        );
        controls.target.set(
          THREE.MathUtils.lerp(HQ_CAMERA_PRESETS.introStart.target[0], heroEnd.target[0], ease),
          THREE.MathUtils.lerp(HQ_CAMERA_PRESETS.introStart.target[1], heroEnd.target[1], ease),
          THREE.MathUtils.lerp(HQ_CAMERA_PRESETS.introStart.target[2], heroEnd.target[2], ease)
        );

        if (u >= 1) {
          ctrl.introActive = false;
          stateRef.current.onIntroStateChange?.(false);
        }
      } else if (ctrl.transitionActive) {
        // 2. Smooth Exponential Camera Focus / Reset Glide
        const lambda = 4.6;
        camera.position.x = THREE.MathUtils.damp(camera.position.x, _targetCamPos.x, lambda, dt);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, _targetCamPos.y, lambda, dt);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, _targetCamPos.z, lambda, dt);

        controls.target.x = THREE.MathUtils.damp(controls.target.x, _targetLookAt.x, lambda, dt);
        controls.target.y = THREE.MathUtils.damp(controls.target.y, _targetLookAt.y, lambda, dt);
        controls.target.z = THREE.MathUtils.damp(controls.target.z, _targetLookAt.z, lambda, dt);

        if (
          camera.position.distanceTo(_targetCamPos) < 0.12 &&
          controls.target.distanceTo(_targetLookAt) < 0.08
        ) {
          ctrl.transitionActive = false;
        }
      }

      // 3. Clamp Pan Target politely so campus never drifts out of view
      controls.target.x = THREE.MathUtils.clamp(controls.target.x, -18, 18);
      controls.target.y = THREE.MathUtils.clamp(controls.target.y, 1.0, 24.5);
      controls.target.z = THREE.MathUtils.clamp(controls.target.z, -18, 24);

      // Auto-explore rotation (paused cleanly during intro, focus glide, or reduced motion)
      controls.autoRotate =
        stateRef.current.autoExplore &&
        !prefersReducedMotion &&
        !isSoftwareGl &&
        !ctrl.introActive &&
        !ctrl.transitionActive;

      controls.update();

      // 4. Smooth Day <-> Night, Exterior <-> Interior & Architectural <-> Holo Focus Transitions
      const targetNight = stateRef.current.timeOfDay === 'night' ? 1.0 : 0.0;
      nightMix = THREE.MathUtils.damp(nightMix, targetNight, 3.6, dt);

      const targetInterior = stateRef.current.viewMode === 'interior' ? 1.0 : 0.0;
      interiorMix = THREE.MathUtils.damp(interiorMix, targetInterior, 5.2, dt);

      const targetHoloFocus =
        stateRef.current.viewMode === 'interior' &&
        stateRef.current.interiorLighting === 'holo-focus'
          ? 1.0
          : 0.0;
      holoFocusMix = THREE.MathUtils.damp(holoFocusMix, targetHoloFocus, 4.6, dt);

      renderer.toneMappingExposure = THREE.MathUtils.lerp(1.06, 0.96, nightMix);

      hq.updateEnvironment(
        nightMix,
        interiorMix,
        elapsed,
        dt,
        stateRef.current.hoveredZoneId,
        stateRef.current.selectedZoneId,
        holoFocusMix
      );

      renderer.render(scene, camera);
      updateDomPins();

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    // Initial render
    hq.updateEnvironment(
      nightMix,
      interiorMix,
      0,
      0.016,
      stateRef.current.hoveredZoneId,
      stateRef.current.selectedZoneId,
      holoFocusMix
    );
    renderer.render(scene, camera);
    updateDomPins();

    if (isSoftwareGl) {
      afterDraw(tick);
    } else {
      frameId = requestAnimationFrame(tick);
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      controls.removeEventListener('start', onControlStart);
      controls.dispose();

      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      renderer.domElement.removeEventListener(
        'webglcontextrestored',
        onContextRestored
      );
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('pointerleave', onPointerLeave);

      hq.dispose();
      envTex.dispose();
      renderer.dispose();

      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Graceful Interactive 2D Architectural Schematic Fallback if WebGL is unavailable
  if (webglUnavailable) {
    return (
      <div className="relative flex h-full w-full flex-col items-center justify-center bg-[#090d16] p-8 text-center">
        <svg
          viewBox="0 0 640 320"
          className="h-56 w-full max-w-xl opacity-85"
          fill="none"
          aria-hidden="true"
        >
          <ellipse cx="320" cy="255" rx="240" ry="38" stroke="#cbb692" strokeOpacity="0.35" strokeWidth="1" />
          <ellipse cx="320" cy="250" rx="175" ry="26" stroke="#94a3b8" strokeOpacity="0.35" strokeWidth="1" />
          <path d="M286 245 C292 175 298 125 304 68 L336 68 C342 125 348 175 354 245 Z" stroke="#e2e8f0" strokeWidth="1.2" fill="rgba(148,163,184,0.12)" />
          <ellipse cx="320" cy="64" rx="58" ry="12" stroke="#cbb692" strokeWidth="1.6" />
          <path d="M165 245 L268 245 L268 182 L190 198 L165 215 Z" stroke="#cbd5e1" strokeOpacity="0.6" strokeWidth="1.1" fill="rgba(148,163,184,0.08)" />
          <path d="M385 245 L475 245 C470 205 445 192 430 192 C412 192 392 206 385 245 Z" stroke="#cbd5e1" strokeOpacity="0.6" strokeWidth="1.1" fill="rgba(148,163,184,0.08)" />
          <line x1="268" y1="186" x2="294" y2="184" stroke="#cbb692" strokeWidth="1.5" />
          <line x1="346" y1="205" x2="392" y2="208" stroke="#cbb692" strokeWidth="1.5" />
        </svg>
        <p className="mt-4 text-sm font-medium text-[#F5F7FA]">
          Interactive 3D Architectural Preview Unavailable
        </p>
        <p className="mt-1.5 max-w-md text-xs leading-relaxed text-[#969EAE]">
          WebGL hardware graphics are disabled in this browser context. You can
          still explore every conceptual headquarters zone below.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden select-none"
    >
      {/* Dedicated Isolated WebGL Canvas Mount */}
      <div ref={canvasMountRef} className="h-full w-full" />

      {/* Crisp Semantic DOM Spatial Pins projected smoothly from 3D anchors */}
      <div
        aria-label="Conceptual Headquarters Architectural Zones"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        {HQ_ZONES.map((zone) => {
          const isSelected = selectedZoneId === zone.id;
          const isHovered = hoveredZoneId === zone.id;
          return (
            <button
              key={zone.id}
              ref={(el) => {
                pinRefs.current[zone.id] = el;
              }}
              type="button"
              onMouseEnter={() => onHoverZone(zone.id)}
              onMouseLeave={() => onHoverZone(null)}
              onClick={() => {
                onSelectZone(zone);
                cameraCtrlRef.current.introActive = false;
                onIntroStateChange?.(false);
                cameraCtrlRef.current.setGoal(zone.cameraPos, zone.cameraTarget);
              }}
              aria-label={`Inspect Zone ${zone.number}: ${zone.name}`}
              aria-pressed={isSelected}
              style={{ opacity: 0, left: 0, top: 0 }}
              className="group absolute flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e2c799]"
            >
              <span
                className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border font-mono text-[10px] sm:text-[11px] font-semibold tabular-nums transition-transform duration-150 ${
                  isSelected
                    ? 'scale-110 border-[#e2c799] bg-[#e2c799] text-[#050608] shadow-md'
                    : isHovered
                      ? 'scale-105 border-white/80 bg-[#0d1320] text-[#F5F7FA]'
                      : 'border-white/35 bg-[#080b12]/88 text-[#e2e8f0] hover:border-white/75'
                }`}
              >
                {zone.number}
              </span>

              {/* Subtle Architectural Callout Label on Hover or Active Selection */}
              <span
                className={`hidden sm:inline-block whitespace-nowrap rounded-md border px-2.5 py-1 text-[11px] font-medium tracking-wide transition-opacity duration-150 ${
                  isSelected
                    ? 'border-[#e2c799]/55 bg-[#080b12]/94 text-[#F5F7FA] opacity-100'
                    : isHovered
                      ? 'border-white/25 bg-[#080b12]/92 text-[#F5F7FA] opacity-100'
                      : 'pointer-events-none opacity-0'
                }`}
              >
                {zone.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
});
