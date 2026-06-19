# GGU Points & Rewards — Complete Trackable Actions Audit

## 📊 SUMMARY
**Total Trackable Actions:** 52 unique actions across 8 categories

---

## 🎯 POINT CONFIGURATION CATEGORIES

### 1. **Daily Engagement** (3 actions)
- `daily_checkin` — Daily Check-In ✅
- `page_view` — Page View 👁️
- `login` — Daily Login 🔐

### 2. **Content Creation** (7 actions)
- `diary_entry` — Diary Entry 📔
- `shout_out` — Shout Out Posted 📣
- `glow_board_post` — Glow Board Post 📸
- `glow_feed_post` — Glow Feed Post 📱
- `community_post` — Community Post 💬
- `kitchen_post` — Kitchen Post 🥘
- `recipe_added` — Recipe Added 🍳

### 3. **Learning & Growth** (6 actions)
- `lesson_completed` — Lesson Completed 🎓
- `quiz_completed` — Quiz Completed 📝
- `complete_challenge` — Complete Challenge 🔥
- `complete_glow_up_day` — Glow Up Day ✨
- `weekly_challenge` — Weekly Challenge 🏅
- `daily_task` — Daily Task ✓

### 4. **Wellness & Self-Care** (6 actions)
- `fitness_log` — Fitness Log 💪
- `cycle_tracked` — Cycle Tracked 🌸
- `calm_corner` — Calm Corner Session 🧘
- `spiritual_habit` — Spiritual Habit 🙏
- `gratitude_entry` — Gratitude Entry 💖
- `meal_plan_created` — Meal Plan Created 🥗

### 5. **Goals & Planning** (4 actions)
- `goals_completed` — Goal Completed 🎯
- `savings_goal` — Savings Goal Set 💰
- `homework_task` — Homework Task 📖
- `daily_task_completed` — Daily Task Completed ☑️

### 6. **Social & Community** (7 actions)
- `save_quote` — Save a Quote 💭
- `glow_link_shared` — Glow Link Shared 🔗
- `glow_link_viewed` — Glow Link Viewed 👀
- `team_joined` — Team Joined 👥
- `community_joined` — Community Joined 🏫
- `book_club` — Book Club Activity 📚
- `mentor_session` — Mentor Session 🤝

### 7. **Customization** (3 actions)
- `avatar_customized` — Avatar Customized 🎨
- `glow_persona_created` — Glow Persona Created ✨
- `aesthetic_icon_set` — Aesthetic Icon Set 🌸

### 8. **Streaks & Milestones** (3 actions)
- `checkin_streak_bonus` — Check-in Streak Bonus 🏆
- `week_streak_bonus` — Week Streak Bonus 📅
- `month_streak_bonus` — Month Streak Bonus 🌙

### 9. **Achievements** (13 actions)
- `first_post` — First Post 🎉
- `scholarship_saved` — Scholarship Saved 🎓
- `job_application` — Job Application 💼
- `contact_added` — Contact Added 📞
- `grocery_item` — Grocery Item Added 🛒
- `sticky_note` — Sticky Note 📝
- `vision_board_item` — Vision Board Item 🌟

---

## 📍 WHERE POINTS ARE AWARDED (Page/Feature Mapping)

### **Daily Engagement**
- **Daily Check-In** → `/daily-checkin` (on submit)
- **Page View** → All major pages (Dashboard, Discover, Glow, Connect, Me, etc.)
- **Login** → `/login` (successful authentication)

### **Content Creation**
- **Diary Entry** → `/diary/new` (on create)
- **Shout Out** → `/shout-outs` (on post)
- **Glow Board Post** → `/glow-board` (on submit)
- **Glow Feed Post** → `/glow-feed` (on create)
- **Community Post** → `/community-hub/:id` (on post)
- **Kitchen Post** → `/glow-kitchen` (on create)
- **Recipe Added** → `/glow-kitchen` (recipe tab, on add)

### **Learning & Growth**
- **Lesson Completed** → `/ggu-academy` (on lesson read + quiz pass)
- **Quiz Completed** → `/ggu-academy` (on quiz pass)
- **Complete Challenge** → `/daily-challenges` (daily task completion)
- **Complete Glow Up Day** → `/glow-up-challenges` (day completion)
- **Weekly Challenge** → `/daily-challenges` (7-day challenge completion)
- **Daily Task** → `/daily-challenges` (individual task)

### **Wellness & Self-Care**
- **Fitness Log** → `/fitness-tracker` (on log workout)
- **Cycle Tracked** → `/cycle-tracker` (on log period/symptoms)
- **Calm Corner** → `/calm-corner` (on session complete)
- **Spiritual Habit** → `/spiritual-glow` (on habit log)
- **Gratitude Entry** → Part of daily check-in or spiritual glow
- **Meal Plan Created** → `/meal-planner` (on create plan)

### **Goals & Planning**
- **Goals Completed** → `/my-goals` (on mark complete)
- **Savings Goal Set** → `/savings-goals` (on create goal)
- **Homework Task** → `/homework-tracker` (on add/complete)
- **Daily Task Completed** → `/daily-challenges` (task checkbox)

### **Social & Community**
- **Save Quote** → `/daily-quotes` or `/saved-quotes` (on save)
- **Glow Link Shared** → `/glowlink/:username` (on share action)
- **Glow Link Viewed** → `/glowlink/:username` (on view another's profile)
- **Team Joined** → `/glow-teams` (on join team)
- **Community Joined** → `/community-hub` (on join community)
- **Book Club** → Book club feature (on participate)
- **Mentor Session** → `/mentorship` (on complete session)

### **Customization**
- **Avatar Customized** → `/avatar` (on save selfie/illustrated avatar)
- **Glow Persona Created** → `/glow-persona` (on generate persona)
- **Aesthetic Icon Set** → `/avatar` (icon tab, on select icon)

### **Streaks & Milestones**
- **Check-in Streak Bonus** → Daily check-in streaks (7, 30, 100 days)
- **Week Streak Bonus** → 7-day streak milestone
- **Month Streak Bonus** → 30-day streak milestone

### **Achievements**
- **First Post** → First ever post anywhere (shout out, glow board, etc.)
- **Scholarship Saved** → `/scholarships` (on save scholarship)
- **Job Application** → `/job-tracker` (on log application)
- **Contact Added** → `/important-contacts` (on add contact)
- **Grocery Item** → `/grocery-list` (on add item)
- **Sticky Note** → `/sticky-notes` (on create note)
- **Vision Board Item** → `/vision-board` (on add item)

---

## 🔧 IMPLEMENTATION STATUS

### ✅ **Already Implemented** (4 actions)
- `daily_checkin` — DailyCheckIn.jsx
- `glow_board_post` — GlowBoard.jsx
- `avatar_customized` — Avatar.jsx (monthly capped)
- `lesson_completed` — GguAcademy.jsx

### ⚠️ **Needs Implementation** (48 actions)
Most actions need `awardPoints()` calls added to their respective pages.

---

## 📋 RECOMMENDED POINT VALUES

### **Low Engagement** (1-5 pts)
- Page View: 1 pt (prevent spam with daily cap)
- Save Quote: 2 pts
- Glow Link Viewed: 2 pts
- Grocery Item: 5 pts
- Sticky Note: 5 pts
- Contact Added: 5 pts
- Login: 5 pts (daily cap)

### **Medium Engagement** (10-20 pts)
- Daily Check-In: 10 pts
- Glow Link Shared: 10 pts
- Community Joined: 10 pts
- Scholarship Saved: 10 pts
- Glow Board Post: 10 pts
- Shout Out: 15 pts
- Glow Feed Post: 15 pts
- Kitchen Post: 15 pts
- Aesthetic Icon Set: 15 pts
- Team Joined: 15 pts
- Gratitude Entry: 15 pts
- Cycle Tracked: 15 pts
- Daily Task Completed: 15 pts
- Homework Task: 15 pts

### **High Engagement** (20-30 pts)
- Quiz Completed: 20 pts
- Complete Challenge: 25 pts
- Daily Task: 25 pts
- Savings Goal: 25 pts
- First Post: 25 pts
- Fitness Log: 20 pts
- Spiritual Habit: 20 pts
- Meal Plan Created: 20 pts
- Recipe Added: 20 pts
- Job Application: 20 pts
- Book Club: 20 pts
- Vision Board Item: 15 pts
- Complete Glow Up Day: 20 pts

### **Very High Engagement** (30-50 pts)
- Lesson Completed: 30 pts
- Glow Persona Created: 30 pts
- Calm Corner: 25 pts
- Week Streak Bonus: 25 pts
- Mentor Session: 50 pts

### **Exceptional** (100+ pts)
- Weekly Challenge: 100 pts
- Month Streak Bonus: 100 pts

---

## 🛡️ ANTI-ABUSE MEASURES

### **Daily Capped Actions** (once per calendar day)
- `daily_checkin`
- `diary_entry`
- `fitness_log`
- `cycle_tracked`
- `calm_corner`
- `gratitude_entry`
- `spiritual_habit`
- `page_view` (cap at 50/day)
- `login`

### **Monthly Capped Actions**
- `avatar_customized` (once per month)

### **One-Time Actions**
- `first_post`
- `team_joined` (per team)
- `community_joined` (per community)

---

## 📊 ANALYTICS TRACKING

All major pages should call:
```javascript
base44.analytics.track({ 
  eventName: 'page_view', 
  metadata: { 
    page: 'Page Name', 
    path: '/route',
    category: 'main_nav' | 'feature' | 'detail_page'
  } 
});
```

### **Tracked Pages** (from audit)
- Dashboard, Discover, Glow, Connect, Me (main nav)
- Daily Check-in, Diary, Glow Score, Glow Board, Glow Teams
- Fitness Tracker, Glow Kitchen, Community Hub
- Careers, Scholarships, Mentorship
- And 40+ more feature pages

---

## 🎯 NEXT STEPS

1. **Add `awardPoints()` calls** to all pages/features listed above
2. **Update pointsHelper.js** with the new POINT_VALUES
3. **Test each action** to ensure points award correctly
4. **Add caps/guards** where specified
5. **Update UI** in Point Config tab to show all 52 actions
6. **Document** in admin panel which actions are capped

---

**Generated:** 2026-06-19
**Audit Version:** 1.0
**Total Actions:** 52 trackable user actions