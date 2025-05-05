// src/pages/panel/components/auth/AuthWrapper.tsx

import React, { useState, useEffect } from 'react';
import useAuth from '@/hooks/useAuth';
import SignIn from './SignIn';
import SignUp from './SignUp';
import Profile from './Profile';
import PhoneAuth from './PhoneAuth';
import { SocialProvider } from '@/services/socialAuth';

interface AuthWrapperProps {
  children: React.ReactNode;
}

type AuthView = 'signin' | 'signup' | 'profile' | 'main' | 'phone';

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { 
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
  } = useAuth();
  
  const [currentView, setCurrentView] = useState<AuthView>('main');
  const [phoneAuthSessionId, setPhoneAuthSessionId] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  
  // Update view when authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      setCurrentView('main');
    } else if (!isLoading) {
      setCurrentView('signin');
    }
  }, [isAuthenticated, isLoading]);

  // Debug logging
  useEffect(() => {
    console.log('AuthWrapper state:', { 
      isAuthenticated, 
      isLoading, 
      currentView,
      hasUser: !!user,
      error
    });
  }, [isAuthenticated, isLoading, currentView, user, error]);

  const handleSignIn = async (email: string, password: string) => {
    try {
      await signIn(email, password);
      return true;
    } catch (error) {
      console.error('Sign in failed:', error);
      return false;
    }
  };

  const handleSignUp = async (username: string, email: string, password: string) => {
    try {
      await signUp(username, email, password);
      return true;
    } catch (error) {
      console.error('Sign up failed:', error);
      return false;
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setCurrentView('signin');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const handleUpdateProfile = async (userData: any) => {
    try {
      await updateProfile(userData);
      setCurrentView('main');
      return true;
    } catch (error) {
      console.error('Profile update failed:', error);
      return false;
    }
  };

  const handleSocialLogin = async (provider: SocialProvider) => {
    try {
      await socialLogin(provider);
      return true;
    } catch (error) {
      console.error(`${provider} login failed:`, error);
      return false;
    }
  };

  const handlePhoneAuth = {
    requestOTP: async (phone: string) => {
      try {
        setPhoneNumber(phone);
        const sessionId = await phoneLogin.requestOTP(phone);
        setPhoneAuthSessionId(sessionId);
        return true;
      } catch (error) {
        console.error('Phone OTP request failed:', error);
        return false;
      }
    },
    
    verifyOTP: async (otp: string) => {
      if (!phoneAuthSessionId || !phoneNumber) {
        return false;
      }
      
      try {
        await phoneLogin.verifyOTP(phoneNumber, otp, phoneAuthSessionId);
        setCurrentView('main');
        return true;
      } catch (error) {
        console.error('Phone OTP verification failed:', error);
        return false;
      }
    }
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // If authenticated, show the main app or profile if requested
  if (isAuthenticated) {
    if (currentView === 'profile') {
      return (
        <Profile 
          user={user}
          onSignOut={handleSignOut} 
          onUpdate={(userData) => {
            handleUpdateProfile(userData);
            setCurrentView('main');
          }}
        />
      );
    }

    // Pass user and signOut through to the child components
    const childrenWithProps = React.Children.map(children, child => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child, { 
          user,
          onViewProfile: () => setCurrentView('profile'),
          onSignOut: handleSignOut
        } as any);
      }
      return child;
    });

    return <>{childrenWithProps}</>;
  }

  // Show phone authentication screen
  if (currentView === 'phone') {
    return (
      <div className="flex justify-center items-center min-h-full bg-gray-50">
        <div className="w-full max-w-md">
          <PhoneAuth 
            onSuccess={() => setCurrentView('main')}
            onCancel={() => setCurrentView('signin')}
          />
        </div>
      </div>
    );
  }

  // Show authentication screens
  return (
    <div className="flex justify-center items-center min-h-full bg-gray-50">
      <div className="w-full max-w-md">
        {currentView === 'signin' && (
          <SignIn
            onSignIn={async (email, password) => {
              const success = await handleSignIn(email, password);
              return success;
            }}
            onSwitchToSignUp={() => {
              clearError();
              setCurrentView('signup');
            }}
            onSocialLogin={handleSocialLogin}
            onPhoneLogin={() => {
              clearError();
              setCurrentView('phone');
            }}
          />
        )}
        
        {currentView === 'signup' && (
          <SignUp
            onSignUp={async (username, email, password) => {
              const success = await handleSignUp(username, email, password);
              return success;
            }}
            onSwitchToSignIn={() => {
              clearError();
              setCurrentView('signin');
            }}
            onSocialLogin={handleSocialLogin}
            onPhoneLogin={() => {
              clearError();
              setCurrentView('phone');
            }}
          />
        )}
      </div>
    </div>
  );
};

export default AuthWrapper;