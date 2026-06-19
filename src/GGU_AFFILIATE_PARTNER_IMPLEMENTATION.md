# Affiliate Partner Program - Implementation Summary

## Overview
The Affiliate Partner Program allows users with social followings to earn money by driving signups to GGU. No age requirement — open to anyone with an audience.

---

## System Architecture

### Track 2: Affiliate Partner (Application-Based)

**Flow:**
1. User submits application with social platform info
2. Admin reviews and approves/rejects manually
3. Approved affiliates get unique referral code
4. Affiliate shares code/link with audience
5. New users sign up using code
6. Affiliate earns flat fee per signup
7. Dashboard tracks signups and earnings

---

## Files Created/Modified

### 1. Entities

**`AffiliateApplication.json`**
- Stores affiliate applications and tracking data
- Fields: user_email, full_name, social_platforms, total_followers, promotion_plan, status, affiliate_code, commission_rate, signups_driven, total_earned, etc.

**`Referral.json`**
- Tracks all referrals (both Pioneer and Affiliate)
- Fields: referrer_email, referred_email, referral_code, referral_type, commission_earned

### 2. Backend Functions

**`submitAffiliateApplication.js`**
- Handles application submission
- Generates unique affiliate code automatically
- Prevents duplicate applications

**`approveAffiliateApplication.js`**
- Admin-only function
- Approves/rejects applications
- Sets commission rate on approval

**`processAffiliateSignup.js`**
- Called when new user signs up with affiliate code
- Creates referral record
- Updates affiliate stats (signups_driven, total_earned)
- Awards 50-point welcome bonus to new user

### 3. Frontend Pages

**`pages/AffiliatePartner.jsx`**
- Application form for new affiliates
- Shows application status (pending/approved/rejected)
- Approved affiliates see: code, link, signups driven, total earned
- Share functionality for referral link

### 4. Admin Panel

**`components/admin/AffiliatesAdminTab.jsx`**
- View all applications (filter by status)
- Approve with commission rate setting
- Reject with optional reason
- Track affiliate performance: signups, earnings
- Copy affiliate links

**`pages/AdminPanel.jsx`**
- Added "💰 Affiliates" tab
- Integrated AffiliatesAdminTab

### 5. Router Integration

**`App.jsx`**
- Added `/affiliate-partner` route
- Accessible to all logged-in users

### 6. Registration Flow

**`pages/Register.jsx`**
- Detects `?ref=CODE` URL parameter
- Automatically calls `processAffiliateSignup` on successful registration
- Attributes signup to correct affiliate

---

## How It Works

### For Affiliates

1. **Apply:** Visit `/affiliate-partner`, fill out form with:
   - Full name
   - Social platforms (TikTok, Instagram, YouTube, etc.)
   - Follower counts
   - Promotion plan

2. **Wait for Approval:** Admin reviews within 48 hours

3. **Get Approved:** Receive:
   - Unique affiliate code (e.g., `GGU-USER-A1B2`)
   - Referral link: `https://app.ggu.com/register?ref=GGU-USER-A1B2`
   - Commission rate (set by admin, e.g., $2.00/signup)

4. **Share:** Promote link to audience via:
   - Social media posts
   - Bio links
   - Video descriptions
   - Stories

5. **Earn:** Track dashboard shows:
   - Signups driven
   - Total earned ($ commission × signups)
   - Commission per signup

### For Admin

1. **Review Applications:** Go to Admin Panel → Affiliates tab

2. **Approve:**
   - Click "Approve" on pending application
   - Set commission rate (e.g., $2.00 per signup)
   - Confirm

3. **Reject (if needed):**
   - Click "Reject"
   - Provide optional reason
   - Applicant is notified

4. **Monitor Performance:**
   - View all approved affiliates
   - See signups driven and earnings
   - Export data if needed

---

## Commission Structure

**Default:** Admin sets commission per affiliate during approval
- Typical range: $1–$5 per signup
- Can be tiered based on follower count or performance

**Example:**
- Micro-influencer (1K–10K followers): $2/signup
- Mid-tier (10K–100K): $3/signup
- Macro (100K+): $5/signup

**Payout:** Tracked in system, paid externally (PayPal, Venmo, etc.)
- Admin exports earnings report monthly
- Processes manual payments outside platform

---

## Key Features

✅ **No Age Requirement** — Open to all users
✅ **Manual Vetting** — Admin approves each affiliate (brand safety)
✅ **Unique Codes** — Auto-generated, one per affiliate
✅ **Real-Time Tracking** — Signups and earnings update instantly
✅ **Welcome Bonus** — New users referred by affiliates get 50 points
✅ **Fraud Prevention** — One referral per user (no duplicate claims)
✅ **Admin Dashboard** — Full oversight of all affiliates and performance

---

## URLs

- **Application Page:** `/affiliate-partner`
- **Referral Link Format:** `/register?ref=GGU-XXXX-YYYY`
- **Admin Panel:** `/admin` → Affiliates tab

---

## Future Enhancements (Optional)

1. **Automated Payouts:** Integrate Stripe/PayPal API for automatic commission payments
2. **Tiered Commissions:** Higher rates for affiliates who drive more signups
3. **Analytics Dashboard:** Show affiliates their conversion rates, click-through rates
4. **Marketing Materials:** Provide affiliates with pre-made graphics, videos, copy
5. **Cookie Duration:** Track referrals for 30 days (not just immediate signup)
6. **Recurring Commissions:** Earn percentage of subscription renewals

---

## Testing Checklist

- [ ] Submit application as regular user
- [ ] Approve application as admin with commission rate
- [ ] Copy referral link and sign up new user with code
- [ ] Verify affiliate stats update (signups_driven, total_earned)
- [ ] Check new user received 50-point welcome bonus
- [ ] Test reject flow with reason
- [ ] Verify duplicate referral prevention

---

**Build Time:** ~4 hours
**Status:** ✅ Complete and ready for testing