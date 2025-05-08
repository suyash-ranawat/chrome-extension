import React, { useState, useEffect } from 'react';
import useAuth from '@/hooks/useAuth';
import SignIn from './SignIn';
import SignUp from './SignUp';
import Profile from './Profile';
import { SocialProvider } from '@/services/socialAuth';
import { User } from '@/services/auth';

// View types for authentication
type AuthView = 'signin' | 'signup' | 'profile' | 'phone';

interface AuthProps {
  // When authentication is complete, navigate back to chat
  onAuthComplete: () => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthComplete }) => {
  // Authentication context
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    error: authError,
    signIn, 
    signUp, 
    signOut, 
    updateProfile,
    socialLogin,
    phoneLogin,
    clearError
  } = useAuth();

  // View state
  const [currentView, setCurrentView] = useState<AuthView>('signin');

  // Component error state (to handle UI errors that aren't from the auth hook)
  const [componentError, setComponentError] = useState<string | null>(null);

  // Combined error from hook and component
  const error = componentError || authError;

  // Phone authentication state
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [phoneAuthSessionId, setPhoneAuthSessionId] = useState<string | null>(null);

  // Navigation methods
  const navigateToSignIn = () => {
    clearError();
    setComponentError(null);
    setCurrentView('signin');
  };

  const navigateToSignUp = () => {
    clearError();
    setComponentError(null);
    setCurrentView('signup');
  };

  const navigateToProfile = () => {
    clearError();
    setComponentError(null);
    setCurrentView('profile');
  };

  const navigateToPhoneAuth = () => {
    clearError();
    setComponentError(null);
    setCurrentView('phone');
  };

  // Handle successful authentication
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      onAuthComplete();
    }
  }, [isAuthenticated, isLoading, onAuthComplete]);

  // Authentication handlers
  const handleSignIn = async (email: string, password: string): Promise<boolean> => {
    clearError();
    setComponentError(null);
    
    try {
      await signIn(email, password);
      return true;
    } catch (err) {
      console.log(err);
      if (err instanceof Error) {
        setComponentError(err.message);
      } else if (typeof err === 'object' && err !== null) {
        const errorObj = err as any;
        setComponentError(errorObj.message || 'Sign in failed');
      } else {
        setComponentError('An unexpected error occurred');
      }
      return false;
    }
  };

  const handleSignUp = async (username: string, email: string, password: string): Promise<boolean> => {
    clearError();
    setComponentError(null);
    
    try {
      await signUp(username, email, password);
      return true;
    } catch (err) {
      if (err instanceof Error) {
        setComponentError(err.message);
      } else if (typeof err === 'object' && err !== null) {
        const errorObj = err as any;
        setComponentError(errorObj.message || 'Sign up failed');
      } else {
        setComponentError('An unexpected error occurred');
      }
      return false;
    }
  };

  const handleSignOut = async (): Promise<void> => {
    clearError();
    setComponentError(null);
    
    try {
      await signOut();
      navigateToSignIn();
    } catch (err) {
      if (err instanceof Error) {
        setComponentError(err.message);
      } else {
        setComponentError('Failed to sign out');
      }
    }
  };

  const handleUpdateProfile = async (userData: Partial<User>): Promise<boolean> => {
    clearError();
    setComponentError(null);
    
    try {
      await updateProfile(userData);
      return true;
    } catch (err) {
      if (err instanceof Error) {
        setComponentError(err.message);
      } else if (typeof err === 'object' && err !== null) {
        const errorObj = err as any;
        setComponentError(errorObj.message || 'Profile update failed');
      } else {
        setComponentError('An unexpected error occurred');
      }
      return false;
    }
  };

  const handleSocialLogin = async (provider: SocialProvider): Promise<boolean> => {
    clearError();
    setComponentError(null);
    
    try {
      await socialLogin(provider);
      return true;
    } catch (err) {
      if (err instanceof Error) {
        setComponentError(err.message);
      } else if (typeof err === 'object' && err !== null) {
        const errorObj = err as any;
        setComponentError(errorObj.message || `${provider} login failed`);
      } else {
        setComponentError(`${provider} login failed`);
      }
      return false;
    }
  };

  const handlePhoneLogin = {
    requestOTP: async (phone: string): Promise<string | null> => {
      clearError();
      setComponentError(null);
      setPhoneNumber(phone);
      
      try {
        const sessionId = await phoneLogin.requestOTP(phone);
        setPhoneAuthSessionId(sessionId);
        return sessionId;
      } catch (err) {
        if (err instanceof Error) {
          setComponentError(err.message);
        } else if (typeof err === 'object' && err !== null) {
          const errorObj = err as any;
          setComponentError(errorObj.message || 'Failed to send verification code');
        } else {
          setComponentError('Failed to send verification code');
        }
        return null;
      }
    },
    
    verifyOTP: async (otp: string): Promise<boolean> => {
      clearError();
      setComponentError(null);
      
      if (!phoneAuthSessionId || !phoneNumber) {
        setComponentError('Phone verification session expired. Please try again.');
        return false;
      }
      
      try {
        await phoneLogin.verifyOTP(phoneNumber, otp, phoneAuthSessionId);
        return true;
      } catch (err) {
        if (err instanceof Error) {
          setComponentError(err.message);
        } else if (typeof err === 'object' && err !== null) {
          const errorObj = err as any;
          setComponentError(errorObj.message || 'Invalid verification code');
        } else {
          setComponentError('Failed to verify code');
        }
        return false;
      }
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // Render appropriate view based on authentication state and current view
  if (isAuthenticated) {
    if (currentView === 'profile') {
      return (
        <Profile 
          user={user}
          onSignOut={handleSignOut}
          onUpdate={handleUpdateProfile}
          error={error}
        />
      );
    }
    
    // If authenticated but not in profile view, redirect to onAuthComplete
    onAuthComplete();
    return null;
  }

  // Render authentication forms for non-authenticated users
  return (
    <div className="flex justify-center items-center min-h-full bg-gray-50">
      <div className="w-full max-w-md">
        {currentView === 'signin' && (
          <SignIn
            onSignIn={handleSignIn}
            onSwitchToSignUp={navigateToSignUp}
            onPhoneLogin={navigateToPhoneAuth}
            onSocialLogin={handleSocialLogin}
            error={error}
          />
        )}
        
        {currentView === 'signup' && (
          <SignUp
            onSignUp={handleSignUp}
            onSwitchToSignIn={navigateToSignIn}
            onPhoneLogin={navigateToPhoneAuth}
            onSocialLogin={handleSocialLogin}
            error={error}
          />
        )}
        
        {currentView === 'phone' && (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium mb-4 text-gray-800">Phone Authentication</h2>
            
            {error && (
              <div className="mb-4 p-2 bg-red-50 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <div className="mt-4">
              <button
                onClick={navigateToSignIn}
                className="text-green-600 hover:text-green-700 text-sm font-medium"
              >
                ← Back to sign in
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;