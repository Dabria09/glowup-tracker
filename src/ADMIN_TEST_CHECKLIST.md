# 🧪 GGU Admin Panel - Full Test Checklist

**Date:** 2026-06-19  
**Tester:** Admin  
**App URL:** https://girlsglowingup.com/admin

---

## ✅ PRE-TEST SETUP

1. [ ] Log in as admin (email: `bria@girlsglowingup.com` or your admin account)
2. [ ] Navigate to Admin Panel (`/admin`)
3. [ ] Verify notification bell shows counts (if there are pending items)

---

## 📊 1. OVERVIEW TAB

**Test Steps:**
- [ ] Dashboard loads without errors
- [ ] Total users count displays
- [ ] Active users (DAU/MAU) shows correct numbers
- [ ] Charts render properly (user growth, engagement)
- [ ] Quick stats cards show valid data

**Expected:** All metrics display, no loading spinners stuck

---

## 👥 2. USER MANAGEMENT TAB

**Test Steps:**
- [ ] User list loads with pagination
- [ ] Search by email works
- [ ] Filter by role (admin/user) works
- [ ] Click user → detail modal opens
- [ ] Edit user role (admin ↔ user) saves
- [ ] Delete user confirmation shows
- [ ] Bulk delete works (select multiple → delete)

**Expected:** CRUD operations work, no errors in console

---

## 📈 3. ENGAGEMENT TAB

**Test Steps:**
- [ ] DAU/MAU chart renders
- [ ] Top users leaderboard shows
- [ ] Feature usage breakdown displays
- [ ] Date range filter works
- [ ] Export CSV button downloads file

**Expected:** Charts render, export creates valid CSV

---

## 📝 4. CONTENT TAB

**Test Steps:**
- [ ] Recent posts list loads
- [ ] Filter by content type (ShoutOut, Community, GlowBoard)
- [ ] View post detail modal
- [ ] Delete post works
- [ ] Approve/reject pending posts

**Expected:** Content moderation actions complete successfully

---

## 👨‍👩‍👧 5. GROUPS TAB

**Test Steps:**
- [ ] Class groups list loads
- [ ] Create new group works
- [ ] Edit group details saves
- [ ] Add/remove members works
- [ ] Group analytics show member activity

**Expected:** Group CRUD operations functional

---

## 📣 6. ANNOUNCE TAB

**Test Steps:**
- [ ] Announcement form loads
- [ ] Create announcement with title/body
- [ ] Schedule for future date/time
- [ ] Send immediately option works
- [ ] Scheduled announcements list shows
- [ ] Cancel scheduled announcement works

**Expected:** Announcements created and scheduled correctly

---

## 🛡️ 7. MODERATION TAB (Content Safety)

**Test Steps:**
- [ ] **Auto-Flagged sub-tab:**
  - [ ] Shows posts containing banned words
  - [ ] Remove post button works
  - [ ] Dismiss from review queue works
  - [ ] Ban user button works

- [ ] **Reported sub-tab:**
  - [ ] Shows user-reported content
  - [ ] Resolve (keep content) works
  - [ ] Dismiss works
  - [ ] Remove + Resolve deletes content
  - [ ] Ban user from report works

- [ ] **Shout Outs sub-tab:**
  - [ ] Shows all shout-outs
  - [ ] Approve pending posts works
  - [ ] Reject with reason works
  - [ ] Delete post works

- [ ] **Community sub-tab:**
  - [ ] Shows all community posts
  - [ ] Approve/reject works
  - [ ] Delete works

- [ ] **Banned Words sub-tab:**
  - [ ] Add new banned word works
  - [ ] Category selection works
  - [ ] Delete word works
  - [ ] Filter by category works
  - [ ] Stats show correct counts

**Expected:** All moderation actions complete, notifications sent to admin bell

---

## 🎓 8. MENTORS TAB

**Test Steps:**
- [ ] **Applications list loads:**
  - [ ] Filter by status (pending/approved/rejected)
  - [ ] Filter by track (adult/teen)
  - [ ] Click application → detail view opens

- [ ] **Application review:**
  - [ ] View applicant essays/answers
  - [ ] View references
  - [ ] Verify identity checkbox works
  - [ ] Background check checkbox (adult only)
  - [ ] Interview completed checkbox
  - [ ] Approve application → mentor status updated
  - [ ] Reject with reason works
  - [ ] Assign mentee dropdown works

- [ ] **Newsletter:**
  - [ ] Mass email form loads
  - [ ] Select recipient group
  - [ ] Send newsletter works

**Expected:** Application workflow complete, mentors approved/rejected correctly

---

## 💬 9. MESSAGES TAB

**Test Steps:**
- [ ] Mentor messages list loads
- [ ] Filter by priority (low/medium/high/urgent)
- [ ] Filter by category
- [ ] View message detail
- [ ] Reply to mentor works
- [ ] Mark as resolved works
- [ ] Escalate to admin note works

**Expected:** Message triage functional

---

## 📬 10. MENTOR INBOX TAB

**Test Steps:**
- [ ] Shows admin-to-mentor messages
- [ ] Compose new message form works
- [ ] Select mentor from dropdown
- [ ] Send message delivers
- [ ] Track sent messages

**Expected:** Admin can communicate with mentors

---

## 👑 11. RANK SETTINGS TAB

**Test Steps:**
- [ ] Mentor rank requirements modal opens
- [ ] Edit min sessions for each tier
- [ ] Edit min rating for each tier
- [ ] Edit tier description
- [ ] Save & Recalculate triggers `updateMentorTiers`
- [ ] Reset to defaults works
- [ ] Add custom tier works
- [ ] Delete custom tier works

**Expected:** Rank configuration saves, mentors recalculated

---

## 📊 12. MENTOR ACTIVITY TAB

**Test Steps:**
- [ ] Mentor leaderboard loads
- [ ] Sessions completed stats show
- [ ] Average ratings display
- [ ] Filter by date range works
- [ ] Export data works

**Expected:** Mentor performance metrics accurate

---

## 🎥 13. VIDEO MONITOR TAB

**Test Steps:**
- [ ] Video sessions list loads
- [ ] Filter by status (Live/Upcoming/Completed)
- [ ] View session details
- [ ] Play recording (if available)
- [ ] Flag session for review creates ContentReport
- [ ] Join session as observer (if live)

**Expected:** Video monitoring functional, recordings playable

---

## 🔗 14. MATCHES TAB

**Test Steps:**
- [ ] Mentor-mentee matches list
- [ ] Create new match manually
- [ ] Select mentor + mentee from dropdowns
- [ ] Save match creates MentorApplication
- [ ] Edit existing match works
- [ ] End match works

**Expected:** Matching system functional

---

## 📞 15. SUPPORT TAB

**Test Steps:**
- [ ] Support tickets list loads
- [ ] Filter by status (open/in_progress/resolved/closed)
- [ ] Filter by category
- [ ] View ticket detail
- [ ] Admin reply works
- [ ] Change ticket status works
- [ ] Escalate to moderation works
- [ ] Safety keywords flagged

**Expected:** Support ticket workflow complete

---

## 🖼️ 16. GLOW BOARD TAB

**Test Steps:**
- [ ] Glow Board submissions list
- [ ] Filter by status (pending/approved/rejected/flagged)
- [ ] Preview image full-size
- [ ] Approve post works
- [ ] Reject with reason + email notification
- [ ] Toggle master Glow Board on/off
- [ ] Flagged content creates ContentReport

**Expected:** Glow Board moderation functional

---

## 👑 17. TEAMS TAB

**Test Steps:**
- [ ] Glow Teams list loads
- [ ] Filter by status (pending/approved/reported/banned)
- [ ] View team members
- [ ] Approve team works
- [ ] Reject team works
- [ ] Ban team + confirm modal
- [ ] View team stats (points, streak, challenges)

**Expected:** Team administration complete

---

## ⚙️ 18. SETTINGS TAB

**Test Steps:**
- [ ] Content moderation settings:
  - [ ] Toggle ShoutOut approval requirement
  - [ ] Toggle Community post approval
  - [ ] Settings save successfully

- [ ] Points settings:
  - [ ] View point values per action
  - [ ] Edit point values
  - [ ] Save updates

**Expected:** Global settings persist

---

## 📊 19. ANALYTICS TAB

**Test Steps:**
- [ ] Overview metrics load
- [ ] Filter by age group (Girls/Teens/Women)
- [ ] Filter by date range
- [ ] Most used features shows correct data
- [ ] Page views analytics accurate
- [ ] Trend calculations (vs prior 30 days)
- [ ] Export CSV downloads all metrics

**Expected:** Analytics accurate, export valid

---

## 🏆 20. POINTS & REWARDS TAB

**Test Steps:**
- [ ] **Prizes sub-tab:**
  - [ ] Prize list loads
  - [ ] Create new prize works
  - [ ] Edit prize (name, points, image)
  - [ ] Delete prize works
  - [ ] Toggle active/inactive

- [ ] **Redemptions sub-tab:**
  - [ ] Redemption requests list
  - [ ] Filter by status (pending/approved/denied)
  - [ ] Approve redemption works
  - [ ] Deny with reason works
  - [ ] Mark as shipped/delivered

**Expected:** Prize system functional

---

## 🏷️ 21. JOIN CODES TAB

**Test Steps:**
- [ ] Join codes list loads
- [ ] Create new code (general/group/event/challenge/promo)
- [ ] Set max uses (0 = unlimited)
- [ ] Set validity dates
- [ ] Toggle active/inactive
- [ ] Delete code works
- [ ] Usage count increments on redemption
- [ ] Promo codes apply discount at checkout

**Expected:** Codes work for group joining and discounts

---

## 🚨 22. FLAG REPORT TAB

**Test Steps:**
- [ ] Reported content list loads
- [ ] Filter by content type
- [ ] Filter by reason (spam/hate/bullying/etc.)
- [ ] Filter by date range
- [ ] View report detail
- [ ] Analytics show flagged content trends
- [ ] Export flagged content CSV

**Expected:** Flag tracking accurate

---

## 📊 23. DAILY POLLS TAB

**Test Steps:**
- [ ] Polls list loads
- [ ] Create single poll works
- [ ] Create multiple polls (bulk)
- [ ] CSV upload works
- [ ] Schedule poll for future date
- [ ] Archive expired polls automation runs
- [ ] View poll results/analytics
- [ ] Edit poll works
- [ ] Delete poll works

**Expected:** Poll system complete

---

## 👑 24. GLOW LEVELS TAB

**Test Steps:**
- [ ] Levels list loads
- [ ] Seed defaults creates 6 levels
- [ ] Create new level works
- [ ] Edit level (name, points, rewards)
- [ ] Delete level works
- [ ] Requirements (streak/badges/challenges) save
- [ ] Unlock rewards configure correctly

**Expected:** Level system configurable

---

## 👑 25. PIONEER NETWORK TAB

**Test Steps:**
- [ ] **Founding Members sub-tab:**
  - [ ] Shows first 1000 users
  - [ ] Tier breakdown (Founding/Pioneer/Early Adopter)
  - [ ] Progress bar accurate
  - [ ] Badge grant status shows

- [ ] **Affiliate Partners sub-tab:**
  - [ ] Affiliate applications list
  - [ ] Filter by status
  - [ ] Approve with commission rate
  - [ ] Reject with feedback
  - [ ] Copy referral link works
  - [ ] Track affiliate signups/commissions

**Expected:** Pioneer tracking accurate, affiliate workflow functional

---

## 🎫 26. GLOW PASSES TAB

**Test Steps:**
- [ ] Promo passes list loads
- [ ] Create new pass (10-char code)
- [ ] Set expiration date
- [ ] Set max uses
- [ ] Toggle active/inactive
- [ ] Delete pass works
- [ ] Usage tracking accurate
- [ ] Pass applies discount at checkout

**Expected:** Glow Pass redemption functional

---

## 🗑️ 27. DELETE USERS TAB

**Test Steps:**
- [ ] Bulk delete form loads
- [ ] Paste multiple emails
- [ ] Parse emails correctly
- [ ] Confirmation modal shows warning
- [ ] Delete users removes data
- [ ] OAuth identities noted for manual removal
- [ ] Results summary shows success/failure

**Expected:** User deletion works (with platform limitations noted)

---

## 🚫 28. BANNED WORDS TAB

**Test Steps:**
- [ ] Banned words list loads
- [ ] Add new word/phrase
- [ ] Select category (profanity/hate/bullying/etc.)
- [ ] Toggle auto-flag on/off
- [ ] Toggle block on/off
- [ ] Delete word works
- [ ] Filter by category works
- [ ] Search works
- [ ] Stats show active/inactive counts

**Expected:** Banned words filter content correctly

---

## 💰 29. AFFILIATES TAB

**Test Steps:**
- [ ] Affiliate applications list
- [ ] Filter by status
- [ ] View application details (social reach, promo plan)
- [ ] Approve with custom commission
- [ ] Reject with feedback
- [ ] Copy affiliate link works
- [ ] Track approved affiliate performance

**Expected:** Affiliate onboarding complete

---

## 👑 30. FOUNDING MEMBERS TAB

**Test Steps:**
- [ ] Shows Pioneer members
- [ ] Tier stats accurate (Founding/Pioneer/Early Adopter counts)
- [ ] Progress to 1000 members shows
- [ ] Member list by tier displays
- [ ] Badge grant dates show

**Expected:** Founding member tracking accurate

---

## 📧 31. EMAIL TEMPLATES TAB

**Test Steps:**
- [ ] Templates list loads (7 default templates)
- [ ] View template details
- [ ] Edit template (subject, body, variables)
- [ ] Click variable button copies to clipboard
- [ ] Preview mode renders HTML
- [ ] Open preview in new window works
- [ ] Save template updates
- [ ] Create new template works
- [ ] Delete template works
- [ ] Variables reference guide shows all template types

**Expected:** Email templates editable, preview accurate

---

## 🔔 32. ADMIN NOTIFICATION BELL

**Test Steps:**
- [ ] Bell icon shows badge count
- [ ] Click bell → notification panel opens
- [ ] Content Reports section shows pending reports
- [ ] Mentor Messages section shows pending messages
- [ ] Mentor Applications section shows pending apps
- [ ] Click notification → navigates to correct tab
- [ ] Deep-linking works (e.g., `?tab=moderation&highlight=ID`)
- [ ] Mark as read works
- [ ] "View All" links navigate correctly

**Expected:** Notifications actionable with deep-linking

---

## 🎉 33. LEVEL-UP CELEBRATION (User Flow Test)

**Test Steps:**
1. [ ] Log in as test user (non-admin)
2. [ ] Navigate to Dashboard
3. [ ] Complete Daily Check-in (+10 pts)
4. [ ] Write Diary Entry (+15 pts)
5. [ ] Log Fitness Activity (+20 pts)
6. [ ] Continue earning points until crossing level threshold
7. [ ] **Verify:** Celebration modal pops up automatically
8. [ ] **Verify:** Confetti explosion for 5 seconds
9. [ ] **Verify:** Modal shows new level name + emoji
10. [ ] **Verify:** Unlocked reward displays
11. [ ] **Verify:** "Keep Glowing" button closes modal
12. [ ] **Verify:** Notification bell shows level-up notification

**Expected:** Full celebration flow triggers automatically

---

## 📊 34. ANALYTICS VERIFICATION

**Test Steps:**
- [ ] Trigger various user actions (check-in, diary, fitness, etc.)
- [ ] Check Analytics tab → Engagement
- [ ] Verify actions counted in DAU
- [ ] Verify PointsHistory records match
- [ ] Check Most Used Features
- [ ] Verify page views tracked
- [ ] Export CSV → verify data matches UI

**Expected:** Analytics accurate, no double-counting

---

## 🛡️ 35. BANNED WORDS AUTO-FLAGGING

**Test Steps:**
1. [ ] Add test banned word (e.g., "testword123")
2. [ ] Log in as user
3. [ ] Post ShoutOut containing "testword123"
4. [ ] **Verify:** Post auto-flagged, status = "pending"
5. [ ] **Verify:** Admin notification bell updates
6. [ ] Go to Admin → Moderation → Auto-Flagged
7. [ ] **Verify:** Post appears with banned word highlighted
8. [ ] Remove post → verify deleted
9. [ ] Test word-boundary matching (no false positives on substrings)

**Expected:** Auto-flagging works without false positives

---

## ✅ FINAL CHECKLIST

- [ ] All 31 admin tabs accessible
- [ ] No console errors in browser
- [ ] No 404/500 errors in network tab
- [ ] All CRUD operations complete successfully
- [ ] All modals open/close correctly
- [ ] All filters/sorts work
- [ ] All exports download valid CSVs
- [ ] All notifications trigger correctly
- [ ] Deep-linking works for all notification types
- [ ] Level-up celebration triggers at correct thresholds
- [ ] Banned words filter content correctly
- [ ] Email templates editable with preview
- [ ] Video sessions monitorable
- [ ] Mentor workflow complete (apply → approve → assign → session)
- [ ] Support ticket workflow complete
- [ ] Glow Board moderation functional
- [ ] Teams administration complete
- [ ] Points/rewards system functional
- [ ] Pioneer/Affiliate tracking accurate

---

## 🐛 BUG REPORTING TEMPLATE

**If you find issues, document:**

```
**Tab:** [e.g., Moderation]
**Issue:** [Description]
**Steps to Reproduce:**
1. 
2. 
3. 

**Expected:** 
**Actual:** 
**Screenshot:** [if applicable]
**Console Errors:** [yes/no - paste if yes]
```

---

## 📝 NOTES SECTION

_Add any observations, UX improvements, or feature requests here:_

---

**Test Completed By:** ________________  
**Date:** ________________  
**Overall Status:** ☐ PASS  ☐ FAIL  ☐ PARTIAL  

**Critical Issues Found:** ________________