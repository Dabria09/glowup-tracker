import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
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

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black">
        <div className="w-8 h-8 border-4 border-gray-700 border-t-pink-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError?.type === 'user_not_registered') {
    return <UserNotRegisteredError />;
  }

  // For all other auth states (including auth_required), always render routes
  // Each page handles its own auth redirects
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/avatar" element={<Avatar />} />
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
      <Route path="*" element={<PageNotFound />} />
    </Routes>
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
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App