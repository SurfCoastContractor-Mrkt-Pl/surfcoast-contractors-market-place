import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import GameLogicEngine from '@/lib/gameLogicEngine';
import PartLibrary from './PartLibrary';
import GameControls from './GameControls';
import FeedbackPanel from './FeedbackPanel';

export default function TradeGameViewer({ gameData, gameMode, onGameComplete, onScoreUpdate }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const gameEngineRef = useRef(null);
  const [score, setScore] = useState(0);
  const [moveCount, setMoveCount] = useState(0);
  const [isGameSolved, setIsGameSolved] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [selectedPart, setSelectedPart] = useState(null);
  const [availableParts, setAvailableParts] = useState([]);
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize Three.js scene and game engine
  useEffect(() => {
    if (!mountRef.current || !gameData) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 2, 5);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0xe0e0e0 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Initialize game engine
    const gameEngine = new GameLogicEngine(gameData, scene);
    gameEngineRef.current = gameEngine;

    // Load initial state
    gameEngine.loadInitialState();
    setAvailableParts(gameEngine.getAvailableParts());
    setIsInitializing(false);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      if (mountRef.current) {
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [gameData, gameMode]);

  // Handle part placement
  const handlePlacePart = (part) => {
    if (!gameEngineRef.current) return;

    const result = gameEngineRef.current.addPart(part);
    setMoveCount(prev => prev + 1);
    setFeedback(result.feedback);

    const newScore = gameEngineRef.current.calculateScore();
    setScore(newScore);
    onScoreUpdate?.(newScore);

    // Check if puzzle is solved
    if (gameEngineRef.current.isSolved()) {
      setIsGameSolved(true);
      onGameComplete?.({
        score: newScore,
        moves: moveCount + 1,
        duration: Math.floor(Date.now() / 1000)
      });
    }
  };

  // Handle part removal
  const handleRemovePart = (partId) => {
    if (!gameEngineRef.current) return;
    gameEngineRef.current.removePart(partId);
    setMoveCount(prev => prev + 1);
    setFeedback({ type: 'info', message: 'Part removed.' });
  };

  // Reset game
  const handleReset = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.reset();
      setScore(0);
      setMoveCount(0);
      setIsGameSolved(false);
      setFeedback(null);
      setSelectedPart(null);
    }
  };

  // Get hint
  const handleGetHint = () => {
    if (gameEngineRef.current) {
      const hint = gameEngineRef.current.getHint();
      setFeedback({ type: 'hint', message: hint });
    }
  };

  return (
    <div className="flex h-screen gap-4 bg-gray-100 p-4">
      {/* 3D Canvas */}
      <div className="flex-1 flex items-center justify-center rounded-lg shadow-lg overflow-hidden bg-gray-50 relative">
        {isInitializing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              <p className="text-white font-medium">Loading game...</p>
            </div>
          </div>
        )}
        <div
          ref={mountRef}
          className="w-full h-full"
        />
      </div>

      {/* Right Sidebar */}
      <div className="w-72 flex flex-col gap-4">
        {/* Feedback Panel */}
        <FeedbackPanel feedback={feedback} score={score} moveCount={moveCount} />

        {/* Game Controls */}
        <GameControls
          gameMode={gameMode}
          isGameSolved={isGameSolved}
          onReset={handleReset}
          onGetHint={handleGetHint}
        />

        {/* Part Library */}
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