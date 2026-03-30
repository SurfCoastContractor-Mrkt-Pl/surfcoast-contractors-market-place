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

    // P-trap assembly validation
    if (part.type === 'p-trap' || part.type === 'p_trap') {
      const pTrapValidation = this.validatePTrapAssembly();
      if (!pTrapValidation.isValid) {
        return pTrapValidation;
      }
    }

    return { isValid: true, message: 'Placement valid.' };
  }

  // Validate P-trap assembly order and alignment
  validatePTrapAssembly() {
    const parts = this.currentState.parts || [];
    
    // Find drain pipe, p-trap, and wall connection
    const drainPipe = parts.find(p => p.type === 'drain_pipe');
    const pTrap = parts.find(p => p.type === 'p-trap' || p.type === 'p_trap');
    const wallConnection = parts.find(p => p.type === 'wall_drain');

    // Check all required components exist
    if (!drainPipe || !pTrap || !wallConnection) {
      return { isValid: false, message: 'P-trap assembly requires: drain pipe, p-trap, and wall connection.' };
    }

    // Validate connection order: drain -> p-trap -> wall
    if (!this.isConnected(drainPipe, pTrap)) {
      return { isValid: false, message: 'Drain pipe must connect to P-trap.' };
    }
    if (!this.isConnected(pTrap, wallConnection)) {
      return { isValid: false, message: 'P-trap must connect to wall drain.' };
    }

    // Validate vertical alignment of drain pipe
    const drainVerticalAlignment = this.validateDrainPipeVerticalAlignment(drainPipe, pTrap);
    if (!drainVerticalAlignment.isValid) {
      return drainVerticalAlignment;
    }

    // Validate p-trap orientation (should be horizontal or curved downward)
    const pTrapOrientation = this.validatePTrapOrientation(pTrap);
    if (!pTrapOrientation.isValid) {
      return pTrapOrientation;
    }

    return { isValid: true, message: 'P-trap assembly is correctly configured.' };
  }

  // Validate that drain pipe is vertical (aligned on Y-axis)
  validateDrainPipeVerticalAlignment(drainPipe, pTrap) {
    // Drain pipe should be mostly vertical (same X and Z, different Y)
    const xDiff = Math.abs(drainPipe.position.x - pTrap.position.x);
    const zDiff = Math.abs(drainPipe.position.z - pTrap.position.z);
    const verticalThreshold = 0.2; // Allow slight horizontal offset

    if (xDiff > verticalThreshold || zDiff > verticalThreshold) {
      return { isValid: false, message: 'Drain pipe must be vertically aligned with the P-trap.' };
    }

    // Drain should be above the P-trap
    if (drainPipe.position.y <= pTrap.position.y) {
      return { isValid: false, message: 'Drain pipe must be positioned above the P-trap.' };
    }

    return { isValid: true, message: 'Drain pipe vertical alignment is correct.' };
  }

  // Validate that p-trap is oriented horizontally or curved downward
  validatePTrapOrientation(pTrap) {
    // P-trap rotation should be mostly horizontal (small rotation on X/Z, ~π/2 on Z for the curve)
    const rotX = Math.abs(pTrap.rotation.x);
    const rotY = Math.abs(pTrap.rotation.y);
    
    // Allow small rotations on X and Y (within π/4 radians = 45°)
    const angleThreshold = Math.PI / 4;

    if (rotX > angleThreshold || rotY > angleThreshold) {
      return { isValid: false, message: 'P-trap must be oriented horizontally (not tilted).' };
    }

    return { isValid: true, message: 'P-trap orientation is correct.' };
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

    const currentTypes = this.currentState.parts.map(p => p.type).sort();
    const solutionTypes = this.solutionState.parts.map(p => p.type).sort();

    return JSON.stringify(currentTypes) === JSON.stringify(solutionTypes);
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
    return this.availableParts;
  }
}