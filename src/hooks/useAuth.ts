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
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (username: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  socialLogin: (provider: SocialProvider) => Promise<void>;
  phoneLogin: {
    requestOTP: (phoneNumber: string) => Promise<string>;
    verifyOTP: (phoneNumber: string, otp: string, sessionId: string) => Promise<void>;
  }
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check if user is authenticated on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await getToken();
        const userData = await getUser();
        
        if (token && userData) {
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Sign in handler
  const signIn = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await apiSignIn(email, password);
      setUser(data.user);
      setIsAuthenticated(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sign up handler
  const signUp = useCallback(async (username: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await apiSignUp(username, email, password);
      setUser(data.user);
      setIsAuthenticated(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sign out handler
  const signOut = useCallback(async () => {
    setIsLoading(true);
    try {
      await apiSignOut();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update profile handler
  const updateProfile = useCallback(async (userData: Partial<User>) => {
    setIsLoading(true);
    try {
      const updatedUser = await apiUpdateProfile(userData);
      setUser(updatedUser);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Social login handler
  const socialLogin = useCallback(async (provider: SocialProvider) => {
    setIsLoading(true);
    try {
      await initiateSocialLogin(provider);
      
      // After successful social login, refresh the user data
      const userData = await getUser();
      if (userData) {
        setUser(userData);
        setIsAuthenticated(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Phone login handlers
  const phoneLogin = {
    requestOTP: async (phoneNumber: string): Promise<string> => {
      setIsLoading(true);
      try {
        const response = await requestPhoneOTP(phoneNumber);
        if (response.success && response.sessionId) {
          return response.sessionId;
        }
        throw new Error('Failed to send OTP');
      } finally {
        setIsLoading(false);
      }
    },
    
    verifyOTP: async (phoneNumber: string, otp: string, sessionId: string): Promise<void> => {
      setIsLoading(true);
      try {
        const data = await verifyPhoneOTP(phoneNumber, otp, sessionId);
        setUser(data.user);
        setIsAuthenticated(true);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    socialLogin,
    phoneLogin
  };
}

export default useAuth;