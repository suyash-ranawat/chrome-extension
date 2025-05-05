// src/hooks/useAuth.ts

import { useState, useEffect, useCallback } from 'react';
import { 
  User, 
  getUser, 
  getToken, 
  signIn as apiSignIn, 
  signUp as apiSignUp,
  signOut as apiSignOut,
  updateProfile as apiUpdateProfile
} from '@/services/auth';
import {
  SocialProvider,
  initiateSocialLogin,
  requestPhoneOTP,
  verifyPhoneOTP
} from '@/services/socialAuth';

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
    verifyOTP: (phoneNumber: string, otp: string, sessionId: string) => Promise<void>;
  };
  clearError: () => void;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Check if user is authenticated on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Checking authentication...');
        setIsLoading(true);
        const token = await getToken();
        
        if (token) {
          console.log('Token found, fetching user data...');
          try {
            const userData = await getUser();
            if (userData) {
              console.log('User authenticated successfully');
              setUser(userData);
              setIsAuthenticated(true);
            } else {
              console.log('User data not found despite having token');
              setUser(null);
              setIsAuthenticated(false);
            }
          } catch (userError) {
            console.error('Error fetching user data:', userError);
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          console.log('No authentication token found');
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
        setIsAuthenticated(false);
        setError(error instanceof Error ? error.message : 'Failed to check authentication status');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Sign in handler
  const signIn = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    clearError();
    try {
      console.log('Attempting to sign in...');
      const data = await apiSignIn(email, password);
      console.log('Sign in successful');
      setUser(data.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Sign in failed:', error);
      setError(error instanceof Error ? error.message : 'Sign in failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [clearError]);

  // Sign up handler
  const signUp = useCallback(async (username: string, email: string, password: string) => {
    setIsLoading(true);
    clearError();
    try {
      console.log('Attempting to sign up...');
      const data = await apiSignUp(username, email, password);
      console.log('Sign up successful');
      setUser(data.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Sign up failed:', error);
      setError(error instanceof Error ? error.message : 'Sign up failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [clearError]);

  // Sign out handler
  const signOut = useCallback(async () => {
    setIsLoading(true);
    clearError();
    try {
      console.log('Signing out...');
      await apiSignOut();
      setUser(null);
      setIsAuthenticated(false);
      console.log('Sign out successful');
    } catch (error) {
      console.error('Sign out failed:', error);
      setError(error instanceof Error ? error.message : 'Sign out failed');
    } finally {
      setIsLoading(false);
    }
  }, [clearError]);

  // Update profile handler
  const updateProfile = useCallback(async (userData: Partial<User>) => {
    setIsLoading(true);
    clearError();
    try {
      console.log('Updating profile...');
      const updatedUser = await apiUpdateProfile(userData);
      setUser(updatedUser);
      console.log('Profile updated successfully');
    } catch (error) {
      console.error('Profile update failed:', error);
      setError(error instanceof Error ? error.message : 'Profile update failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [clearError]);

  // Social login handler
  const socialLogin = useCallback(async (provider: SocialProvider) => {
    setIsLoading(true);
    clearError();
    try {
      console.log(`Initiating ${provider} login...`);
      await initiateSocialLogin(provider);
      
      // After successful social login, refresh the user data
      const userData = await getUser();
      if (userData) {
        console.log('Social login successful');
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        throw new Error('Failed to get user data after social login');
      }
    } catch (error) {
      console.error(`${provider} login failed:`, error);
      setError(error instanceof Error ? error.message : `${provider} login failed`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [clearError]);

  // Phone login handlers
  const phoneLogin = {
    requestOTP: async (phoneNumber: string): Promise<string> => {
      setIsLoading(true);
      clearError();
      try {
        console.log('Requesting OTP for phone login...');
        const response = await requestPhoneOTP(phoneNumber);
        if (response.success && response.sessionId) {
          console.log('OTP sent successfully');
          return response.sessionId;
        }
        throw new Error('Failed to send OTP');
      } catch (error) {
        console.error('Phone OTP request failed:', error);
        setError(error instanceof Error ? error.message : 'Failed to send OTP');
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    
    verifyOTP: async (phoneNumber: string, otp: string, sessionId: string): Promise<void> => {
      setIsLoading(true);
      clearError();
      try {
        console.log('Verifying OTP...');
        const data = await verifyPhoneOTP(phoneNumber, otp, sessionId);
        console.log('OTP verification successful');
        setUser(data.user);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Phone OTP verification failed:', error);
        setError(error instanceof Error ? error.message : 'OTP verification failed');
        throw error;
      } finally {
        setIsLoading(false);
      }
    }
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
    clearError
  };
}

export default useAuth;