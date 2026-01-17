# Battle System Implementation

## Overview
Complete battle system for Squirrel - a gamified learning platform. Users can battle each other every 8 hours to earn XP and steal acorns.

## Features Implemented

### Core Battle Mechanics
- **8-hour attack cooldown**: Users can initiate battles every 8 hours
- **Defensive shield**: When attacked, users get 8-hour protection from being chosen as opponents
- **Random matchmaking**: Battles against random users (excludes shielded users)
- **Power calculation**: Combines level, XP, and randomness for fair battles
- **Reward system**: XP gains and acorn stealing/loss

### Battle Flow
1. User clicks "Battle Random" button
2. System validates 8-hour cooldown
3. Finds random non-shielded opponent
4. Calculates battle (power-based with randomness)
5. Updates both users atomically in Firestore
6. Shows result modal with rewards
7. Attacker gets 8h cooldown, defender gets 8h shield

## Battle Math

### Level Calculation
```javascript
level = Math.floor(xp / 100) + 1
```
- Level 1: 0-99 XP
- Level 2: 100-199 XP
- Level 3: 200-299 XP
- etc.

### Power Calculation (Winner Determination)
```javascript
yourPower = (yourLevel * 100) + yourXP + random(0, 200)
opponentPower = (opponentLevel * 100) + opponentXP + random(0, 200)

YOU_WIN if yourPower > opponentPower
```

### XP Rewards
```javascript
Winner: 50 + (opponentLevel * 10) XP
Loser: 20 + (opponentLevel * 5) XP
```

### Acorn Economy
```javascript
xpGainedByWinner = 50 + (opponentLevel * 10)
acornsStolen = 2 + Math.floor(xpGainedByWinner / 20)

Winner Steals: acornsStolen
Loser Loses: acornsStolen (can't go below 0)
```

**Example Battle:**
- Level 5 player beats Level 3 player
- Winner gains: 50 + (3*10) = 80 XP + steals 2 + (80/20) = 6 acorns
- Loser gains: 20 + (5*5) = 45 XP + loses 6 acorns

## Files Created/Modified

### New Files
1. **`src/utils/battleUtils.ts`** - Battle calculation logic
   - `calculateLevel()` - XP to level conversion
   - `calculateBattle()` - Battle execution with power calculation
   - `canBattle()` - Check 8h cooldown
   - `isShielded()` - Check shield status
   - Timer utility functions

2. **`src/services/battleService.ts`** - Firestore operations
   - `fetchUserData()` - Get user from Firestore
   - `findRandomOpponent()` - Random matchmaking (excludes shielded)
   - `executeBattle()` - Atomic batch update for battle results

3. **`src/components/BattleResultModal.tsx`** - Results display
   - Win/loss header
   - XP and acorn rewards
   - Opponent info card
   - Common Ground placeholder (TODO)

4. **`src/components/BattleResultModal.module.css`** - Modal styling
   - Gradient backgrounds for win/loss
   - Animated rewards display
   - Responsive design

5. **`src/scripts/seedTestUsers.ts`** - Test data helper
   - Creates 5 test users for battle testing
   - Useful for development/demo

### Modified Files
1. **`src/pages/BattlePage.tsx`**
   - Changed 24h → 8h timers
   - Integrated Firebase Auth
   - Connected to Firestore
   - Added battle logic
   - Loading states & error handling
   - Modal integration

2. **`src/pages/BattlePage.module.css`**
   - Error message styling
   - Layout adjustments for error display

## Firestore Schema

### Users Collection
```typescript
users/{uid}:
  - name: string
  - level: int
  - xp: int
  - acorns: int
  - avatarUrl: string
  - access_token: string
  - friends: string[]
  - lastBattleTime: timestamp (for 8h attack cooldown)
  - shieldEndTime: timestamp (for 8h defensive shield)
```

### Battles Collection
```typescript
battles/{battleId}:
  - attackerId: string
  - defenderId: string
  - winnerId: string
  - timestamp: timestamp
  - attackerStats: {
      nameAtBattle: string,
      levelAtBattle: int,
      xpAtBattle: int,
      xpGained: int,
      acornsChange: int,
      avatarUrl: string
    }
  - defenderStats: {
      nameAtBattle: string,
      levelAtBattle: int,
      xpAtBattle: int,
      xpGained: int,
      acornsChange: int,
      avatarUrl: string
    }
```

## Testing

### Setup Test Users
```typescript
import { seedTestUsers } from './scripts/seedTestUsers';

// Call once to create test users
seedTestUsers();
```

This creates 5 test users with varying levels (2-10) and acorns (40-200).

### Manual Testing Checklist
- [ ] User can battle when cooldown is 0
- [ ] User cannot battle during cooldown
- [ ] Shield timer shows correctly when attacked
- [ ] Shielded users excluded from opponent pool
- [ ] Battle results modal displays correctly
- [ ] XP and acorns update in Firestore
- [ ] Level updates when XP threshold crossed
- [ ] Battle history saved to battles collection
- [ ] Error shown when no opponents available
- [ ] Loading state shows during battle

## Security Considerations

### Current Implementation
- **Client-side calculation** (good for hackathon/MVP)
- **Firestore batch writes** (atomic updates, prevents partial failures)
- Users can't battle themselves
- Shielded users protected from matchmaking

### Production Recommendations
1. **Move battle logic to Cloud Functions**
   - Prevents client-side manipulation
   - Server authoritative
   - Harder to cheat

2. **Firestore Security Rules**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read: if request.auth != null;
         allow write: if request.auth.uid == userId;
       }
       match /battles/{battleId} {
         allow read: if request.auth != null;
         allow create: if request.auth != null;
       }
     }
   }
   ```

3. **Rate limiting** on battle endpoint
4. **Anti-cheat validation** for XP/acorn amounts

## Future Enhancements (TODO)

### Common Ground Section
Once Canvas integration is complete:
- Show shared courses
- Compare milestone completion rates
- Display mutual friends

### Battle History
- View past battles in activity journal
- Battle stats/leaderboard
- Win/loss ratio tracking

### Notifications
- Notify users when attacked while offline
- Push notifications for battle results

### Battle Animations
- Visual battle sequence
- Victory/defeat animations
- Confetti for wins

## Known Edge Cases

### Handled
✅ No opponents available → shows error
✅ User not logged in → shows error
✅ Cooldown not expired → button disabled
✅ Opponent has 0 acorns → loser loses what they have (can't go negative)

### Not Yet Handled (Low Priority)
- Only 1 user in system (you) → shows "no opponents"
- All users shielded → shows "no opponents"
- Firestore offline → error

## Dependencies
- Firebase SDK (Firestore, Auth)
- React Router
- TypeScript
- CSS Modules

## Questions?
Contact the team or check the main project README.
