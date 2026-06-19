import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppModeGate from '@/components/AppModeGate';
import { UserProvider } from '@/lib/UserContext';
import Login from './pages/Login';
import Register from './pages/Register';
import MentorSignup from './pages/MentorSignup';
import MentorRegister from './pages/MentorRegister';
import MentorLogin from './pages/MentorLogin';
import ParentConsent from './pages/ParentConsent';
import GoogleSetup from './pages/GoogleSetup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
// Add page imports here
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Onboarding from './pages/Onboarding';
import Avatar from './pages/Avatar';
import Discover from './pages/Discover';
import FitnessTracker from './pages/FitnessTracker';
import PasswordVault from './pages/PasswordVault';
import ImportantContacts from './pages/ImportantContacts';
import Countdown from './pages/Countdown';
import Diary from './pages/Diary';
import StickyNotes from './pages/StickyNotes';
import MyCalendar from './pages/MyCalendar';
import DiaryEntry from './pages/DiaryEntry';
import CleaningCalendar from './pages/CleaningCalendar';
import BirthdayPlanner from './pages/BirthdayPlanner';
import TimeManagement from './pages/TimeManagement';
import TripPlanner from './pages/TripPlanner';
import TripDetail from './pages/TripDetail';
import GlowEventDetail from './pages/GlowEventDetail';
import HomeworkTracker from './pages/HomeworkTracker';
import CycleTracker from './pages/CycleTracker';
import VisionBoard from './pages/VisionBoard';
import SpiritualGlow from './pages/SpiritualGlow';
import ShoutOuts from './pages/ShoutOuts';
import CalmCorner from './pages/CalmCorner';
import GirlsLibrary from './pages/GirlsLibrary';
import YourVoice from './pages/YourVoice';
import AudioLibrary from './pages/AudioLibrary';
import WellnessHub from './pages/WellnessHub';
import DailyQuotes from './pages/DailyQuotes';
import DailyCheckIn from './pages/DailyCheckIn';
import DailyChallenges from './pages/DailyChallenges';
import GroceryList from './pages/GroceryList';
import MealPlanner from './pages/MealPlanner';
import MyGlowLink from './pages/MyGlowLink';
import Leaderboard from './pages/Leaderboard';
import ChallengeLeaderboard from './pages/ChallengeLeaderboard';
import GlowFeed from './pages/GlowFeed';
import GlowTeams from './pages/GlowTeams';
import GlowSquads from './pages/GlowSquads';
import GlowBoard from './pages/GlowBoard';
import GlowTalk from './pages/GlowTalk';
import TeamContests from './pages/TeamContests';
import TeamDetail from './pages/TeamDetail';
import SquadDetail from './pages/SquadDetail';
import DreamCalculator from './pages/DreamCalculator';
import MoneyTracker from './pages/MoneyTracker';
import SavingsGoals from './pages/SavingsGoals';
import MockVote from './pages/MockVote';
import CommunityHub from './pages/CommunityHub';
import CommunityDetail from './pages/CommunityDetail';
import AdminLogs from './pages/AdminLogs';
import GlowKitchen from './pages/GlowKitchen';
import Mentorship from './pages/Mentorship';
import MentorDashboard from './components/mentorship/MentorDashboard';
import MentorContactAdmin from './components/mentorship/MentorContactAdmin';
import ParentDashboard from './pages/ParentDashboard';
import GrowthMindset from './pages/GrowthMindset';
import Scholarships from './pages/Scholarships';
import CareerExploration from './pages/CareerExploration';
import JobTracker from './pages/JobTracker';
import GlowTips from './pages/GlowTips';
import MeVsMe from './pages/MeVsMe';
import GlowUpChallenges from './pages/GlowUpChallenges';
import GlowUpChallengeDetail from './pages/GlowUpChallengeDetail';
import WeeklyTheme from './pages/WeeklyTheme';
import GlowUpPlaylist from './pages/GlowUpPlaylist';
import GlowScore from './pages/GlowScore';
import MyCertificates from './pages/MyCertificates';
import MyGoals from './pages/MyGoals';
import GguAcademy from './pages/GguAcademy';
import Curriculum from './pages/Curriculum';
import About from './pages/About';
import HowItWorks from './pages/HowItWorks';
import Guidelines from './pages/Guidelines';
import Support from './pages/Support';
import PointsSettings from './pages/PointsSettings';
import PointsHistory from './pages/PointsHistory';
import MonthlySummary from './pages/MonthlySummary';
import JoinGGU from './pages/JoinGGU';
import GlowStore from './pages/GlowStore';
import GlowProfile from './pages/GlowProfile';
import GlowFollowers from './pages/GlowFollowers';
import AdminPanel from './pages/AdminPanel';
import WeeklyLeaderboardSummary from './pages/WeeklyLeaderboardSummary';
import Me from './pages/Me';
import Glow from './pages/Glow';
import Connect from './pages/Connect';
import BanGate from './components/BanGate';
import GlowPersona from './pages/GlowPersona';
import DiceBearAvatar from './pages/DiceBearAvatar';
import Notifications from './pages/Notifications';
import Search from './pages/Search';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import SavedQuotes from './pages/SavedQuotes';
import SavedScholarships from './pages/SavedScholarships';
import SavedCareers from './pages/SavedCareers';
import AdminQAChecklist from './pages/AdminQAChecklist';
import DirectMessages from './pages/DirectMessages';
import GlowPass from './pages/GlowPass';
import GlowPassRedeem from './pages/GlowPassRedeem';
import GlowPassSuccess from './pages/GlowPassSuccess';
import PioneerNetwork from './pages/PioneerNetwork';
import AffiliatePartner from './pages/AffiliatePartner';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center" style={{ background: '#0d0608' }}>
        <div style={{ fontFamily: '"Playfair Display", serif', fontWeight: 900, fontSize: 28, background: 'linear-gradient(135deg, #e8526d, #f1b610)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 24 }}>
          Girls Glowing Up™
        </div>
        <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: 'rgba(232,82,109,0.2)', borderTopColor: '#e8526d' }}></div>
        <p style={{ color: 'rgba(196,148,158,0.5)', fontSize: 13, marginTop: 16 }}>Loading your glow...</p>
      </div>
    );
  }

  if (authError?.type === 'user_not_registered') {
    return <UserNotRegisteredError />;
  }

  // For all other auth states (including auth_required), always render routes
  // Each page handles its own auth redirects
  return (
    <BanGate>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/join" element={<JoinGGU />} />
      <Route path="/mentor-signup" element={<MentorSignup />} />
      <Route path="/mentor-register" element={<MentorRegister />} />
      <Route path="/mentor-login" element={<MentorLogin />} />
      <Route path="/parent-consent" element={<ParentConsent />} />
      <Route path="/google-setup" element={<GoogleSetup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/" element={<Home />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route path="/mentor-dashboard" element={<MentorDashboard />} />
        <Route path="/mentor-contact-admin" element={<MentorContactAdmin />} />
        <Route element={<AppModeGate />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/avatar" element={<Avatar />} />
          <Route path="/glow-persona" element={<GlowPersona />} />
          <Route path="/dicebear-avatar" element={<DiceBearAvatar />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/fitness-tracker" element={<FitnessTracker />} />
          <Route path="/password-vault" element={<PasswordVault />} />
          <Route path="/important-contacts" element={<ImportantContacts />} />
          <Route path="/countdown" element={<Countdown />} />
          <Route path="/diary" element={<Diary />} />
          <Route path="/diary/:id" element={<DiaryEntry />} />
          <Route path="/sticky-notes" element={<StickyNotes />} />
          <Route path="/my-calendar" element={<MyCalendar />} />
          <Route path="/cleaning-calendar" element={<CleaningCalendar />} />
          <Route path="/birthday-planner" element={<BirthdayPlanner />} />
          <Route path="/time-management" element={<TimeManagement />} />
          <Route path="/trip-planner" element={<TripPlanner />} />
          <Route path="/trip-planner/:id" element={<TripDetail />} />
          <Route path="/birthday-planner/:id" element={<GlowEventDetail />} />
          <Route path="/homework-tracker" element={<HomeworkTracker />} />
          <Route path="/cycle-tracker" element={<CycleTracker />} />
          <Route path="/vision-board" element={<VisionBoard />} />
          <Route path="/spiritual-glow" element={<SpiritualGlow />} />
          <Route path="/shout-outs" element={<ShoutOuts />} />
          <Route path="/calm-corner" element={<CalmCorner />} />
          <Route path="/girls-library" element={<GirlsLibrary />} />
          <Route path="/your-voice" element={<YourVoice />} />
          <Route path="/audio-library" element={<AudioLibrary />} />
          <Route path="/wellness-hub" element={<WellnessHub />} />
          <Route path="/daily-quotes" element={<DailyQuotes />} />
          <Route path="/daily-checkin" element={<DailyCheckIn />} />
          <Route path="/daily-challenges" element={<DailyChallenges />} />
          <Route path="/grocery-list" element={<GroceryList />} />
          <Route path="/meal-planner" element={<MealPlanner />} />
          <Route path="/my-glow-link" element={<MyGlowLink />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/challenge-leaderboard" element={<ChallengeLeaderboard />} />
          <Route path="/glow-feed" element={<GlowFeed />} />
          <Route path="/glow-board" element={<GlowBoard />} />
          <Route path="/glow-talk" element={<GlowTalk />} />
          <Route path="/glow-teams" element={<GlowTeams />} />
          <Route path="/glow-teams/:id" element={<TeamDetail />} />
          <Route path="/glow-squads" element={<GlowSquads />} />
          <Route path="/glow-squads/:id" element={<SquadDetail />} />
          <Route path="/team-contests" element={<TeamContests />} />
          <Route path="/dream-calculator" element={<DreamCalculator />} />
          <Route path="/money-tracker" element={<MoneyTracker />} />
          <Route path="/savings-goals" element={<SavingsGoals />} />
          <Route path="/mock-vote" element={<MockVote />} />
          <Route path="/community-hub" element={<CommunityHub />} />
          <Route path="/community-hub/:id" element={<CommunityDetail />} />
          <Route path="/admin-logs" element={<AdminLogs />} />
          <Route path="/glow-kitchen" element={<GlowKitchen />} />
          <Route path="/mentorship" element={<Mentorship />} />
          <Route path="/parent-dashboard" element={<ParentDashboard />} />
          <Route path="/growth-mindset" element={<GrowthMindset />} />
          <Route path="/scholarships" element={<Scholarships />} />
          <Route path="/careers" element={<CareerExploration />} />
          <Route path="/job-tracker" element={<JobTracker />} />
          <Route path="/glow-tips" element={<GlowTips />} />
          <Route path="/me-vs-me" element={<MeVsMe />} />
          <Route path="/glow-up-challenges" element={<GlowUpChallenges />} />
          <Route path="/glow-up-challenges/:challengeId" element={<GlowUpChallengeDetail />} />
          <Route path="/weekly-theme" element={<WeeklyTheme />} />
          <Route path="/glow-playlist" element={<GlowUpPlaylist />} />
          <Route path="/glow-score" element={<GlowScore />} />
          <Route path="/my-certificates" element={<MyCertificates />} />
          <Route path="/my-goals" element={<MyGoals />} />
          <Route path="/ggu-academy" element={<GguAcademy />} />
          <Route path="/curriculum" element={<Curriculum />} />
          <Route path="/about" element={<About />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/guidelines" element={<Guidelines />} />
          <Route path="/support" element={<Support />} />
          <Route path="/points-settings" element={<PointsSettings />} />
          <Route path="/points-history" element={<PointsHistory />} />
          <Route path="/monthly-summary" element={<MonthlySummary />} />
          <Route path="/glow-store" element={<GlowStore />} />
          <Route path="/glowlink/:username" element={<GlowProfile />} />
          <Route path="/glowlink/:username/followers" element={<GlowFollowers />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/weekly-leaderboard" element={<WeeklyLeaderboardSummary />} />
          <Route path="/me" element={<Me />} />
          <Route path="/connect" element={<Connect />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/search" element={<Search />} />
          <Route path="/glow" element={<Glow />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/saved-quotes" element={<SavedQuotes />} />
          <Route path="/saved-scholarships" element={<SavedScholarships />} />
          <Route path="/saved-careers" element={<SavedCareers />} />
          <Route path="/admin-qa" element={<AdminQAChecklist />} />
          <Route path="/messages" element={<DirectMessages />} />
          <Route path="/glow-pass" element={<GlowPass />} />
          <Route path="/glow-pass-redeem" element={<GlowPassRedeem />} />
          <Route path="/glow-pass-success" element={<GlowPassSuccess />} />
          <Route path="/pioneer-network" element={<PioneerNetwork />} />
          <Route path="/affiliate-partner" element={<AffiliatePartner />} />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
    </BanGate>
  );
};


function App() {
  // Restore persisted color mode on load
  if (typeof window !== 'undefined') {
    const savedMode = localStorage.getItem('ggu_color_mode');
    if (savedMode === 'light') document.body.classList.add('light-mode');
    const savedLang = localStorage.getItem('ggu_lang');
    if (savedLang) {
      document.documentElement.setAttribute('lang', savedLang);
      document.documentElement.setAttribute('dir', savedLang === 'ar' ? 'rtl' : 'ltr');
    }
  }

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <UserProvider>
          <Router>
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </UserProvider>
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App