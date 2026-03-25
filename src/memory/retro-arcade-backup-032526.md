# Retro Arcade Feature (Archived)

## Overview
A neon-themed arcade game feature with Snake gameplay, leaderboard tracking, and 80s music player.

## Components Created
- `pages/RetroArcade.jsx` - Main arcade page with game grid, leaderboard, and music
- `components/arcade/SnakeGame.jsx` - Playable Snake game with neon visuals
- `components/arcade/ArcadeLeaderboard.jsx` - Top 10 scores display
- `components/arcade/RetroBackground.jsx` - Animated Memphis-style background
- `components/arcade/ScoreSubmitModal.jsx` - Score submission form
- `components/arcade/RetroMusicPlayer.jsx` - 80s music player with track list

## Entities
- `ArcadeScore` - Tracks individual game scores, player name/email, game type, level, and credits_awarded
- `ArcadeCredit` - Player credit wallets (total_credits, lifetime_high_score, games_played)
- `ArcadeUnlock` - Tracks unlocked perks/game modes by player

## Database Schema Changes
- ArcadeScore: Added `credits_awarded` (number, default 0) and `credits_claimed` (boolean, default false)
- ArcadeCredit: Full entity for player credit tracking
- ArcadeUnlock: Full entity for cosmetic/gameplay unlocks

## Features
- Real-time leaderboard (top 10 scores by game)
- Snake game with responsive controls
- Score submission with tier-based credit rewards
- Music player with YouTube embed fallback (later replaced with HTML5 audio)
- Neon aesthetic with custom color palette

## Route
- `/RetroArcade` - Main arcade page

## How to Restore
1. Uncomment import in App.jsx: `import RetroArcade from './pages/RetroArcade';`
2. Add route: `<Route path="/RetroArcade" element={<RetroArcade />} />`
3. Update layout navigation in `/layout` to include arcade link
4. Ensure all arcade components are in place

## Notes
- Feature was designed as a self-contained high-score leaderboard
- No credit/economy system is integrated (was planned but removed)
- Music player uses HTML5 audio with royalty-free tracks
- All neon theming uses CSS-in-JS with custom color variables