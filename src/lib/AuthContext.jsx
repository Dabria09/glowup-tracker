import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { clearAuthSession, isDeletedAccount, loadCurrentUserRecord } from '@/lib/authRules';

const AuthContext = createContext();
const USER_RECORD_OPTIONAL_PATHS = new Set([
  '/google-setup',
  '/mentor-signup',
  '/mentor-register',
]);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    checkUserAuth();
  }, []);

  const checkUserAuth = async () => {
    try {
      setIsLoadingAuth(true);
      setAuthError(null);
      const isAuth = await base44.auth.isAuthenticated();
      setIsAuthenticated(isAuth);
      if (isAuth) {
        const currentUser = await base44.auth.me();
        // Check for user_not_registered scenario
        if (!currentUser) {
          setAuthError({ type: 'user_not_registered', message: 'User not registered for this app' });
          setUser(null);
          setIsAuthenticated(false);
          return;
        }

        const userRecord = await loadCurrentUserRecord(currentUser);
        if (!userRecord && USER_RECORD_OPTIONAL_PATHS.has(window.location.pathname)) {
          setUser(currentUser);
          return;
        }

        if (!userRecord || isDeletedAccount(userRecord)) {
          await clearAuthSession();
          setAuthError({ type: 'auth_required', message: 'Authentication required' });
          setUser(null);
          setIsAuthenticated(false);
          return;
        }

        setUser({ ...currentUser, ...userRecord });
      }
    } catch (error) {
      console.error('User auth check failed:', error);
      setIsAuthenticated(false);
      setUser(null);
      if (error?.data?.extra_data?.reason === 'user_not_registered') {
        setAuthError({ type: 'user_not_registered', message: 'User not registered for this app' });
      } else if (error.status === 401 || error.status === 403) {
        setAuthError({ type: 'auth_required', message: 'Authentication required' });
      }
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const logout = (shouldRedirect = true) => {
    setUser(null);
    setIsAuthenticated(false);
    base44.auth.logout(shouldRedirect ? window.location.href : undefined);
  };

  const navigateToLogin = () => {
    base44.auth.redirectToLogin(window.location.href);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      logout,
      navigateToLogin,
      checkUserAuth,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};