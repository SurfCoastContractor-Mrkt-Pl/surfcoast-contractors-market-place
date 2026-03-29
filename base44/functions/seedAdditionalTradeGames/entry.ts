import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    // Carpentry: Framing a doorway
    const carpentryDoorway = await base44.asServiceRole.entities.TradeGame.create({
      title: 'Framing a Doorway',
      description: 'Learn to properly frame a doorway opening including header placement, studs, and support.',
      trade_type: 'carpentry',
      game_mode: 'guided_puzzle',
      difficulty: 'medium',
      initial_state_json: JSON.stringify({
        parts: [
          { id: 'wall_1', type: 'wall_section', position: { x: -2, y: 0, z: 0 }, color: 0x8B4513, length: 2 },
          { id: 'wall_2', type: 'wall_section', position: { x: 2, y: 0, z: 0 }, color: 0x8B4513, length: 2 }
        ]
      }),
      solution_state_json: JSON.stringify({
        parts: [
          { id: 'wall_1', type: 'wall_section', position: { x: -2, y: 0, z: 0 }, color: 0x8B4513 },
          { id: 'wall_2', type: 'wall_section', position: { x: 2, y: 0, z: 0 }, color: 0x8B4513 },
          { id: 'header', type: 'header_beam', position: { x: 0, y: 2.1, z: 0 }, color: 0xA0522D },
          { id: 'stud_left', type: 'stud', position: { x: -1, y: 1, z: 0 }, color: 0xD2B48C },
          { id: 'stud_right', type: 'stud', position: { x: 1, y: 1, z: 0 }, color: 0xD2B48C },
          { id: 'king_stud_left', type: 'king_stud', position: { x: -1.5, y: 1, z: 0 }, color: 0xA0522D },
          { id: 'king_stud_right', type: 'king_stud', position: { x: 1.5, y: 1, z: 0 }, color: 0xA0522D }
        ]
      }),
      available_parts_json: JSON.stringify([
        { id: 'header', type: 'header_beam', name: 'Double Header Beam' },
        { id: 'stud', type: 'stud', name: 'Cripple Stud' },
        { id: 'king_stud', type: 'king_stud', name: 'King Stud' },
        { id: 'trimmer', type: 'trimmer_stud', name: 'Trimmer Stud' }
      ]),
      educational_content_md: `## Doorway Framing Guide

A properly framed doorway requires:
1. **Header Beam**: Supports the load above the opening
2. **King Studs**: Full-height studs on both sides of the opening
3. **Trimmer Studs**: Support the header above the opening
4. **Cripple Studs**: Short studs above the header

### Common Doorway Heights
- Standard interior: 6'8" to header
- Standard door frame width: 2'4" to 3'6"`,
      image_url: 'https://images.unsplash.com/photo-1565084888279-aca9b0b8f53d?w=500',
      is_premium: false,
      is_published: true,
      creator_email: user.email,
      play_count: 0
    });

    // HVAC: Ductwork layout
    const hvacDuctwork = await base44.asServiceRole.entities.TradeGame.create({
      title: 'HVAC Ductwork Layout',
      description: 'Design an efficient ductwork system with proper sizing and airflow distribution.',
      trade_type: 'hvac',
      game_mode: 'guided_puzzle',
      difficulty: 'hard',
      initial_state_json: JSON.stringify({
        parts: [
          { id: 'furnace', type: 'furnace', position: { x: 0, y: 0, z: 0 }, color: 0x555555 }
        ]
      }),
      solution_state_json: JSON.stringify({
        parts: [
          { id: 'furnace', type: 'furnace', position: { x: 0, y: 0, z: 0 }, color: 0x555555 },
          { id: 'main_duct', type: 'main_duct', position: { x: 0, y: 1, z: 0 }, color: 0x696969, length: 2 },
          { id: 'branch_1', type: 'branch_duct', position: { x: -2, y: 1.5, z: 0 }, color: 0x808080 },
          { id: 'branch_2', type: 'branch_duct', position: { x: 2, y: 1.5, z: 0 }, color: 0x808080 },
          { id: 'return_duct', type: 'return_duct', position: { x: 0, y: -1, z: 0 }, color: 0xA9A9A9, length: 1.5 },
          { id: 'damper', type: 'damper', position: { x: 0, y: 0.5, z: 0 }, color: 0x505050 }
        ]
      }),
      available_parts_json: JSON.stringify([
        { id: 'main_duct', type: 'main_duct', name: 'Main Supply Duct' },
        { id: 'branch_duct', type: 'branch_duct', name: 'Branch Duct' },
        { id: 'return_duct', type: 'return_duct', name: 'Return Duct' },
        { id: 'damper', type: 'damper', name: 'Airflow Damper' }
      ]),
      educational_content_md: `## HVAC Ductwork Principles

**Duct Sizing Formula:**
- Main duct: 1 sq ft per 400 CFM
- Branch ducts: 1 sq ft per 300-400 CFM

**Key Components:**
1. **Supply Duct**: Delivers conditioned air from furnace
2. **Return Duct**: Pulls air back to furnace
3. **Dampers**: Control airflow balance
4. **Insulation**: R-6 minimum for attics

**Common Mistakes:**
- Undersizing ducts (causes noise and inefficiency)
- Poor return air placement
- Missing dampers for zone control`,
      image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500',
      is_premium: false,
      is_published: true,
      creator_email: user.email,
      play_count: 0
    });

    // Roofing: Shingle placement
    const roofingShingles = await base44.asServiceRole.entities.TradeGame.create({
      title: 'Roof Shingle Installation',
      description: 'Master the proper technique for installing asphalt shingles with correct overlap and fastening.',
      trade_type: 'roofing',
      game_mode: 'guided_puzzle',
      difficulty: 'easy',
      initial_state_json: JSON.stringify({
        parts: [
          { id: 'roof_deck', type: 'roof_deck', position: { x: 0, y: 0, z: 0 }, color: 0x8B7355 }
        ]
      }),
      solution_state_json: JSON.stringify({
        parts: [
          { id: 'roof_deck', type: 'roof_deck', position: { x: 0, y: 0, z: 0 }, color: 0x8B7355 },
          { id: 'felt_paper', type: 'underlayment', position: { x: 0, y: 0.1, z: 0 }, color: 0x696969 },
          { id: 'shingle_row_1', type: 'shingle_row', position: { x: 0, y: 0.2, z: 0 }, color: 0x3A3A3A },
          { id: 'shingle_row_2', type: 'shingle_row', position: { x: 0, y: 0.4, z: 0 }, color: 0x4A4A4A },
          { id: 'shingle_row_3', type: 'shingle_row', position: { x: 0, y: 0.6, z: 0 }, color: 0x3A3A3A },
          { id: 'ridge_shingles', type: 'ridge_cap', position: { x: 0, y: 0.8, z: 0 }, color: 0x2A2A2A }
        ]
      }),
      available_parts_json: JSON.stringify([
        { id: 'underlayment', type: 'underlayment', name: 'Felt Underlayment' },
        { id: 'shingle_row', type: 'shingle_row', name: 'Shingle Row' },
        { id: 'ridge_cap', type: 'ridge_cap', name: 'Ridge Cap Shingles' },
        { id: 'fastener', type: 'fastener', name: 'Roofing Nails' }
      ]),
      educational_content_md: `## Asphalt Shingle Installation

**Installation Steps:**
1. Lay felt or synthetic underlayment (fully adhered)
2. Install starter course at the eaves
3. Install shingle courses with 4-6" overlap
4. Use 4 nails per standard shingle

**Critical Spacing:**
- Vertical offset: 6" between rows
- Horizontal spacing: Stagger by 3"
- Nail placement: 5/8" from edge

**Safety Reminders:**
- Use proper fall protection on steep roofs
- Avoid working in temperatures below 40°F
- Wear appropriate footwear for traction`,
      image_url: 'https://images.unsplash.com/photo-1577021653202-cbb660ee6581?w=500',
      is_premium: false,
      is_published: true,
      creator_email: user.email,
      play_count: 0
    });

    // Masonry: Brick alignment
    const masonryBricks = await base44.asServiceRole.entities.TradeGame.create({
      title: 'Brick Alignment & Mortar',
      description: 'Learn proper brick laying technique with consistent mortar joints and alignment.',
      trade_type: 'masonry',
      game_mode: 'guided_puzzle',
      difficulty: 'medium',
      initial_state_json: JSON.stringify({
        parts: [
          { id: 'foundation', type: 'foundation', position: { x: 0, y: 0, z: 0 }, color: 0x4A4A4A }
        ]
      }),
      solution_state_json: JSON.stringify({
        parts: [
          { id: 'foundation', type: 'foundation', position: { x: 0, y: 0, z: 0 }, color: 0x4A4A4A },
          { id: 'brick_1_1', type: 'brick', position: { x: -1, y: 0.5, z: 0 }, color: 0xA0522D },
          { id: 'brick_1_2', type: 'brick', position: { x: 0, y: 0.5, z: 0 }, color: 0xA0522D },
          { id: 'brick_1_3', type: 'brick', position: { x: 1, y: 0.5, z: 0 }, color: 0xA0522D },
          { id: 'brick_2_1', type: 'brick', position: { x: -0.5, y: 1, z: 0 }, color: 0x8B4513 },
          { id: 'brick_2_2', type: 'brick', position: { x: 0.5, y: 1, z: 0 }, color: 0x8B4513 },
          { id: 'mortar_h', type: 'mortar_joint', position: { x: 0, y: 0.75, z: 0 }, color: 0xC0C0C0 },
          { id: 'mortar_v', type: 'mortar_joint', position: { x: 0.5, y: 0.5, z: 0 }, color: 0xC0C0C0 }
        ]
      }),
      available_parts_json: JSON.stringify([
        { id: 'brick', type: 'brick', name: 'Standard Brick' },
        { id: 'mortar_joint', type: 'mortar_joint', name: 'Mortar Joint' },
        { id: 'corner_brick', type: 'corner_brick', name: 'Corner Brick' }
      ]),
      educational_content_md: `## Brick Masonry Fundamentals

**Standard Brick Dimensions:**
- Length: 7-5/8"
- Height: 2-1/4" 
- Depth: 3-5/8"

**Mortar Joint Spacing:**
- Horizontal: 3/8" to 1/2"
- Vertical: 3/8" to 1/2"
- Consistency ensures professional appearance

**Running Bond Pattern:**
- Most common pattern
- Each brick offset by half its length
- Provides structural strength

**Proper Technique:**
1. Butter each brick end with mortar
2. Press firmly into position
3. Use level to ensure alignment
4. Strike joints for weather resistance`,
      image_url: 'https://images.unsplash.com/photo-1517457373614-b7152f800fd1?w=500',
      is_premium: false,
      is_published: true,
      creator_email: user.email,
      play_count: 0
    });

    return Response.json({
      message: 'Successfully created 4 additional trade games',
      games: [
        { id: carpentryDoorway.id, title: carpentryDoorway.title },
        { id: hvacDuctwork.id, title: hvacDuctwork.title },
        { id: roofingShingles.id, title: roofingShingles.title },
        { id: masonryBricks.id, title: masonryBricks.title }
      ]
    });
  } catch (error) {
    console.error('[seedAdditionalTradeGames] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});