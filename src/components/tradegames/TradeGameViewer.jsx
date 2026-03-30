import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import GameLogicEngine from '@/lib/gameLogicEngine';
import PartLibrary from './PartLibrary';
import GameControls from './GameControls';
import FeedbackPanel from './FeedbackPanel';
import SaveMockupModal from './SaveMockupModal';
import MockupLibrary from './MockupLibrary';
import { Button } from '@/components/ui/button';
import { Save, FolderOpen, RotateCcw } from 'lucide-react';

// ─── Bathroom Environment Builder ───────────────────────────────────────────
function buildBathroomScene(scene) {
  // Tiled floor
  const floorGeo = new THREE.PlaneGeometry(8, 8);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0xf0ede8,
    roughness: 0.6,
    metalness: 0.0
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  floor.userData.isEnvironment = true;
  scene.add(floor);

  // Tile grid lines (overlay)
  const tileLineMat = new THREE.MeshStandardMaterial({ color: 0xd4cfc9, roughness: 1 });
  for (let i = -4; i <= 4; i += 0.6) {
    const hLine = new THREE.Mesh(new THREE.PlaneGeometry(8, 0.02), tileLineMat);
    hLine.rotation.x = -Math.PI / 2;
    hLine.position.set(0, 0.001, i);
    hLine.userData.isEnvironment = true;
    scene.add(hLine);
    const vLine = new THREE.Mesh(new THREE.PlaneGeometry(0.02, 8), tileLineMat);
    vLine.rotation.x = -Math.PI / 2;
    vLine.position.set(i, 0.001, 0);
    vLine.userData.isEnvironment = true;
    scene.add(vLine);
  }

  // Back wall
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xfaf8f5, roughness: 0.7 });
  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(8, 4), wallMat);
  backWall.position.set(0, 2, -4);
  backWall.userData.isEnvironment = true;
  scene.add(backWall);

  // Left wall
  const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(8, 4), wallMat);
  leftWall.rotation.y = Math.PI / 2;
  leftWall.position.set(-4, 2, 0);
  leftWall.userData.isEnvironment = true;
  scene.add(leftWall);

  // Baseboard (back)
  const baseboardMat = new THREE.MeshStandardMaterial({ color: 0xe8e4df, roughness: 0.5 });
  const baseboard = new THREE.Mesh(new THREE.BoxGeometry(8, 0.15, 0.06), baseboardMat);
  baseboard.position.set(0, 0.075, -3.97);
  baseboard.userData.isEnvironment = true;
  scene.add(baseboard);

  // ── SINK ──────────────────────────────────────────────────────────────────
  const ceramicMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.15, metalness: 0.05 });
  const chromeMat = new THREE.MeshStandardMaterial({ color: 0xd0d0d0, roughness: 0.1, metalness: 0.9 });

  // Vanity cabinet
  const vanityMat = new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.7 });
  const vanity = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.85, 0.55), vanityMat);
  vanity.position.set(-1.5, 0.425, -3.5);
  vanity.castShadow = true;
  vanity.receiveShadow = true;
  vanity.userData.isEnvironment = true;
  scene.add(vanity);

  // Vanity countertop
  const counterMat = new THREE.MeshStandardMaterial({ color: 0xf0ede8, roughness: 0.3, metalness: 0.0 });
  const counter = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.06, 0.6), counterMat);
  counter.position.set(-1.5, 0.88, -3.5);
  counter.castShadow = true;
  counter.userData.isEnvironment = true;
  scene.add(counter);

  // Sink basin
  const sinkBasin = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.22, 0.14, 24), ceramicMat);
  sinkBasin.position.set(-1.5, 0.88, -3.5);
  sinkBasin.castShadow = true;
  sinkBasin.userData.isEnvironment = true;
  scene.add(sinkBasin);

  // Faucet neck
  const faucetBase = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.2, 12), chromeMat);
  faucetBase.position.set(-1.5, 1.0, -3.75);
  faucetBase.userData.isEnvironment = true;
  scene.add(faucetBase);
  const faucetNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.25, 12), chromeMat);
  faucetNeck.rotation.x = -Math.PI / 4;
  faucetNeck.position.set(-1.5, 1.12, -3.62);
  faucetNeck.userData.isEnvironment = true;
  scene.add(faucetNeck);

  // Drain pipe stub (this is where the puzzle pipes will connect)
  const drainStub = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.25, 12), chromeMat);
  drainStub.position.set(-1.5, 0.75, -3.5);
  drainStub.userData.isEnvironment = true;
  drainStub.userData.isConnectionPoint = true;
  scene.add(drainStub);

  // ── TOILET ────────────────────────────────────────────────────────────────
  const toiletBase = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.38, 0.65), ceramicMat);
  toiletBase.position.set(1.5, 0.19, -3.5);
  toiletBase.castShadow = true;
  toiletBase.userData.isEnvironment = true;
  scene.add(toiletBase);

  const toiletBowl = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.18, 0.22, 20), ceramicMat);
  toiletBowl.position.set(1.5, 0.49, -3.4);
  toiletBowl.userData.isEnvironment = true;
  scene.add(toiletBowl);

  const toiletTank = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.36, 0.2), ceramicMat);
  toiletTank.position.set(1.5, 0.56, -3.75);
  toiletTank.castShadow = true;
  toiletTank.userData.isEnvironment = true;
  scene.add(toiletTank);

  const tankLid = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.04, 0.22), ceramicMat);
  tankLid.position.set(1.5, 0.76, -3.75);
  tankLid.userData.isEnvironment = true;
  scene.add(tankLid);

  // ── MIRROR ────────────────────────────────────────────────────────────────
  const mirrorFrame = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.9, 0.04), new THREE.MeshStandardMaterial({ color: 0xc0c0c0, metalness: 0.6, roughness: 0.3 }));
  mirrorFrame.position.set(-1.5, 2.0, -3.95);
  mirrorFrame.userData.isEnvironment = true;
  scene.add(mirrorFrame);

  const mirrorSurface = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.8), new THREE.MeshStandardMaterial({ color: 0xd8f0f8, metalness: 0.95, roughness: 0.05 }));
  mirrorSurface.position.set(-1.5, 2.0, -3.93);
  mirrorSurface.userData.isEnvironment = true;
  scene.add(mirrorSurface);

  // ── TOWEL BAR ─────────────────────────────────────────────────────────────
  const barMat = new THREE.MeshStandardMaterial({ color: 0xb0b0b0, roughness: 0.15, metalness: 0.85 });
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.55, 10), barMat);
  bar.rotation.z = Math.PI / 2;
  bar.position.set(0.8, 1.2, -3.95);
  bar.userData.isEnvironment = true;
  scene.add(bar);

  // Towel (cloth-like mesh)
  const towelMat = new THREE.MeshStandardMaterial({ color: 0x6baed6, roughness: 0.95 });
  const towel = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.5, 0.04), towelMat);
  towel.position.set(0.8, 1.02, -3.93);
  towel.userData.isEnvironment = true;
  scene.add(towel);

  // Connection point indicator (glowing ring where pipes should go)
  const ringGeo = new THREE.TorusGeometry(0.1, 0.015, 8, 24);
  const ringMat = new THREE.MeshStandardMaterial({ color: 0x00aaff, emissive: 0x0044aa, emissiveIntensity: 0.4 });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.position.set(-1.5, 0.6, -3.5);
  ring.userData.isEnvironment = true;
  scene.add(ring);
}

// ─── Orbit Controls (minimal, no import needed) ───────────────────────────
function useOrbitControls(camera, domElement) {
  const state = useRef({ isDragging: false, lastX: 0, lastY: 0, theta: 0.4, phi: 0.8, radius: 5, target: new THREE.Vector3(-0.5, 1, -2) });

  useEffect(() => {
    if (!domElement) return;
    const s = state.current;

    const onMouseDown = (e) => { s.isDragging = true; s.lastX = e.clientX; s.lastY = e.clientY; };
    const onMouseUp = () => { s.isDragging = false; };
    const onMouseMove = (e) => {
      if (!s.isDragging) return;
      const dx = (e.clientX - s.lastX) * 0.005;
      const dy = (e.clientY - s.lastY) * 0.005;
      s.theta -= dx;
      s.phi = Math.max(0.1, Math.min(Math.PI / 2.2, s.phi + dy));
      s.lastX = e.clientX; s.lastY = e.clientY;
      updateCamera();
    };
    const onWheel = (e) => {
      s.radius = Math.max(2, Math.min(10, s.radius + e.deltaY * 0.01));
      updateCamera();
    };
    const onTouchStart = (e) => { if (e.touches.length === 1) { s.isDragging = true; s.lastX = e.touches[0].clientX; s.lastY = e.touches[0].clientY; } };
    const onTouchMove = (e) => {
      if (!s.isDragging || e.touches.length !== 1) return;
      const dx = (e.touches[0].clientX - s.lastX) * 0.005;
      const dy = (e.touches[0].clientY - s.lastY) * 0.005;
      s.theta -= dx; s.phi = Math.max(0.1, Math.min(Math.PI / 2.2, s.phi + dy));
      s.lastX = e.touches[0].clientX; s.lastY = e.touches[0].clientY;
      updateCamera();
    };

    function updateCamera() {
      camera.position.set(
        s.target.x + s.radius * Math.sin(s.phi) * Math.sin(s.theta),
        s.target.y + s.radius * Math.cos(s.phi),
        s.target.z + s.radius * Math.sin(s.phi) * Math.cos(s.theta)
      );
      camera.lookAt(s.target);
    }

    updateCamera();
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);
    domElement.addEventListener('wheel', onWheel, { passive: true });
    domElement.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onMouseUp);
    window.addEventListener('touchmove', onTouchMove, { passive: true });

    return () => {
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
      domElement.removeEventListener('wheel', onWheel);
      domElement.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, [camera, domElement]);
}

// ─── Main Component ────────────────────────────────────────────────────────
export default function TradeGameViewer({ gameData, gameMode, onGameComplete, onScoreUpdate }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const gameEngineRef = useRef(null);

  const [score, setScore] = useState(0);
  const [moveCount, setMoveCount] = useState(0);
  const [isGameSolved, setIsGameSolved] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [selectedPart, setSelectedPart] = useState(null);
  const [availableParts, setAvailableParts] = useState([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [combo, setCombo] = useState(0);
  const [showSaveMockup, setShowSaveMockup] = useState(false);
  const [showMockupLibrary, setShowMockupLibrary] = useState(false);
  const [currentParts, setCurrentParts] = useState([]);
  const startTimeRef = useRef(null);

  useOrbitControls(cameraRef.current, mountRef.current);

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current || !gameData) return;

    const w = mountRef.current.clientWidth;
    const h = mountRef.current.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe8edf2);
    scene.fog = new THREE.FogExp2(0xe8edf2, 0.03);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 100);
    camera.position.set(2.5, 3.5, 3.5);
    camera.lookAt(-0.5, 1, -2);
    cameraRef.current = camera;

    // Renderer - high quality
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting rig
    const ambient = new THREE.AmbientLight(0xfff8f0, 0.5);
    scene.add(ambient);

    const sunLight = new THREE.DirectionalLight(0xfff8e8, 1.2);
    sunLight.position.set(4, 8, 4);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.1;
    sunLight.shadow.camera.far = 30;
    sunLight.shadow.camera.left = -6;
    sunLight.shadow.camera.right = 6;
    sunLight.shadow.camera.top = 6;
    sunLight.shadow.camera.bottom = -6;
    sunLight.shadow.bias = -0.001;
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0xd0e8ff, 0.4);
    fillLight.position.set(-3, 3, -2);
    scene.add(fillLight);

    const ceilLight = new THREE.PointLight(0xfff5e0, 0.6, 8);
    ceilLight.position.set(0, 3.5, -1);
    scene.add(ceilLight);

    // Build bathroom environment
    buildBathroomScene(scene);

    // Game engine
    const gameEngine = new GameLogicEngine(gameData, scene);
    gameEngineRef.current = gameEngine;
    gameEngine.loadInitialState();
    const parts = gameEngine.getAvailableParts();
    setAvailableParts(parts);
    setIsInitializing(false);
    startTimeRef.current = Date.now();

    // Orbit state (attached after camera is set)
    const orbitState = { isDragging: false, lastX: 0, lastY: 0, theta: 0.55, phi: 0.75, radius: 5.5, target: new THREE.Vector3(-0.5, 1.2, -2) };

    function updateCamera() {
      camera.position.set(
        orbitState.target.x + orbitState.radius * Math.sin(orbitState.phi) * Math.sin(orbitState.theta),
        orbitState.target.y + orbitState.radius * Math.cos(orbitState.phi),
        orbitState.target.z + orbitState.radius * Math.sin(orbitState.phi) * Math.cos(orbitState.theta)
      );
      camera.lookAt(orbitState.target);
    }
    updateCamera();

    const el = renderer.domElement;
    const onMouseDown = (e) => { orbitState.isDragging = true; orbitState.lastX = e.clientX; orbitState.lastY = e.clientY; };
    const onMouseUp = () => { orbitState.isDragging = false; };
    const onMouseMove = (e) => {
      if (!orbitState.isDragging) return;
      orbitState.theta -= (e.clientX - orbitState.lastX) * 0.005;
      orbitState.phi = Math.max(0.15, Math.min(Math.PI / 2.1, orbitState.phi + (e.clientY - orbitState.lastY) * 0.005));
      orbitState.lastX = e.clientX; orbitState.lastY = e.clientY;
      updateCamera();
    };
    const onWheel = (e) => {
      orbitState.radius = Math.max(2, Math.min(10, orbitState.radius + e.deltaY * 0.008));
      updateCamera();
    };
    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);
    el.addEventListener('wheel', onWheel, { passive: true });

    // Animation loop
    let frameId;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const handleResize = () => {
      if (!mountRef.current) return;
      const w2 = mountRef.current.clientWidth;
      const h2 = mountRef.current.clientHeight;
      camera.aspect = w2 / h2;
      camera.updateProjectionMatrix();
      renderer.setSize(w2, h2);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      el.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
      el.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [gameData, gameMode]);

  const handlePlacePart = (part) => {
    if (!gameEngineRef.current) return;
    const result = gameEngineRef.current.addPart(part);
    setMoveCount(prev => prev + 1);
    setFeedback(result.feedback);
    setCombo(result.combo || 0);
    const newScore = gameEngineRef.current.calculateScore();
    setScore(newScore);
    setCurrentParts(gameEngineRef.current.currentState?.parts || []);
    onScoreUpdate?.(newScore);
    if (gameEngineRef.current.isSolved()) {
      setIsGameSolved(true);
      const duration = startTimeRef.current ? Math.floor((Date.now() - startTimeRef.current) / 1000) : 0;
      onGameComplete?.({ score: newScore, moves: moveCount + 1, duration });
    }
  };

  const handleRemovePart = (partId) => {
    if (!gameEngineRef.current) return;
    gameEngineRef.current.removePart(partId);
    setMoveCount(prev => prev + 1);
    setFeedback({ type: 'info', message: 'Part removed.' });
    setCurrentParts(gameEngineRef.current.currentState?.parts || []);
  };

  const handleReset = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.reset();
      setScore(0); setMoveCount(0); setIsGameSolved(false);
      setFeedback(null); setSelectedPart(null); setCombo(0);
      setCurrentParts([]);
    }
  };

  const handleGetHint = () => {
    if (gameEngineRef.current) {
      setFeedback({ type: 'hint', message: gameEngineRef.current.getHint() });
    }
  };

  const handleLoadMockup = useCallback((parts, mockup) => {
    if (!gameEngineRef.current || !sceneRef.current) return;
    // Clear & reload from saved parts
    gameEngineRef.current.currentState.parts = [];
    gameEngineRef.current.renderScene();
    parts.forEach(p => gameEngineRef.current.createPartMesh(p));
    gameEngineRef.current.currentState.parts = parts;
    setCurrentParts(parts);
    setFeedback({ type: 'info', message: `Loaded mockup: "${mockup.title}"` });
    setShowMockupLibrary(false);
  }, []);

  return (
    <div className="flex h-[calc(100vh-64px)] gap-0 bg-slate-100">
      {/* 3D Canvas */}
      <div className="flex-1 relative overflow-hidden rounded-none shadow-inner">
        {isInitializing && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/30 z-10">
            <div className="bg-white rounded-xl px-6 py-4 flex flex-col items-center gap-3 shadow-xl">
              <div className="w-7 h-7 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
              <p className="text-slate-700 font-medium text-sm">Loading bathroom...</p>
            </div>
          </div>
        )}
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Canvas hint overlay */}
        <div className="absolute bottom-3 left-3 bg-black/40 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm pointer-events-none">
          🖱 Drag to rotate · Scroll to zoom
        </div>

        {/* Save/Load toolbar */}
        <div className="absolute top-3 right-3 flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="bg-white/90 backdrop-blur-sm shadow gap-1.5 text-xs"
            onClick={() => setShowMockupLibrary(true)}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            Load
          </Button>
          <Button
            size="sm"
            className="bg-blue-600/90 backdrop-blur-sm shadow gap-1.5 text-xs text-white"
            onClick={() => setShowSaveMockup(true)}
          >
            <Save className="w-3.5 h-3.5" />
            Save Mockup
          </Button>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-72 flex flex-col gap-3 p-3 bg-slate-50 border-l border-slate-200 overflow-y-auto">
        <FeedbackPanel feedback={feedback} score={score} moveCount={moveCount} combo={combo} />
        <GameControls
          gameMode={gameMode}
          isGameSolved={isGameSolved}
          onReset={handleReset}
          onGetHint={handleGetHint}
        />
        <PartLibrary
          parts={availableParts}
          selectedPart={selectedPart}
          onSelectPart={setSelectedPart}
          onPlacePart={handlePlacePart}
        />
      </div>

      {/* Modals */}
      {showSaveMockup && (
        <SaveMockupModal
          parts={currentParts}
          gameId={gameData?.id}
          onSaved={() => setFeedback({ type: 'success', message: 'Mockup saved successfully!' })}
          onClose={() => setShowSaveMockup(false)}
        />
      )}
      {showMockupLibrary && (
        <MockupLibrary
          onLoad={handleLoadMockup}
          onClose={() => setShowMockupLibrary(false)}
        />
      )}
    </div>
  );
}