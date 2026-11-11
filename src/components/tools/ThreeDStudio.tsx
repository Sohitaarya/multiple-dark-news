import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  Layers,
  RotateCw,
  Box,
  Eye,
  Sun,
  Palette,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Sparkles,
  Shield,
  Compass
} from 'lucide-react';

interface ThreeDStudioProps {
  onBack?: () => void;
}

// Pre-allocated scratch vectors to prevent GC churn during animation ticks
const _scratchVec = new THREE.Vector3();
const _targetPos = new THREE.Vector3();

export const ThreeDStudio: React.FC<ThreeDStudioProps> = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [explodedVal, setExplodedVal] = useState(0);
  const [activeFinish, setActiveFinish] = useState<'titanium' | 'matteBlack' | 'carbonGold' | 'emeraldChrome'>('titanium');
  const [isWireframe, setIsWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [lightingPreset, setLightingPreset] = useState<'studio' | 'cyber' | 'golden'>('studio');
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);

  // References to mutable Three.js scene objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const droneGroupRef = useRef<THREE.Group | null>(null);
  const partsRef = useRef<{ mesh: THREE.Mesh; basePos: THREE.Vector3; explodeDir: THREE.Vector3 }[]>([]);
  const materialsMapRef = useRef<Map<string, THREE.MeshStandardMaterial>>(new Map());
  const lightsRef = useRef<{ keyLight: THREE.DirectionalLight; hemiLight: THREE.HemisphereLight; rimLight: THREE.PointLight } | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Detect software WebGL guard
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    // 1. Scene & Horizon Fog
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617); // Slate 950 deep midnight
    scene.fog = new THREE.FogExp2(0x020617, 0.04);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(4.5, 3.2, 5.5);
    cameraRef.current = camera;

    // 3. Renderer with ACESFilmicToneMapping & PCF Soft Shadows
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // 4. Procedural Studio Reflection (RoomEnvironment)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 5. Damped OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.02; // prevent going below ground
    controls.minDistance = 2;
    controls.maxDistance = 14;
    controls.target.set(0, 0.8, 0);
    controlsRef.current = controls;

    // 6. Balanced 3-Point Lighting Rig
    const keyLight = new THREE.DirectionalLight(0xfff3e0, 2.4);
    keyLight.position.set(5, 7, 4);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 20;
    keyLight.shadow.camera.left = -3;
    keyLight.shadow.camera.right = 3;
    keyLight.shadow.camera.top = 3;
    keyLight.shadow.camera.bottom = -3;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x0f172a, 0.9);
    scene.add(hemiLight);

    const rimLight = new THREE.PointLight(0xf43f5e, 2.0, 10);
    rimLight.position.set(-4, 3, -4);
    scene.add(rimLight);

    lightsRef.current = { keyLight, hemiLight, rimLight };

    // 7. Ground Grid & Contact Radial Shadow
    const floorGeo = new THREE.PlaneGeometry(30, 30);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x030712,
      roughness: 0.9,
      metalness: 0.1,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = !isSoftwareGl;
    scene.add(floor);

    // Procedural Radial Contact Shadow Texture
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const sCtx = shadowCanvas.getContext('2d');
    if (sCtx) {
      const grad = sCtx.createRadialGradient(128, 128, 10, 128, 128, 120);
      grad.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
      grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.3)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 256, 256);
    }
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
    const contactShadowGeo = new THREE.PlaneGeometry(3.5, 3.5);
    const contactShadowMat = new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
    });
    const contactShadow = new THREE.Mesh(contactShadowGeo, contactShadowMat);
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.y = 0.005; // avoid Z-fighting
    scene.add(contactShadow);

    // Procedural Tech Grid Overlay
    const grid = new THREE.GridHelper(20, 40, 0x0284c7, 0x1e293b);
    grid.position.y = 0.002;
    scene.add(grid);

    // 8. Composite 3D Subject: 8-Part Procedural Exploration Drone
    // (Never a single primitive; assembled as distinct parts with bevels, varied roughness/metalness)
    const droneGroup = new THREE.Group();
    droneGroup.position.set(0, 0.8, 0);
    scene.add(droneGroup);
    droneGroupRef.current = droneGroup;

    // Materials Library
    const primaryMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0, // Brushed Titanium
      roughness: 0.25,
      metalness: 0.9,
    });
    const darkChassisMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a, // Slate Composite Core
      roughness: 0.55,
      metalness: 0.6,
    });
    const accentMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Cyan Optics / Core
      roughness: 0.15,
      metalness: 0.8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.4,
    });
    const goldTrimMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // Amber Avionics
      roughness: 0.3,
      metalness: 0.95,
    });

    materialsMapRef.current.set('primary', primaryMat);
    materialsMapRef.current.set('darkChassis', darkChassisMat);
    materialsMapRef.current.set('accent', accentMat);
    materialsMapRef.current.set('goldTrim', goldTrimMat);

    const partsList: { mesh: THREE.Mesh; basePos: THREE.Vector3; explodeDir: THREE.Vector3 }[] = [];

    // Part 1: Central Avionics Fuselage
    const fuselageGeo = new THREE.CylinderGeometry(0.7, 0.9, 0.4, 8);
    const fuselage = new THREE.Mesh(fuselageGeo, darkChassisMat);
    fuselage.castShadow = !isSoftwareGl;
    fuselage.position.set(0, 0, 0);
    droneGroup.add(fuselage);
    partsList.push({ mesh: fuselage, basePos: new THREE.Vector3(0, 0, 0), explodeDir: new THREE.Vector3(0, 0, 0) });

    // Part 2: Top Protective Armor Cowl (Upwards explosion)
    const topDomeGeo = new THREE.SphereGeometry(0.65, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    const topDome = new THREE.Mesh(topDomeGeo, primaryMat);
    topDome.position.set(0, 0.2, 0);
    topDome.castShadow = !isSoftwareGl;
    droneGroup.add(topDome);
    partsList.push({ mesh: topDome, basePos: new THREE.Vector3(0, 0.2, 0), explodeDir: new THREE.Vector3(0, 1.2, 0) });

    // Part 3: Front Optical Sensor Sensor Gimbal
    const sensorGeo = new THREE.SphereGeometry(0.22, 16, 16);
    const sensorMesh = new THREE.Mesh(sensorGeo, accentMat);
    sensorMesh.position.set(0, 0, 0.85);
    droneGroup.add(sensorMesh);
    partsList.push({ mesh: sensorMesh, basePos: new THREE.Vector3(0, 0, 0.85), explodeDir: new THREE.Vector3(0, 0, 1.4) });

    // Parts 4, 5, 6, 7: Four Carbon Rotor Arms & Turbine Pods (Radially exploded)
    const armAngles = [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4];
    armAngles.forEach((angle, idx) => {
      const armGroup = new THREE.Group();
      const armLength = 1.3;

      // Arm spar
      const armGeo = new THREE.BoxGeometry(0.12, 0.08, armLength);
      const arm = new THREE.Mesh(armGeo, primaryMat);
      arm.position.set(0, 0, armLength / 2);
      armGroup.add(arm);

      // Turbine housing
      const podGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.2, 16);
      const pod = new THREE.Mesh(podGeo, darkChassisMat);
      pod.position.set(0, 0.08, armLength);
      armGroup.add(pod);

      // Rotor blades (accent)
      const bladeGeo = new THREE.BoxGeometry(0.7, 0.02, 0.08);
      const blade = new THREE.Mesh(bladeGeo, goldTrimMat);
      blade.position.set(0, 0.2, armLength);
      blade.name = `blade_${idx}`;
      armGroup.add(blade);

      armGroup.rotation.y = angle;
      droneGroup.add(armGroup);

      const radDir = new THREE.Vector3(Math.sin(angle), 0, Math.cos(angle)).normalize();
      partsList.push({
        mesh: armGroup as any,
        basePos: new THREE.Vector3(0, 0, 0),
        explodeDir: radDir.multiplyScalar(1.2),
      });
    });

    // Part 8: Bottom Heavy Landing Skids (Downward explosion)
    const skidGroup = new THREE.Group();
    const skidGeo = new THREE.TorusGeometry(0.75, 0.04, 8, 24);
    const skid = new THREE.Mesh(skidGeo, goldTrimMat);
    skid.rotation.x = Math.PI / 2;
    skid.position.y = -0.35;
    skidGroup.add(skid);
    droneGroup.add(skidGroup);
    partsList.push({
      mesh: skidGroup as any,
      basePos: new THREE.Vector3(0, 0, 0),
      explodeDir: new THREE.Vector3(0, -1.0, 0),
    });

    partsRef.current = partsList;

    // 9. Lossless 60fps Render Loop with Exponential Damping
    let frameId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Smooth camera orbit damping
      controls.update();

      // Gentle procedural idle hovering
      if (droneGroupRef.current) {
        droneGroupRef.current.position.y = 0.8 + Math.sin(clock.getElapsedTime() * 1.5) * 0.04;
      }

      // Fast spinning of the 4 rotor blades
      armAngles.forEach((_, idx) => {
        const blade = droneGroup.getObjectByName(`blade_${idx}`);
        if (blade) {
          blade.rotation.y += delta * 18;
        }
      });

      // Smooth exploded view positioning
      partsRef.current.forEach((part) => {
        _targetPos.copy(part.basePos).addScaledVector(part.explodeDir, explodedVal);
        part.mesh.position.lerp(_targetPos, 0.1);
      });

      renderer.render(scene, camera);
    };

    animate();

    // 10. Responsive Window Resize
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      cameraRef.current.aspect = newW / newH;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update exploded distance
  useEffect(() => {
    // animate loop lerps to explodedVal automatically
  }, [explodedVal]);

  // Update Finish / Material presets
  useEffect(() => {
    const primary = materialsMapRef.current.get('primary');
    const darkChassis = materialsMapRef.current.get('darkChassis');
    if (!primary || !darkChassis) return;

    if (activeFinish === 'titanium') {
      primary.color.setHex(0xe2e8f0);
      primary.roughness = 0.25;
      primary.metalness = 0.9;
      darkChassis.color.setHex(0x0f172a);
    } else if (activeFinish === 'matteBlack') {
      primary.color.setHex(0x18181b);
      primary.roughness = 0.65;
      primary.metalness = 0.3;
      darkChassis.color.setHex(0x09090b);
    } else if (activeFinish === 'carbonGold') {
      primary.color.setHex(0xd97706);
      primary.roughness = 0.2;
      primary.metalness = 0.95;
      darkChassis.color.setHex(0x1c1917);
    } else if (activeFinish === 'emeraldChrome') {
      primary.color.setHex(0x059669);
      primary.roughness = 0.15;
      primary.metalness = 0.9;
      darkChassis.color.setHex(0x064e3b);
    }
  }, [activeFinish]);

  // Toggle Wireframe
  useEffect(() => {
    materialsMapRef.current.forEach((mat) => {
      mat.wireframe = isWireframe;
    });
  }, [isWireframe]);

  // Toggle Auto Rotate
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
      controlsRef.current.autoRotateSpeed = 1.5;
    }
  }, [autoRotate]);

  // Lighting presets
  useEffect(() => {
    if (!lightsRef.current) return;
    const { keyLight, hemiLight, rimLight } = lightsRef.current;

    if (lightingPreset === 'studio') {
      keyLight.color.setHex(0xfff3e0);
      hemiLight.color.setHex(0x38bdf8);
      rimLight.color.setHex(0xf43f5e);
    } else if (lightingPreset === 'cyber') {
      keyLight.color.setHex(0x06b6d4);
      hemiLight.color.setHex(0x8b5cf6);
      rimLight.color.setHex(0x10b981);
    } else if (lightingPreset === 'golden') {
      keyLight.color.setHex(0xfbbf24);
      hemiLight.color.setHex(0xf97316);
      rimLight.color.setHex(0xd97706);
    }
  }, [lightingPreset]);

  // Camera Presets
  const setCameraPreset = (preset: 'front' | 'iso' | 'top') => {
    if (!cameraRef.current || !controlsRef.current) return;
    if (preset === 'front') {
      cameraRef.current.position.set(0, 1.2, 6);
    } else if (preset === 'iso') {
      cameraRef.current.position.set(4.5, 3.2, 5.5);
    } else if (preset === 'top') {
      cameraRef.current.position.set(0, 7.5, 0.1);
    }
    controlsRef.current.target.set(0, 0.8, 0);
  };

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] min-h-[640px] bg-slate-950 overflow-hidden select-none">
      {/* 3D WebGL Canvas Mount Container */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Left: Minimal Spec Badge */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none space-y-1">
        <div className="flex items-center gap-2 px-3 py-1 bg-slate-900/90 border border-slate-800 rounded-full text-xs font-semibold text-cyan-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Three.js PBR Studio Engine</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          3D Autonomous Recon Drone
        </h1>
        <p className="text-xs text-slate-400 font-mono">
          Composite 8-Part Procedural Model • 60 FPS Studio Environment
        </p>
      </div>

      {/* Top Right: Quick Camera Views */}
      <div className="absolute top-6 right-6 z-10 flex items-center gap-2">
        <button
          onClick={() => setCameraPreset('iso')}
          className="px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-semibold text-slate-200 transition-colors"
        >
          Isometric
        </button>
        <button
          onClick={() => setCameraPreset('front')}
          className="px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-semibold text-slate-200 transition-colors"
        >
          Front
        </button>
        <button
          onClick={() => setCameraPreset('top')}
          className="px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-semibold text-slate-200 transition-colors"
        >
          Top View
        </button>
      </div>

      {/* Unified Bottom Floating Dock (Cinema/Zen Collapsible, <= 15% Viewport) */}
      <div
        className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-[94vw] max-w-4xl transition-all duration-300 ease-out ${
          isDockCollapsed ? 'translate-y-[calc(100%-2.5rem)]' : 'translate-y-0'
        }`}
      >
        {/* Collapse Toggle Tab */}
        <div className="flex justify-center -mb-px">
          <button
            onClick={() => setIsDockCollapsed(!isDockCollapsed)}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-900 border border-b-0 border-slate-800 rounded-t-xl text-xs font-bold text-slate-300 hover:text-white transition-colors"
          >
            {isDockCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>{isDockCollapsed ? 'Expand 3D Controls' : 'Collapse HUD'}</span>
          </button>
        </div>

        {/* Dock Controls Body */}
        <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            
            {/* 1. Exploded View Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Exploded View</span>
                </span>
                <span className="font-mono text-cyan-400 font-bold">{Math.round(explodedVal * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1.5"
                step="0.01"
                value={explodedVal}
                onChange={(e) => setExplodedVal(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 h-1.5 bg-slate-950 rounded-lg cursor-pointer"
              />
            </div>

            {/* 2. PBR Material Finish Swatches */}
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-rose-400" />
                <span>PBR Surface Finish</span>
              </div>
              <div className="flex items-center gap-2">
                {[
                  { id: 'titanium', name: 'Titanium', color: '#e2e8f0' },
                  { id: 'matteBlack', name: 'Onyx', color: '#18181b' },
                  { id: 'carbonGold', name: 'Gold', color: '#d97706' },
                  { id: 'emeraldChrome', name: 'Emerald', color: '#059669' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setActiveFinish(s.id as any)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                      activeFinish === s.id
                        ? 'border-cyan-400 bg-slate-800 text-white shadow-sm'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                    <span>{s.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Toggles & Lighting Presets */}
            <div className="flex items-center justify-between md:justify-end gap-3 flex-wrap">
              <button
                onClick={() => setAutoRotate(!autoRotate)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                  autoRotate ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Spin</span>
              </button>

              <button
                onClick={() => setIsWireframe(!isWireframe)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                  isWireframe ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                <Box className="w-3.5 h-3.5" />
                <span>Wireframe</span>
              </button>

              <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs">
                {(['studio', 'cyber', 'golden'] as const).map((lp) => (
                  <button
                    key={lp}
                    onClick={() => setLightingPreset(lp)}
                    className={`px-2 py-1 rounded capitalize font-medium transition-colors ${
                      lightingPreset === lp ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {lp}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
