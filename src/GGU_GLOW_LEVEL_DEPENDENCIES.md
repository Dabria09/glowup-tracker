# Glow Level System - Dependencies & Requirements Tracking

## Current Status: ⚠️ PARTIAL IMPLEMENTATION

The Glow Level System has **point thresholds fully implemented**, but **streak/badge/challenge requirements are NOT yet tracked or enforced**. Here's the complete breakdown:

---

## 1. STREAK REQUIREMENTS 🔥

### Current State: **CALCULATED ON-THE-FLY, NOT STORED**

**What Exists:**
- ✅ Streak calculation logic in `GlowScore.jsx` (lines 48-62)
- ✅ Streak reminders via `sendStreakReminders.js` function
- ✅ Daily Check-In tracking via `DiaryEntry` entity with tags

**How Streaks Are Calculated:**
```javascript
// From GlowScore.jsx - calculates from PointsHistory
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

**What's Missing:**
- ❌ No dedicated `Streak` entity to store current streak count
- ❌ No `UserStreak` table with fields: `user_email`, `current_streak`, `longest_streak`, `last_activity_date`
- ❌ Streak is recalculated every time (expensive for large datasets)
- ❌ No clear definition: Is streak tied to Daily Check-In specifically OR any points activity?

**Current Implementation:**
- Streak = consecutive days with **ANY** PointsHistory entry
- Not limited to Daily Check-In only
- Calculated from PointsHistory, not DiaryEntry

**Recommendation:**
Create a `UserStreak` entity:
```json
{
  "name": "UserStreak",
  "type": "object",
  "properties": {
    "user_email": {"type": "string"},
    "current_streak": {"type": "number", "default": 0},
    "longest_streak": {"type": "number", "default": 0},
    "last_activity_date": {"type": "string"},
    "streak_type": {"type": "string", "enum": ["checkin", "any_activity", "challenge"]}
  }
}
```

---

## 2. BADGE REQUIREMENTS ⭐

### Current State: **NOT IMPLEMENTED**

**What Exists:**
- ✅ Badge display in `GlowScore.jsx` (MILESTONE_BADGES array, lines 17-26)
- ✅ Badge UI showing unlocked/locked states
- ❌ **NO badge entity** to track which users own which badges
- ❌ **NO badge awarding logic** anywhere in the codebase

**Current Badge System (UI Only):**
```javascript
// From GlowScore.jsx - purely points-based milestones
const MILESTONE_BADGES = [
  { id: 'first_glow',  name: 'First Glow',   emoji: '🌱', pts: 25 },
  { id: 'seedling',    name: 'Seedling',     emoji: '🌿', pts: 100 },
  { id: 'glowing',     name: 'Glowing',      emoji: '✨', pts: 250 },
  { id: 'blooming',    name: 'Blooming',     emoji: '🌸', pts: 500 },
  // ... etc
];

const unlockedBadges = MILESTONE_BADGES.filter(b => totalPoints >= b.pts).length;
```

**What's Missing:**
- ❌ No `UserBadge` entity to store earned badges
- ❌ No `Badge` entity defining badge requirements
- ❌ No automatic badge awarding when milestones reached
- ❌ No badge inventory UI outside of GlowScore page

**Badge Requirements in GlowLevel are UNENFORCEABLE Until:**
1. Create `UserBadge` entity: `user_email`, `badge_id`, `earned_date`
2. Create badge awarding automation (triggered by points milestones)
3. Update `syncGlowLevel()` to query: `SELECT COUNT(*) FROM UserBadge WHERE user_email = ?`

**Recommendation:**
Create entities:
```json
// Badge.json
{
  "name": "Badge",
  "type": "object",
  "properties": {
    "badge_id": {"type": "string"},
    "name": {"type": "string"},
    "emoji": {"type": "string"},
    "description": {"type": "string"},
    "tier": {"type": "string", "enum": ["starter", "common", "uncommon", "rare", "epic", "legendary"]},
    "requirement_type": {"type": "string", "enum": ["points", "streak", "challenges", "custom"]},
    "requirement_value": {"type": "number"}
  }
}

// UserBadge.json
{
  "name": "UserBadge",
  "type": "object",
  "properties": {
    "user_email": {"type": "string"},
    "badge_id": {"type": "string"},
    "earned_date": {"type": "string"}
  }
}
```

---

## 3. CHALLENGE REQUIREMENTS 🏆

### Current State: **PARTIAL - ENTITIES EXIST BUT NOT INTEGRATED**

**What Exists:**
- ✅ `GlowUpChallenge` entity (referenced in schema)
- ✅ `WeeklyChallenge` entity (referenced in schema)
- ✅ Challenge completion tracking in `PointsHistory` (action: `weekly_challenge`, `glow_up_challenge`)
- ❌ No `ChallengeCompletion` entity to track which users completed which challenges
- ❌ No challenge counter queryable by `syncGlowLevel()`

**Current Challenge Points (from pointsHelper.js):**
```javascript
challenge_day: 30,
weekly_challenge: 100,
glow_up_challenge: 200,
```

**What's Missing:**
- ❌ No way to query "How many challenges has user X completed?"
- ❌ No distinction between different challenge types in GlowLevel requirements
- ❌ No challenge history visible to admins

**Recommendation:**
Create `ChallengeCompletion` entity:
```json
{
  "name": "ChallengeCompletion",
  "type": "object",
  "properties": {
    "user_email": {"type": "string"},
    "challenge_id": {"type": "string"},
    "challenge_type": {"type": "string", "enum": ["daily", "weekly", "glow_up"]},
    "completed_date": {"type": "string"},
    "points_awarded": {"type": "number"}
  }
}
```

---

## 4. DEPENDENCY MAP

### What GlowLevel Requirements Currently Depend On:

| Requirement | Current Data Source | Status | Queryable? |
|-------------|-------------------|---------|------------|
| **Points** | `UserPoints.total_points` | ✅ Working | Yes |
| **Streak** | Calculated from `PointsHistory` | ⚠️ On-the-fly | Expensive |
| **Badges** | NONE (UI only) | ❌ Not tracked | No |
| **Challenges** | `PointsHistory` (actions) | ⚠️ Indirect | No count |

### What's Needed for Full Implementation:

```
GlowLevel Entity (already exists)
  ├── min_points ✅
  ├── max_points ✅
  ├── streak_requirement ⚠️ (no storage)
  ├── badge_requirement ❌ (no badge system)
  └── challenge_requirement ⚠️ (no completion tracking)

User Data Flow:
UserAction → PointsHistory ✅
         → UserPoints ✅
         → UserStreak ❌ (missing)
         → UserBadge ❌ (missing)
         → ChallengeCompletion ❌ (missing)
         → UserProfile.glow_level ✅ (via syncGlowLevel)
```

---

## 5. CURRENT STREAK DEFINITION

**Answer to your question:** Streak is currently tied to **ANY points-earning activity**, not just Daily Check-In.

**From the code:**
- Streak counts consecutive days with **any** PointsHistory entry
- Daily Check-In is ONE way to maintain streak (awards 10-15 pts)
- But so are: Diary Entry, Fitness Log, Cycle Tracked, etc.

**If you want streak to be Daily Check-In ONLY:**
Change the streak calculation to filter by `action = 'daily_checkin'`:
```javascript
const hist = await base44.entities.PointsHistory.filter({ 
  user_email: userEmail, 
  action: 'daily_checkin'  // Add this filter
}, '-created_date', 200);
```

---

## 6. IMPLEMENTATION PRIORITY

### Phase 1: Core Tracking (Needed for Level Requirements)
1. **Create `UserStreak` entity** - Store current/longest streak
2. **Create `ChallengeCompletion` entity** - Track challenge completions
3. **Update `syncGlowLevel()`** - Query these entities for requirement validation
4. **Add streak update logic** - Update UserStreak on daily_checkin

### Phase 2: Badge System (Independent Feature)
1. **Create `Badge` entity** - Define all badges + requirements
2. **Create `UserBadge` entity** - Store earned badges
3. **Create badge awarding automation** - Trigger on milestone reached
4. **Update `syncGlowLevel()`** - Query badge count

### Phase 3: Enforcement
1. **Update `syncGlowLevel()` logic:**
```javascript
// Pseudo-code for requirement validation
const userStreaks = await base44.entities.UserStreak.filter({ user_email });
const currentStreak = userStreaks[0]?.current_streak || 0;

const userBadges = await base44.entities.UserBadge.filter({ user_email });
const badgeCount = userBadges.length;

const completions = await base44.entities.ChallengeCompletion.filter({ user_email });
const challengeCount = completions.length;

// Check if ALL requirements met
const meetsPoints = totalPoints >= level.min_points;
const meetsStreak = currentStreak >= (level.streak_requirement || 0);
const meetsBadges = badgeCount >= (level.badge_requirement || 0);
const meetsChallenges = challengeCount >= (level.challenge_requirement || 0);

if (meetsPoints && meetsStreak && meetsBadges && meetsChallenges) {
  // Advance to this level
}
```

---

## 7. SUMMARY

### ✅ What's Working:
- Points thresholds fully implemented
- Levels update automatically when points change
- Admin can configure all thresholds via LevelsAdminTab

### ⚠️ What's Partial:
- Streak tracking exists but is calculated on-the-fly (not stored)
- Challenge completions recorded in PointsHistory but not queryable as a count

### ❌ What's Missing:
- Badge system (no entities, no tracking, no awarding)
- Requirement enforcement in syncGlowLevel()
- Clear definition of what counts toward streak

### 🔧 What You Need to Decide:
1. **Should streak be Daily Check-In only OR any activity?**
2. **Do you want badges to be automatic (points milestones) or manual (admin-awarded)?**
3. **Should challenge requirements count ALL challenges or specific types?**

---

## 8. RECOMMENDED NEXT STEPS

**If you want full requirement enforcement NOW:**

1. **Create the 3 missing entities:**
   - `UserStreak` - streak tracking
   - `Badge` + `UserBadge` - badge system
   - `ChallengeCompletion` - challenge tracking

2. **Update `syncGlowLevel()` to validate requirements**

3. **Add automation to update streaks/badges when points awarded**

**If you want to defer requirements:**

- Keep current system (points-only levels)
- Remove/hide requirement text from UI until implemented
- Focus on points integration (which IS complete)

---

**Bottom Line:** The points integration is 100% complete and working. The streak/badge/challenge requirements are **design placeholders** until the underlying tracking systems are built.