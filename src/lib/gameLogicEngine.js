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
    this.elapsedSeconds = 0;
    this.timerInterval = null;
  }

  // Load initial game state and render 3D models
  loadInitialState() {
    this.currentState = JSON.parse(JSON.stringify(this.initialState));
    this.sessionStartTime = Date.now();
    this.startTimer();
    this.renderScene();
  }

  // Start the game timer
  startTimer() {
    this.timerInterval = setInterval(() => {
      this.elapsedSeconds = Math.floor((Date.now() - this.sessionStartTime) / 1000);
    }, 100);
  }

  // Stop the game timer
  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  // Get elapsed time in MM:SS format
  getFormattedTime() {
    const minutes = Math.floor(this.elapsedSeconds / 60);
    const seconds = this.elapsedSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  // Get elapsed time in seconds
  getElapsedSeconds() {
    return this.elapsedSeconds;
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
    } else if (tradeType === 'hvac') {
      return this.validateHVACPlacement(part);
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
    if (part.type === 'stud') {
      const studs = this.currentState.parts?.filter(p => p.type === 'stud') || [];
      const bottomPlate = this.currentState.parts?.find(p => p.type === 'beam' && p.position.y < 0.5);
      if (!bottomPlate) {
        return { isValid: false, message: 'Place the bottom plate before adding studs.' };
      }
      // Check stud is roughly vertical (small x offset)
      for (const other of studs) {
        if (other.id === part.id) continue;
        const xDist = Math.abs(other.position.x - part.position.x);
        if (xDist < 0.3) {
          return { isValid: false, message: 'Studs too close together — maintain 16" spacing.' };
        }
      }
    }
    if (part.type === 'beam') {
      const studs = this.currentState.parts?.filter(p => p.type === 'stud') || [];
      if (part.position.y > 1 && studs.length < 2) {
        return { isValid: false, message: 'Place at least 2 studs before adding the top plate.' };
      }
    }
    return { isValid: true, message: 'Good placement!' };
  }

  // HVAC-specific validation
  validateHVACPlacement(part) {
    const hasAirHandler = this.currentState.parts?.some(p => p.type === 'junction_box');
    if (!hasAirHandler && part.type !== 'junction_box') {
      return { isValid: false, message: 'Start by placing the air handler unit.' };
    }
    if (part.type === 'fitting') {
      const ducts = this.currentState.parts?.filter(p => p.type === 'pipe') || [];
      if (ducts.length === 0) {
        return { isValid: false, message: 'Connect duct runs before placing registers.' };
      }
    }
    return { isValid: true, message: 'Component placed.' };
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
  // Returns a live partial score even if not solved yet
  calculateScore() {
    let score = 100;
    const solved = this.isSolved();
    const movePenalty = Math.max(0, (this.movesCount - 5) * 2);
    const hintPenalty = this.hintsUsed * 5;
    const errorPenalty = this.errors.length * 3;
    
    // Time bonus: decreases as time increases (120 sec = 0 bonus, 30 sec = 50 bonus)
    let timeBonus = 0;
    if (this.elapsedSeconds < 120) {
      timeBonus = Math.max(0, 50 - (this.elapsedSeconds / 2.4));
    }
    
    // Combo multiplier: consecutive correct placements boost score
    const comboMultiplier = 1 + (Math.min(this.consecutiveCorrectPlacements, 10) * 0.05);

    // If solved, return full score; otherwise return partial progress score
    if (solved) {
      score = Math.max(0, (score - movePenalty - hintPenalty - errorPenalty + timeBonus) * comboMultiplier);
    } else {
      // Live partial score based on progress toward solution
      const placedCount = this.currentState.parts?.length || 0;
      const solutionCount = this.solutionState.parts?.length || 1;
      const progressPct = Math.min(placedCount / solutionCount, 1);
      score = Math.round(progressPct * 60) - Math.min(hintPenalty, 20);
    }
    return Math.max(0, Math.round(score));
  }

  // Get detailed score breakdown
  getScoreBreakdown() {
    return {
      baseScore: 100,
      movePenalty: Math.max(0, (this.movesCount - 5) * 2),
      hintPenalty: this.hintsUsed * 5,
      errorPenalty: this.errors.length * 3,
      timeBonus: this.elapsedSeconds < 120 ? Math.max(0, 50 - (this.elapsedSeconds / 2.4)) : 0,
      comboMultiplier: 1 + (Math.min(this.consecutiveCorrectPlacements, 10) * 0.05),
      finalScore: this.calculateScore(),
      elapsedSeconds: this.elapsedSeconds,
      movesCount: this.movesCount,
      errorCount: this.errors.length
    };
  }

  // Get progressive hints — trade-specific and increasingly helpful
  getHint() {
    const tradeHints = {
      plumbing: [
        'In plumbing, flow goes from high to low — start at the fixture drain and work toward the wall.',
        'Every drain needs a P-trap to prevent sewer gases from entering. Check yours is present.',
        'Pipes must be connected end-to-end — place fittings where two pipes meet.',
        'The solution requires: a drain pipe, P-trap, and wall connection in that order.',
        'Tip: Remove all parts and start fresh — place the drain pipe first, then P-trap below it, then wall fitting.'
      ],
      electrical: [
        'All wires must connect to either a junction box or a breaker — floating wires fail inspection.',
        'Use the hot wire (red/black) from breaker to load, and neutral (white/yellow) to complete the circuit.',
        'Ground wires (green) connect to the ground bar in the panel — essential for safety.',
        'Check your wire count: the solution needs both a hot and a neutral wire connected to the breaker.',
        'Tip: Place the junction box first, then run hot wire, neutral wire, and finally ground wire.'
      ],
      carpentry: [
        'Walls start with the bottom plate — make sure it\'s laid flat on the floor before adding studs.',
        'Studs should be spaced 16 inches on center. Look at your current stud positions.',
        'The top plate goes across the top of all studs — add it after all studs are in place.',
        'Fire blocking goes horizontally between studs at mid-wall height (~4 feet).',
        'Tip: Place bottom plate → 3 studs at -1.2, 0, +1.2 → top plate on top.'
      ],
      hvac: [
        'Start with the air handler — it\'s the source of all conditioned air in the system.',
        'The main trunk duct runs from the air handler along the length of the space.',
        'Branch ducts split off the trunk to deliver air to individual rooms.',
        'Supply registers go at the end of branch ducts — one per room.',
        'Tip: Air handler → main trunk → 2 branch ducts left and right → registers at branch ends.'
      ]
    };

    const tradeType = this.gameData?.trade_type || 'plumbing';
    const hints = tradeHints[tradeType] || [
      'Check the educational content panel for clues.',
      'Try placing parts in the order listed in the instructions.',
      'Make sure all parts from the solution are placed.',
      'Verify each part is connected to the next.',
      'Reset and try placing parts one at a time.'
    ];

    const hintIndex = Math.min(this.hintsUsed, hints.length - 1);
    this.hintsUsed++;
    return hints[hintIndex];
  }

  // Reset the game
  reset() {
    this.stopTimer();
    this.currentState = JSON.parse(JSON.stringify(this.initialState));
    this.placedParts.clear();
    this.movesCount = 0;
    this.hintsUsed = 0;
    this.consecutiveCorrectPlacements = 0;
    this.errors = [];
    this.elapsedSeconds = 0;
    this.sessionStartTime = Date.now();
    this.startTimer();
    this.renderScene();
  }

  // Cleanup on game end
  cleanup() {
    this.stopTimer();
  }

  // Get available parts
  getAvailableParts() {
    return this.availableParts;
  }
}