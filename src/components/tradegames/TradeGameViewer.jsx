import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import GameLogicEngine, { buildBathroomScene } from '@/lib/gameLogicEngine';
import PartLibrary from './PartLibrary';
import GameControls from './GameControls';
import FeedbackPanel from './FeedbackPanel';
import ScenarioIntroModal from '@/components/tradegames/ScenarioIntroModal';
import MockupManager from '@/components/tradegames/MockupManager';
import { Button } from '@/components/ui/button';
import { Save, FolderOpen } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function TradeGameViewer({ gameData, gameMode, onGameComplete, onScoreUpdate }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const gameEngineRef = useRef(null);
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const cameraAngleRef = useRef({ phi: Math.PI / 4, theta: Math.PI / 6 });
  const cameraRadiusRef = useRef(5.5);

  const [score, setScore] = useState(0);
  const [moveCount, setMoveCount] = useState(0);
  const [isGameSolved, setIsGameSolved] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [selectedPart, setSelectedPart] = useState(null);
  const [availableParts, setAvailableParts] = useState([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [combo, setCombo] = useState(0);
  const [showIntro, setShowIntro] = useState(true);
  const [showMockupManager, setShowMockupManager] = useState(false);
  const [user, setUser] = useState(null);
  const [currentScenario, setCurrentScenario] = useState(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current || !gameData) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdce8f0);
    scene.fog = new THREE.Fog(0xdce8f0, 12, 25);
    sceneRef.current = scene;

    const w = mountRef.current.clientWidth;
    const h = mountRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 100);
    cameraRef.current = camera;

    // Initial camera position (orbiting above the bathroom)
    const phi = cameraAngleRef.current.phi;
    const theta = cameraAngleRef.current.theta;
    const r = cameraRadiusRef.current;
    camera.position.set(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(theta) + 1.5,
      r * Math.cos(phi) * Math.cos(theta)
    );
    camera.lookAt(-0.5, 0.5, -2.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // ── Lighting ──────────────────────────────────────────────────────────────
    // Ambient
    const ambient = new THREE.AmbientLight(0xfff5e8, 0.55);
    scene.add(ambient);

    // Main overhead light (bathroom ceiling fixture)
    const ceiling = new THREE.PointLight(0xfff8e7, 1.8, 12);
    ceiling.position.set(0, 3.8, -2);
    ceiling.castShadow = true;
    ceiling.shadow.mapSize.setScalar(1024);
    ceiling.shadow.radius = 4;
    scene.add(ceiling);

    // Secondary soft fill
    const fill = new THREE.DirectionalLight(0xe8f0ff, 0.4);
    fill.position.set(-3, 4, 2);
    scene.add(fill);

    // Warm accent light near vanity
    const vanityLight = new THREE.PointLight(0xffeedd, 0.9, 5);
    vanityLight.position.set(-1.5, 2.2, -3.2);
    scene.add(vanityLight);

    // Build bathroom environment
    buildBathroomScene(scene);

    // Initialize game engine
    const engine = new GameLogicEngine(gameData, scene);
    gameEngineRef.current = engine;
    engine.loadInitialState();
    setAvailableParts(engine.getAvailableParts());
    setIsInitializing(false);
    startTimeRef.current = Date.now();

    // Animation loop
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const handleResize = () => {
      if (!mountRef.current) return;
      const nw = mountRef.current.clientWidth;
      const nh = mountRef.current.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [gameData, gameMode]);

  // Orbit camera on mouse drag
  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const onMouseDown = (e) => { isDraggingRef.current = true; lastMouseRef.current = { x: e.clientX, y: e.clientY }; };
    const onMouseUp = () => { isDraggingRef.current = false; };
    const onMouseMove = (e) => {
      if (!isDraggingRef.current || !cameraRef.current) return;
      const dx = e.clientX - lastMouseRef.current.x;
      const dy = e.clientY - lastMouseRef.current.y;
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
      cameraAngleRef.current.phi -= dx * 0.008;
      cameraAngleRef.current.theta = Math.max(0.05, Math.min(Math.PI / 2.5, cameraAngleRef.current.theta - dy * 0.006));
      updateCameraPosition();
    };
    const onWheel = (e) => {
      cameraRadiusRef.current = Math.max(2, Math.min(10, cameraRadiusRef.current + e.deltaY * 0.005));
      updateCameraPosition();
    };

    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    el.addEventListener('mousemove', onMouseMove);
    el.addEventListener('wheel', onWheel, { passive: true });
    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      el.removeEventListener('mousemove', onMouseMove);
      el.removeEventListener('wheel', onWheel);
    };
  }, []);

  const updateCameraPosition = () => {
    if (!cameraRef.current) return;
    const { phi, theta } = cameraAngleRef.current;
    const r = cameraRadiusRef.current;
    cameraRef.current.position.set(
      -0.5 + r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(theta) + 0.8,
      -2.5 + r * Math.cos(phi) * Math.cos(theta)
    );
    cameraRef.current.lookAt(-0.5, 0.5, -2.5);
  };

  const handlePlacePart = (part) => {
    if (!gameEngineRef.current) return;
    const result = gameEngineRef.current.addPart(part);
    setMoveCount(prev => prev + 1);
    setFeedback(result.feedback);
    setCombo(result.combo || 0);
    const newScore = gameEngineRef.current.calculateScore();
    setScore(newScore);
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
  };

  const handleReset = () => {
    if (!gameEngineRef.current) return;
    gameEngineRef.current.reset();
    setScore(0); setMoveCount(0); setIsGameSolved(false);
    setFeedback(null); setSelectedPart(null); setCombo(0);
  };

  const handleGetHint = () => {
    if (!gameEngineRef.current) return;
    const hint = gameEngineRef.current.getHint();
    setFeedback({ type: 'hint', message: hint });
  };

  const handleLoadMockup = (state, name) => {
    if (!gameEngineRef.current) return;
    gameEngineRef.current.loadState(state);
    setFeedback({ type: 'info', message: `Loaded mockup: "${name}"` });
    setShowMockupManager(false);
  };

  return (
    <div className="flex h-screen gap-0 bg-slate-900 overflow-hidden">
      {/* Scenario intro modal */}
      {showIntro && gameData && (
        <ScenarioIntroModal
          gameData={gameData}
          onStart={(scenario) => { setCurrentScenario(scenario); setShowIntro(false); }}
          onClose={() => setShowIntro(false)}
        />
      )}

      {/* Mockup manager */}
      {showMockupManager && (
        <MockupManager
          user={user}
          currentSceneState={gameEngineRef.current?.getCurrentState()}
          tradeType={gameData?.trade_type || 'plumbing'}
          gameId={gameData?.id}
          onLoad={handleLoadMockup}
          onClose={() => setShowMockupManager(false)}
        />
      )}

      {/* 3D Canvas */}
      <div className="flex-1 relative">
        {isInitializing && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 z-10">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              <p className="text-white/80 text-sm font-medium">Building bathroom scene...</p>
            </div>
          </div>
        )}

        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Camera hint overlay */}
        {!isInitializing && (
          <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-sm text-white/70 text-xs rounded-lg px-3 py-2">
            Drag to rotate • Scroll to zoom
          </div>
        )}

        {/* Scenario context pill */}
        {currentScenario && (
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm shadow-lg rounded-xl px-4 py-3 max-w-xs">
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">Active Job</p>
            <p className="text-sm font-bold text-slate-800">{currentScenario.title}</p>
            <p className="text-xs text-slate-500 mt-1">Customer: {currentScenario.customerName}</p>
          </div>
        )}

        {/* Top right action buttons */}
        <div className="absolute top-4 right-4 flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="gap-1.5 bg-white/90 backdrop-blur-sm shadow-md hover:bg-white text-slate-700"
            onClick={() => setShowMockupManager(true)}
          >
            <Save className="w-3.5 h-3.5" />
            Mockups
          </Button>
          {!showIntro && (
            <Button
              size="sm"
              variant="secondary"
              className="gap-1.5 bg-white/90 backdrop-blur-sm shadow-md hover:bg-white text-slate-700"
              onClick={() => setShowIntro(true)}
            >
              View Scenario
            </Button>
          )}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-72 flex flex-col gap-3 p-3 bg-slate-100 border-l border-slate-200 overflow-y-auto">
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
    </div>
  );
}