import { useState, useEffect, useCallback } from 'react';
import { 
  User, 
  getUser, 
  getToken, 
  signIn as apiSignIn, 
  signUp as apiSignUp,
  signOut as apiSignOut,
  updateProfile as apiUpdateProfile,
  getChatHistory as apiGetChatHistory,
  requestPasswordReset as apiRequestPasswordReset,
  resetPassword as apiResetPassword
} from '@/services/auth';
import {
  SocialProvider,
  initiateSocialLogin,
  requestPhoneOTP,
  verifyPhoneOTP
} from '@/services/socialAuth';

import {
  getUserState,
  getAuthState,
  setAuthState,
  subscribeToAuthChanges
} from '@/store/authStore';

interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (username: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  socialLogin: (provider: SocialProvider) => Promise<void>;
  phoneLogin: {
    requestOTP: (phoneNumber: string) => Promise<string>;
    verifyOTP: (
      phoneNumber: string,
      otp: string,
      sessionId: string
    ) => Promise<void>;
  };
  requestPasswordReset: (email: string) => Promise<boolean>;
  resetPassword: (token: string, password: string) => Promise<boolean>;
  getChatHistory: () => Promise<any[]>;
  clearError: () => void;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(getUserState());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(getAuthState());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Sync state whenever the auth state changes globally
  useEffect(() => {
    const sync = () => {
      setUser(getUserState());
      setIsAuthenticated(getAuthState());
    };
    const unsubscribe = subscribeToAuthChanges(sync);
    return unsubscribe;
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const token = await getToken();
        
        if (token) {
          const userData = await getUser();
          if (userData) {
            setAuthState(userData, true);
          } else {
            setAuthState(null, false);
          }
        } else {
          setAuthState(null, false);
        }
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to check authentication status"
        );
        setAuthState(null, false);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      clearError();
      try {
        const data = await apiSignIn(email, password);
        setAuthState(data.user, true);  // Update global auth state
        broadcastAuthChange(true);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Sign in failed");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [clearError]
  );

  const signUp = useCallback(
    async (username: string, email: string, password: string) => {
      setIsLoading(true);
      clearError();
      try {
        const data = await apiSignUp(username, email, password);
        setAuthState(data.user, true);
        broadcastAuthChange(true);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Sign up failed");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [clearError]
  );

  const signOut = useCallback(async () => {
    setIsLoading(true);
    clearError();
    try {
      await apiSignOut();
      setAuthState(null, false);  // Update global auth state
      broadcastAuthChange(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Sign out failed");
    } finally {
      setIsLoading(false);
    }
  }, [clearError]);

  const updateProfile = useCallback(
    async (userData: Partial<User>) => {
      setIsLoading(true);
      clearError();
      try {
        const updatedUser = await apiUpdateProfile(userData);
        setAuthState(updatedUser, true); // Update global auth state
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Profile update failed"
        );
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [clearError]
  );

  const socialLogin = useCallback(
    async (provider: SocialProvider) => {
      setIsLoading(true);
      clearError();
      try {
        await initiateSocialLogin(provider);
        const userData = await getUser();
        if (userData) {
          setAuthState(userData, true); // Update global auth state
        } else {
          throw new Error("Failed to get user data after social login");
        }
      } catch (error) {
        setError(
          error instanceof Error ? error.message : `${provider} login failed`
        );
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [clearError]
  );

  const phoneLogin = {
    requestOTP: async (phoneNumber: string): Promise<string> => {
      setIsLoading(true);
      clearError();
      try {
        return await requestPhoneOTP(phoneNumber);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to send OTP");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },

    verifyOTP: async (
      phoneNumber: string,
      otp: string,
      sessionId: string
    ): Promise<void> => {
      setIsLoading(true);
      clearError();
      try {
        const result = await verifyPhoneOTP(phoneNumber, otp, sessionId);
        setAuthState(result.user, true); // Update global auth state
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "OTP verification failed"
        );
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
  };

  const requestPasswordReset = useCallback(
    async (email: string): Promise<boolean> => {
      setIsLoading(true);
      clearError();
      try {
        return await apiRequestPasswordReset(email);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to request password reset"
        );
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [clearError]
  );

  const resetPassword = useCallback(
    async (token: string, password: string): Promise<boolean> => {
      setIsLoading(true);
      clearError();
      try {
        return await apiResetPassword(token, password);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to reset password"
        );
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [clearError]
  );

  const getChatHistory = useCallback(async (): Promise<any[]> => {
    if (!isAuthenticated) return [];
    clearError();
    try {
      return await apiGetChatHistory();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to fetch chat history"
      );
      return [];
    }
  }, [isAuthenticated, clearError]);

  const broadcastAuthChange = (state: boolean) => {
    try {
      chrome.runtime.sendMessage({
        type: "AUTH_STATE_CHANGED",
        isAuthenticated: state,
      });
    } catch (error) {
      console.error("Failed to notify about auth state change:", error);
    }

    document.dispatchEvent(
      new CustomEvent("auth_state_changed", {
        detail: { isAuthenticated: state },
      })
    );
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    signIn,
    signUp,
    signOut,
    updateProfile,
    socialLogin,
    phoneLogin,
    requestPasswordReset,
    resetPassword,
    getChatHistory,
    clearError,
  };
}

export default useAuth;
