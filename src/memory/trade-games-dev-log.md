# TRADE GAMES — Development Log

## Overview
The Trade Games module is a gamified, educational plumbing/trade simulation built on top of Three.js and a custom `GameLogicEngine`. It lets contractors and customers play interactive repair scenarios to earn discounts on real jobs.

---

## Architecture

### Pages
- `pages/TradeGames.jsx` — Main hub: browse games, launch player, create challenges
- `pages/GameChallenge.jsx` — Token-based challenge viewer & game launcher
- `pages/GameLeaderboard.jsx` — Leaderboard display
- `pages/GameAnalyticsDashboard.jsx` — Admin analytics for game performance

### Core Components
- `components/tradegames/TradeGameViewer.jsx` — Full 3D game environment (Three.js), orbit camera, part placement, scenario + mockup integration
- `components/tradegames/PartLibrary.jsx` — Searchable, filterable parts panel (categories: drain, supply, fittings, valves, fixtures, seals, hardware)
- `components/tradegames/GameControls.jsx` — Reset / Hint controls
- `components/tradegames/FeedbackPanel.jsx` — Score, move count, combo multiplier, feedback messages
- `components/tradegames/ScenarioIntroModal.jsx` — "Customer call" briefing with context, symptoms, urgency, objective
- `components/tradegames/MockupManager.jsx` — Save/load/share custom plumbing scene mockups (tied to PlumbingMockup entity)
- `components/tradegames/GameChallengeCreator.jsx` — Create shareable challenge tokens
- `components/tradegames/AITutoringPanel.jsx` — AI-powered learning assistant
- `components/tradegames/CompetitiveMatchmaker.jsx` — Match players for competitive sessions
- `components/tradegames/LiveScoringDashboard.jsx` — Real-time score feed
- `components/tradegames/GameLeaderboard.jsx` — Leaderboard UI
- `components/tradegames/GameStatistics.jsx` — Per-game stats
- `components/tradegames/GameAnalyticsPanel.jsx` — Analytics UI
- `components/tradegames/NotificationCenter.jsx` — In-game notifications
- `components/tradegames/RewardTierDisplay.jsx` — Reward tier progress
- `components/tradegames/SeasonalTournamentCard.jsx` — Tournament display
- `components/tradegames/TournamentLeaderboard.jsx` — Tournament standings
- `components/tradegames/FeedbackPanel.jsx` — Score/moves/combo/feedback

### Game Engine
- `lib/gameLogicEngine.js` — Core class:
  - Parses game config and solution rules
  - Manages Three.js scene graph (3D bathroom environment with vanity, sink, toilet, bathtub, tiles)
  - `buildBathroomScene(scene)` — Creates full bathroom environment with realistic lighting
  - `addPart(part)` / `removePart(partId)` — Mutates scene + tracks state
  - `isSolved()` — Validates current layout vs. solution
  - `calculateScore()` — Time + moves + errors + combo multiplier
  - `getHint()` — Progressive hint system
  - `reset()` — Full game reset
  - `getCurrentState()` / `loadState(state)` — Mockup save/load support

### Backend Functions
- `functions/completeGameSession.js` — Records completed session, triggers stats update
- `functions/updateGameStatistics.js` — Recalculates aggregate stats (play count, avg score, avg duration)
- `functions/updateGameStats.js` — Lightweight stats updater
- `functions/updateLeaderboards.js` — Updates global/seasonal leaderboards
- `functions/createGameChallenge.js` — Generates shareable challenge tokens
- `functions/completeChallenge.js` — Records challenge completion
- `functions/completeMatchSession.js` — Records competitive match result
- `functions/createCompetitiveMatch.js` — Sets up competitive match
- `functions/updateLiveMatchScore.js` — Real-time score updates
- `functions/recommendCompetitiveMatches.js` — AI-powered match recommendations
- `functions/calculateGameAchievements.js` — Unlocks achievement badges
- `functions/calculateGameRewardTier.js` — Calculates reward tier (discount %)
- `functions/calculateTournamentStandings.js` — Tournament bracket/standings
- `functions/generateGameRecommendations.js` — Recommends games to users
- `functions/aggregateGameAnalytics.js` — Rolls up analytics data
- `functions/syncGameCompletionToHubSpot.js` — Syncs completions to HubSpot CRM
- `functions/seedAdditionalTradeGames.js` — Seeds game catalog data

### Entities
- `TradeGame` — Game catalog entry (title, trade type, difficulty, solution config, parts list)
- `UserGameSession` — Individual play session (score, moves, duration, completed)
- `GameChallenge` — Shareable challenge token
- `GameLeaderboard` — Leaderboard entries
- `GameRewardTier` — Reward tiers and discount thresholds
- `GameCompetitiveMatch` — Competitive match record
- `MatchNotification` — Match invite/result notifications
- `SeasonalTournament` — Tournament config
- `TournamentLeaderboard` — Tournament standings
- `AITutoringSession` — AI tutoring session record
- `GameAchievement` — Unlocked achievements
- `GamePerformanceAnalytics` — Aggregated analytics
- `PlumbingMockup` — User-saved custom scene designs (scene_state_json, tags, is_public, trade_type)

---

## 3D Environment — Bathroom Scene
The bathroom scene (`buildBathroomScene`) includes:
- **Floor**: tile grid pattern
- **Walls**: three-walled room with tile trim
- **Vanity cabinet**: wood-toned cabinet with sink basin, faucet (hot/cold handles), P-trap & drain pipe
- **Toilet**: tank + bowl + base
- **Bathtub**: acrylic tub
- **Mirror**: reflective surface above vanity
- **Towel bar**: on side wall
- **Lighting**: ceiling point light (warm), vanity accent light, soft fill, ambient — all with ACESFilmic tone mapping

## Camera
- Orbit camera: drag to rotate, scroll to zoom
- Centers on vanity/sink area
- `cameraAngleRef` (phi/theta) + `cameraRadiusRef`

---

## Key UX Flows

### Play a Game
1. Navigate to `/trade-games`
2. Select a game card → `TradeGameViewer` mounts
3. `ScenarioIntroModal` shows customer briefing
4. Player drags parts from `PartLibrary`, places them in scene
5. `GameLogicEngine.isSolved()` fires → `onGameComplete` callback
6. `completeGameSession` function called → score recorded → discount applied to ScopeOfWork

### Save/Load Mockup
1. Click "Mockups" button in viewer
2. `MockupManager` opens → save current `gameEngine.getCurrentState()` to `PlumbingMockup` entity
3. Load a saved mockup → `gameEngine.loadState(state)` restores scene

### Create a Challenge
1. Contractor completes a game → clicks "Challenge a Customer"
2. `GameChallengeCreator` generates a token → shareable `/challenge/:token` URL
3. Customer opens link → `GameChallenge` page → plays the same scenario
4. On completion → discount applied to linked ScopeOfWork

---

## Discount Integration
- Game completion grants a percentage discount on a linked `ScopeOfWork`
- Fields on ScopeOfWork: `game_session_id`, `game_discount_percentage`, `game_discount_applied`, `original_cost_amount`

---

## Notes & Known Patterns
- `ScenarioIntroModal` and `MockupManager` must be imported with absolute paths (`@/components/tradegames/...`) due to Vite module resolution
- `buildBathroomScene` is exported from `lib/gameLogicEngine.js` alongside the default class export
- Parts in `PartLibrary` have: `id`, `name`, `type`, `category`, `description`, `quantity`
- Feedback types: `success`, `error`, `hint`, `info`
- All game backend functions use `INTERNAL_SERVICE_KEY` for auth