# Glow Level System - Complete Dependencies Guide

## Overview
This document explains ALL dependencies the Glow Level System relies on, how they're tracked, and what happens on level-up.

---

## 1. Streak Requirements (e.g., "Req: 7 streak")

### What is it?
Consecutive days of user activity (check-ins, diary entries, etc.)

### Current Implementation
**Source of Truth**: `PointsHistory` entity - tracks all user activities with timestamps

### How Streaks Are Calculated
```javascript
// From GlowScore.jsx and sendStreakReminders.js
const daySet = new Set(hist.map(e => new Date(e.created_date).toISOString().split('T')[0]));
let streak = 0;
let cursor = new Date();
cursor.setHours(0, 0, 0, 0);
const todayStr = cursor.toISOString().split('T')[0];
if (!daySet.has(todayStr)) cursor.setDate(cursor.getDate() - 1);
while (true) {
  const ds = cursor.toISOString().split('T')[0];
  if (daySet.has(ds)) { streak++; cursor.setDate(cursor.getDate() - 1); }
  else break;
}
```

### Activities That Count Toward Streak
From `sendStreakReminders.js`, any of these maintains a streak:
- ✅ Daily Check-In
- 📔 Diary Entry  
- ✅ Daily Challenge completion
- 💪 Fitness Log

### Current Status
⚠️ **NOT YET ENFORCED** - The `streak_requirement` field exists in `GlowLevel` entity but is NOT validated in `syncGlowLevel()`. Users level up based on points ONLY.

### To Enable Streak Validation
Add to `functions/syncGlowLevel.js`:
```javascript
// Calculate streak from PointsHistory
const history = await base44.entities.PointsHistory.filter({ user_email: user.email }, '-created_date', 100);
const daySet = new Set(history.map(h => h.created_date.slice(0, 10)));
// ... calculate streak as shown above

if (streak < currentLevel.streak_requirement) {
  return Response.json({ 
    success: true, 
    message: `Need ${currentLevel.streak_requirement} day streak (you have ${streak})`,
    level: null // Don't advance yet
  });
}
```

---

## 2. Badge Requirements (e.g., "Req: 1 badges")

### What is it?
Achievement badges earned through milestones (different from Glow Levels)

### Current Status
❌ **NO BADGE SYSTEM EXISTS** - There is NO `UserBadge` or `Badge` entity in the app. The `badge_requirement` field is unused.

### What Exists Instead
- **Milestone Badges** in `GlowScore.jsx` - These are HARDCODED visual badges shown in the UI based on points:
  ```javascript
  const MILESTONE_BADGES = [
    { id: 'first_glow', pts: 25 },
    { id: 'seedling', pts: 100 },
    { id: 'glowing', pts: 250 },
    { id: 'blooming', pts: 500 },
    // ... etc
  ];
  ```
  These are NOT stored in the database - they're just visual indicators.

- **GlowUpChallenges** - Separate entity for challenges, but no badge rewards

### To Implement Real Badges
1. Create `Badge` entity:
   ```json
   {
     "name": "Badge",
     "properties": {
       "name": "string",
       "emoji": "string",
       "description": "string",
       "criteria": "string",
       "points_required": "number"
     }
   }
   ```

2. Create `UserBadge` entity:
   ```json
   {
     "name": "UserBadge",
     "properties": {
       "user_email": "string",
       "badge_id": "string",
       "earned_date": "string"
     }
   }
   ```

3. Award badges automatically when criteria met (similar to `awardPoints`)

4. Update `syncGlowLevel()` to check badge count

---

## 3. Challenge Requirements (e.g., "Req: 1 challenges")

### What is it?
Completed challenges (Daily, Weekly, or Glow Up Challenges)

### Current Entities
- ✅ `GlowUpChallenge` - Challenge definitions
- ✅ `WeeklyChallenge` - Weekly challenge definitions
- ❌ `ChallengeCompletion` - Does NOT exist (no tracking of completions)

### How Challenges Work Now
From the codebase:
- Challenges are defined in entities
- Users can view challenges
- ❌ No completion tracking
- ❌ No points awarded for completions (not in `POINTS_CONFIG`)

### To Enable Challenge Tracking
1. Create `ChallengeCompletion` entity:
   ```json
   {
     "name": "ChallengeCompletion",
     "properties": {
       "user_email": "string",
       "challenge_id": "string",
       "challenge_type": "daily|weekly|glowup",
       "completed_date": "string"
     }
   }
   ```

2. Add `complete_challenge` to `POINTS_CONFIG` (currently exists but may not be used)

3. Update `syncGlowLevel()` to count completions:
   ```javascript
   const completions = await base44.entities.ChallengeCompletion.filter({ user_email: user.email });
   if (completions.length < currentLevel.challenge_requirement) {
     // Don't advance yet
   }
   ```

---

## 4. Points System (✅ FULLY IMPLEMENTED)

### Source of Truth
- **`UserPoints.total_points`** - Current total
- **`PointsHistory`** - Complete audit trail

### How It Works
```javascript
// From lib/pointsHelper.js
export async function awardPoints(userEmail, action) {
  const pts = await getConfiguredPoints(action);
  // Update UserPoints
  // Create PointsHistory record
  // Call syncGlowLevel() automatically
}
```

### All Point-Earning Actions
See `lib/pointsHelper.js` - `POINT_VALUES` object (52 unique actions)

### Real-Time Sync
✅ **FULLY WORKING** - Every points transaction calls `syncGlowLevel()` which:
1. Fetches all `GlowLevel` entities
2. Finds matching level based on `total_points`
3. Updates `UserProfile.glow_level`, `glow_level_number`, `glow_level_emoji`
4. Calls `checkLevelUp()` to detect level-ups

---

## 5. Level-Up Celebration (✅ NEWLY IMPLEMENTED)

### What Happens When a Girl Levels Up

#### Backend (`functions/checkLevelUp.js`)
1. Compares `previousLevel` (from UserProfile) vs `currentLevel` (calculated from points)
2. If `currentLevel.level_number > previousLevel`:
   - ✅ Creates `Notification` entity record with `type: 'level_up'`
   - ✅ Creates `PointsHistory` record with `action: 'level_up'`
   - ✅ Returns celebration data to frontend

#### Frontend (`components/celebration/LevelUpCelebration.jsx`)
1. Shows full-screen celebration modal
2. Triggers confetti animation (3 seconds)
3. Displays:
   - New level name and emoji
   - Unlocked reward
   - "Keep Glowing" button
4. Auto-closes after 5 seconds

#### User Experience Flow
```
User earns points → syncGlowLevel() → checkLevelUp() detects change
                                        ↓
                              Create Notification
                              Create PointsHistory record
                                        ↓
                              Frontend detects levelUp flag
                                        ↓
                              Show celebration modal + confetti
                                        ↓
                              Notification bell shows unread alert
```

### Where Celebration Appears
- ✅ **Full-screen modal** (immediate, can't miss it)
- ✅ **Notifications page** (`/notifications`) - persistent record
- ❌ **No sound** (browser restrictions)
- ❌ **No push notification** (would require service worker)

---

## Complete Dependency Map

```
Glow Level System
│
├─ Points (✅ ENFORCED)
│  ├─ UserPoints.total_points
│  ├─ PointsHistory (audit trail)
│  └─ 52 point-earning actions
│
├─ Streak (⚠️ DEFINED BUT NOT ENFORCED)
│  ├─ Calculated from PointsHistory timestamps
│  ├─ Daily Check-In, Diary, Challenges, Fitness
│  └─ streak_requirement field exists but unused
│
├─ Badges (❌ NOT IMPLEMENTED)
│  ├─ No Badge entity
│  ├─ No UserBadge entity
│  └─ badge_requirement field exists but unused
│
├─ Challenges (❌ PARTIALLY IMPLEMENTED)
│  ├─ GlowUpChallenge entity exists
│  ├─ WeeklyChallenge entity exists
│  ├─ ChallengeCompletion entity MISSING
│  └─ challenge_requirement field exists but unused
│
└─ Celebration (✅ FULLY IMPLEMENTED)
   ├─ checkLevelUp() function
   ├─ LevelUpCelebration component
   ├─ Confetti animation
   └─ Notification entity record
```

---

## Testing Checklist

### ✅ Test Edit Level
1. Go to Admin Panel → Glow Levels
2. Click Edit (pencil icon) on any level
3. Change point thresholds or reward name
4. Click "Update Level"
5. ✅ Changes save immediately
6. ✅ Users see updated level data on next page load

### ✅ Test Delete Level
1. Go to Admin Panel → Glow Levels
2. Click Delete (trash icon) on any level
3. Confirm deletion
4. ✅ Level removed from database
5. ⚠️ Users at that level will fall back to previous level

### ✅ Test New Level
1. Go to Admin Panel → Glow Levels
2. Click "+ New Level"
3. Fill in all fields (name, emoji, points, reward)
4. Click "Create Level"
5. ✅ Level appears in list
6. ✅ Users can level up to it immediately

### ✅ Test Level-Up Celebration
1. Set a level threshold just above your current points (e.g., you have 50 pts, set Level 2 to 60 pts)
2. Earn points until you cross the threshold (e.g., complete Daily Check-In)
3. ✅ Celebration modal appears with confetti
4. ✅ Notification created (check `/notifications`)
5. ✅ Profile updates with new level

---

## Recommendations

### Priority 1: Enable Streak Validation
- Streak calculation code already exists in `GlowScore.jsx`
- Just needs to be added to `syncGlowLevel()` validation logic
- Low effort, high impact on engagement

### Priority 2: Implement Badge System
- Create `Badge` and `UserBadge` entities
- Auto-award badges based on milestones
- Medium effort, adds gamification depth

### Priority 3: Enable Challenge Tracking
- Create `ChallengeCompletion` entity
- Add completion UI to challenge pages
- Link to level requirements
- Medium effort, encourages challenge participation

### Priority 4: Add Level-Up Benefits
- Currently unlocks are just displayed (no actual functionality)
- To implement:
  - `badge` unlock_type → auto-add to UserBadge
  - `frame` unlock_type → add to UserProfile.owned_store_items
  - `theme` unlock_type → unlock in profile theme picker
  - etc.

---

## Summary

**Currently Working:**
- ✅ Points-based level progression
- ✅ Real-time sync after every points action
- ✅ Level-up celebration with confetti
- ✅ Notification system
- ✅ Admin CRUD for levels

**Defined But Not Enforced:**
- ⚠️ Streak requirements (code exists, not validated)
- ⚠️ Badge requirements (no badge system)
- ⚠️ Challenge requirements (no completion tracking)

**Next Steps:**
1. Decide if streak/badge/challenge requirements should be enforced
2. If yes, implement missing entities and validation logic
3. If no, remove those fields from GlowLevel to avoid confusion