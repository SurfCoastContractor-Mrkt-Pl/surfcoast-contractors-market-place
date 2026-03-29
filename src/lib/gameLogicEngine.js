import * as THREE from 'three';

export default class GameLogicEngine {
  constructor(gameData, scene) {
    this.gameData = gameData;
    this.scene = scene;
    this.currentState = {};
    this.placedParts = new Map();
    this.initialState = JSON.parse(gameData.initial_state_json);
    this.solutionState = JSON.parse(gameData.solution_state_json);
    this.availableParts = JSON.parse(gameData.available_parts_json);
    this.movesCount = 0;
    this.hintsUsed = 0;
  }

  // Load initial game state and render 3D models
  loadInitialState() {
    this.currentState = JSON.parse(JSON.stringify(this.initialState));
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
    meshesToRemove.forEach(mesh => this.scene.remove(mesh));

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
    return {
      success: validation.isValid,
      feedback: validation.message
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

  // Calculate score
  calculateScore() {
    if (!this.isSolved()) return 0;

    const baseSscore = 100;
    const movePenalty = Math.max(0, (this.movesCount - 5) * 2);
    const hintPenalty = this.hintsUsed * 5;

    return Math.max(0, baseSscore - movePenalty - hintPenalty);
  }

  // Get a hint
  getHint() {
    this.hintsUsed++;
    const hints = [
      'Check if all parts are properly connected.',
      'Ensure pipe flow is in the correct direction.',
      'Look for missing fittings or junctions.',
      'Verify all connections are leak-proof.',
      'Check the schematic provided in the educational content.'
    ];
    return hints[Math.floor(Math.random() * hints.length)];
  }

  // Reset the game
  reset() {
    this.currentState = JSON.parse(JSON.stringify(this.initialState));
    this.placedParts.clear();
    this.movesCount = 0;
    this.hintsUsed = 0;
    this.renderScene();
  }

  // Get available parts
  getAvailableParts() {
    return this.availableParts;
  }
}