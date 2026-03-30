import * as THREE from 'three';

export default class GameLogicEngine {
  constructor(gameData, scene) {
    this.gameData = gameData;
    this.scene = scene;
    this.currentState = {};
    this.placedParts = new Map();
    
    try {
      this.initialState = typeof gameData.initial_state_json === 'string' 
        ? JSON.parse(gameData.initial_state_json) 
        : gameData.initial_state_json;
      this.solutionState = typeof gameData.solution_state_json === 'string'
        ? JSON.parse(gameData.solution_state_json)
        : gameData.solution_state_json;
      this.availableParts = typeof gameData.available_parts_json === 'string'
        ? JSON.parse(gameData.available_parts_json)
        : gameData.available_parts_json;
    } catch (err) {
      console.error('Error parsing game data JSON:', err);
      this.initialState = {};
      this.solutionState = {};
      this.availableParts = [];
    }
    
    this.movesCount = 0;
    this.hintsUsed = 0;
    this.startTime = null;
    this.sessionStartTime = null;
    this.consecutiveCorrectPlacements = 0;
    this.errors = [];
  }

  // Load initial game state and render 3D models
  loadInitialState() {
    this.currentState = JSON.parse(JSON.stringify(this.initialState));
    this.sessionStartTime = Date.now();
    this.renderScene();
  }

  // Render 3D scene based on current state
  renderScene() {
    // Clear existing part meshes (keep ground, lights, camera)
    const meshesToRemove = [];
    this.scene.children.forEach(child => {
      if (child.userData.isPart) {
        meshesToRemove.push(child);
      }
    });
    meshesToRemove.forEach(mesh => {
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material) mesh.material.dispose();
      this.scene.remove(mesh);
    });

    // Render parts from current state
    this.currentState.parts?.forEach(part => {
      this.createPartMesh(part);
    });
  }

  // Create a 3D mesh for a part
  createPartMesh(partData) {
    let geometry;
    const material = new THREE.MeshStandardMaterial({
      color: partData.color || 0x0088ff,
      metalness: 0.3,
      roughness: 0.4
    });

    // Create geometry based on part type
    switch (partData.type) {
      case 'pipe':
        geometry = new THREE.CylinderGeometry(0.1, 0.1, partData.length || 1, 16);
        break;
      case 'fitting':
        geometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
        break;
      case 'valve':
        geometry = new THREE.SphereGeometry(0.15, 16, 16);
        break;
      case 'wire':
        geometry = new THREE.CylinderGeometry(0.05, 0.05, partData.length || 1, 8);
        break;
      case 'junction_box':
        geometry = new THREE.BoxGeometry(0.4, 0.4, 0.2);
        break;
      default:
        geometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
    }

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(partData.position.x, partData.position.y, partData.position.z);
    mesh.rotation.set(
      partData.rotation?.x || 0,
      partData.rotation?.y || 0,
      partData.rotation?.z || 0
    );
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.isPart = true;
    mesh.userData.partId = partData.id;
    mesh.userData.partData = partData;

    this.scene.add(mesh);
    this.placedParts.set(partData.id, mesh);
  }

  // Add a part to the scene
  addPart(part) {
    const newPart = {
      id: `part_${Date.now()}`,
      type: part.type,
      color: part.color,
      position: part.position || { x: 0, y: 1, z: 0 },
      rotation: part.rotation || { x: 0, y: 0, z: 0 },
      length: part.length,
      connections: []
    };

    this.currentState.parts = this.currentState.parts || [];
    this.currentState.parts.push(newPart);
    this.createPartMesh(newPart);
    this.movesCount++;

    // Validate placement
    const validation = this.validatePlacement(newPart);
    
    if (validation.isValid) {
      this.consecutiveCorrectPlacements++;
    } else {
      this.errors.push({ move: this.movesCount, error: validation.message });
      this.consecutiveCorrectPlacements = 0;
    }
    
    return {
      success: validation.isValid,
      feedback: validation.message,
      combo: this.consecutiveCorrectPlacements
    };
  }

  // Remove a part from the scene
  removePart(partId) {
    const mesh = this.placedParts.get(partId);
    if (mesh) {
      this.scene.remove(mesh);
      this.placedParts.delete(partId);
    }

    this.currentState.parts = this.currentState.parts?.filter(p => p.id !== partId);
    this.movesCount++;
  }

  // Validate part placement (rules vary by trade)
  validatePlacement(part) {
    const tradeType = this.gameData.trade_type;

    if (tradeType === 'plumbing') {
      return this.validatePlumbingPlacement(part);
    } else if (tradeType === 'electrical') {
      return this.validateElectricalPlacement(part);
    } else if (tradeType === 'carpentry') {
      return this.validateCarpentryPlacement(part);
    }

    return { isValid: true, message: 'Part placed.' };
  }

  // Plumbing-specific validation
  validatePlumbingPlacement(part) {
    // Check for valid connections, pipe types, flow direction, etc.
    if (part.type === 'pipe') {
      // Pipes should be connected to fittings or fixtures
      const hasConnection = this.currentState.parts?.some(p =>
        this.isConnected(part, p)
      );
      if (!hasConnection && this.currentState.parts?.length > 0) {
        return { isValid: false, message: 'Pipe must be connected to a fitting or fixture.' };
      }
    }

    return { isValid: true, message: 'Placement valid.' };
  }

  // Electrical-specific validation
  validateElectricalPlacement(part) {
    // Check for proper circuit connections, wire gauge, load capacity, etc.
    if (part.type === 'wire') {
      const hasValidConnection = this.currentState.parts?.some(p =>
        (p.type === 'junction_box' || p.type === 'breaker') && this.isConnected(part, p)
      );
      if (!hasValidConnection && this.currentState.parts?.length > 0) {
        return { isValid: false, message: 'Wire must connect to a junction box or breaker.' };
      }
    }

    return { isValid: true, message: 'Placement valid.' };
  }

  // Carpentry-specific validation
  validateCarpentryPlacement(part) {
    // Check for structural integrity, proper assembly, etc.
    return { isValid: true, message: 'Placement valid.' };
  }

  // Check if two parts are properly connected
  isConnected(part1, part2) {
    const distance = Math.hypot(
      part1.position.x - part2.position.x,
      part1.position.y - part2.position.y,
      part1.position.z - part2.position.z
    );
    return distance < 0.5; // Connection threshold
  }

  // Check if puzzle is solved
  isSolved() {
    if (!this.currentState.parts || this.currentState.parts.length === 0) {
      return false;
    }

    const currentPartsSet = new Set(this.currentState.parts.map(p => p.type).sort());
    const solutionPartsSet = new Set(this.solutionState.parts.map(p => p.type).sort());

    return JSON.stringify(Array.from(currentPartsSet)) === JSON.stringify(Array.from(solutionPartsSet));
  }

  // Calculate score with time bonus and combo multipliers
  calculateScore() {
    if (!this.isSolved()) return 0;

    let score = 100;
    const movePenalty = Math.max(0, (this.movesCount - 5) * 2);
    const hintPenalty = this.hintsUsed * 5;
    const errorPenalty = this.errors.length * 3;
    
    // Time bonus: full bonus if completed in under 2 minutes, scales down after
    let timeBonus = 0;
    if (this.sessionStartTime) {
      const elapsedSeconds = (Date.now() - this.sessionStartTime) / 1000;
      if (elapsedSeconds < 120) {
        timeBonus = Math.max(0, 50 - (elapsedSeconds / 2.4)); // 50 points max
      }
    }
    
    // Combo multiplier: consecutive correct placements boost score
    const comboMultiplier = 1 + (Math.min(this.consecutiveCorrectPlacements, 10) * 0.05);

    score = Math.max(0, (score - movePenalty - hintPenalty - errorPenalty + timeBonus) * comboMultiplier);
    return Math.round(score);
  }

  // Get progressive hints (each hint gets more specific)
  getHint() {
    const hints = [
      'Look at the solution image to see the target layout.',
      'Check if all required parts from the library are placed.',
      'Ensure pipes/wires are properly connected end-to-end.',
      'Verify the direction and orientation of each part.',
      'Look for specific positioning requirements in the educational content.'
    ];
    
    const hintIndex = Math.min(this.hintsUsed, hints.length - 1);
    this.hintsUsed++;
    return hints[hintIndex];
  }

  // Reset the game
  reset() {
    this.currentState = JSON.parse(JSON.stringify(this.initialState));
    this.placedParts.clear();
    this.movesCount = 0;
    this.hintsUsed = 0;
    this.consecutiveCorrectPlacements = 0;
    this.errors = [];
    this.sessionStartTime = Date.now();
    this.renderScene();
  }

  // Get available parts
  getAvailableParts() {
    return this.availableParts || [];
  }

  // Get current scene state for mockup saving
  getCurrentState() {
    return JSON.parse(JSON.stringify(this.currentState));
  }

  // Load a saved mockup state
  loadState(state) {
    this.currentState = state || {};
    this.renderScene();
  }
}

// ── Exported standalone function for building the bathroom environment ──────
export function buildBathroomScene(scene) {
  const floorMat = new THREE.MeshStandardMaterial({ color: 0xd4c9b8, roughness: 0.8, metalness: 0 });
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xf0ece4, roughness: 0.9 });
  const tileMat = new THREE.MeshStandardMaterial({ color: 0xe8e2d8, roughness: 0.6 });
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x8b6f47, roughness: 0.7 });
  const chromeMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.9, roughness: 0.1 });
  const porcelainMat = new THREE.MeshStandardMaterial({ color: 0xfafaf8, roughness: 0.3, metalness: 0 });

  // Floor
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // Back wall
  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(6, 4), wallMat);
  backWall.position.set(0, 2, -3);
  backWall.receiveShadow = true;
  scene.add(backWall);

  // Left wall
  const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(6, 4), wallMat);
  leftWall.position.set(-3, 2, 0);
  leftWall.rotation.y = Math.PI / 2;
  leftWall.receiveShadow = true;
  scene.add(leftWall);

  // Ceiling
  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1 }));
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = 4;
  scene.add(ceiling);

  // ── Vanity cabinet ────────────────────────────────────────────────────────
  const cabinet = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.8, 0.5), woodMat);
  cabinet.position.set(-1.5, 0.4, -2.7);
  cabinet.castShadow = true;
  scene.add(cabinet);

  // Sink basin
  const sink = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.25, 0.15, 24), porcelainMat);
  sink.position.set(-1.5, 0.85, -2.7);
  sink.castShadow = true;
  scene.add(sink);

  // Countertop
  const counter = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.05, 0.55), tileMat);
  counter.position.set(-1.5, 0.82, -2.7);
  scene.add(counter);

  // Faucet body
  const faucetBody = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.25, 12), chromeMat);
  faucetBody.position.set(-1.5, 1.0, -2.82);
  scene.add(faucetBody);

  // Faucet spout
  const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.18, 12), chromeMat);
  spout.rotation.x = Math.PI / 2.5;
  spout.position.set(-1.5, 1.1, -2.72);
  scene.add(spout);

  // P-trap pipes (under sink)
  const ptrapMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.6, roughness: 0.3 });
  const ptrap1 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.3, 12), ptrapMat);
  ptrap1.position.set(-1.5, 0.55, -2.7);
  ptrap1.userData.isPipe = true;
  scene.add(ptrap1);

  const ptrap2 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.25, 12), ptrapMat);
  ptrap2.rotation.z = Math.PI / 2;
  ptrap2.position.set(-1.62, 0.42, -2.7);
  ptrap2.userData.isPipe = true;
  scene.add(ptrap2);

  // Mirror above sink
  const mirror = new THREE.Mesh(
    new THREE.BoxGeometry(1.0, 0.7, 0.04),
    new THREE.MeshStandardMaterial({ color: 0xaaccdd, metalness: 0.8, roughness: 0.05 })
  );
  mirror.position.set(-1.5, 1.6, -2.96);
  scene.add(mirror);

  // Mirror frame
  const mirrorFrame = new THREE.Mesh(
    new THREE.BoxGeometry(1.08, 0.78, 0.03),
    new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.5 })
  );
  mirrorFrame.position.set(-1.5, 1.6, -2.94);
  scene.add(mirrorFrame);

  // ── Toilet ────────────────────────────────────────────────────────────────
  const toiletBase = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.38, 20), porcelainMat);
  toiletBase.position.set(1.2, 0.19, -2.5);
  toiletBase.castShadow = true;
  scene.add(toiletBase);

  const toiletBowl = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.2, 0.15, 20),
    porcelainMat
  );
  toiletBowl.position.set(1.2, 0.42, -2.5);
  scene.add(toiletBowl);

  const toiletTank = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.45, 0.2), porcelainMat);
  toiletTank.position.set(1.2, 0.68, -2.82);
  toiletTank.castShadow = true;
  scene.add(toiletTank);

  // Toilet supply line
  const supplyLine = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.4, 8), chromeMat);
  supplyLine.position.set(1.06, 0.35, -2.82);
  scene.add(supplyLine);

  // ── Bathtub ───────────────────────────────────────────────────────────────
  const tubMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.2, metalness: 0 });
  const tub = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.5, 0.8), tubMat);
  tub.position.set(0.5, 0.25, -2.6);
  tub.castShadow = true;
  scene.add(tub);

  // Tub interior
  const tubInner = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 0.35, 0.65),
    new THREE.MeshStandardMaterial({ color: 0xeeeeff, roughness: 0.15 })
  );
  tubInner.position.set(0.5, 0.35, -2.6);
  scene.add(tubInner);

  // Towel bar on left wall
  const barMount1 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.12), chromeMat);
  barMount1.position.set(-2.96, 1.4, -1.0);
  scene.add(barMount1);

  const barMount2 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.12), chromeMat);
  barMount2.position.set(-2.96, 1.4, -0.2);
  scene.add(barMount2);

  const towelBar = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.82, 12), chromeMat);
  towelBar.rotation.z = Math.PI / 2;
  towelBar.position.set(-2.96, 1.4, -0.6);
  scene.add(towelBar);
}