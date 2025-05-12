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
  const [authError, setAuthError] = useState<string | null>(null);
  
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
      error,
      authError
    });
  }, [isAuthenticated, isLoading, currentView, user, error, authError]);

  // Sync error state from useAuth hook to component state
  useEffect(() => {
    if (error) {
      setAuthError(error);
    }
  }, [error]);

  const handleSignIn = async (email: string, password: string) => {
    // Clear any previous errors
    setAuthError(null);
    clearError();
    
    try {
      console.log('AuthWrapper: Attempting to sign in...');
      const success = await signIn(email, password);
      
      // If the sign-in function returns false but didn't throw an error
      if (!success) {
        console.log('AuthWrapper: Sign-in returned false');
        setAuthError('Invalid email or password.');
        return false;
      }
      
      console.log('AuthWrapper: Sign-in successful');
      return true;
    } catch (err: any) {
      console.error('AuthWrapper: Sign in failed:', err);
      
      // Extract error message
      let errorMessage = 'An error occurred during sign in';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (err && typeof err === 'object') {
        if (err.message) {
          errorMessage = err.message;
        } else if (err.error) {
          errorMessage = err.error;
        }
      }
      
      // Set local error state
      setAuthError(errorMessage);
      return false;
    }
  };

  const handleSignUp = async (username: string, email: string, password: string) => {
    // Clear any previous errors
    setAuthError(null);
    clearError();
    
    try {
      const success = await signUp(username, email, password);
      if (!success) {
        setAuthError('Registration failed. Please try again.');
        return false;
      }
      return true;
    } catch (err: any) {
      console.error('Sign up failed:', err);
      
      // Extract error message
      let errorMessage = 'An error occurred during registration';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (err && typeof err === 'object') {
        if (err.message) {
          errorMessage = err.message;
        } else if (err.error) {
          errorMessage = err.error;
        }
      }
      
      setAuthError(errorMessage);
      return false;
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
       // Clear localStorage to remove chat history
      localStorage.removeItem('chatHistory');
      localStorage.removeItem('currentChatId');
      setCurrentView('signin');
    } catch (error) {
      console.error('Sign out failed:', error);
      setAuthError('Failed to sign out. Please try again.');
    }
  };

  const handleUpdateProfile = async (userData: any) => {
    setAuthError(null);
    
    try {
      const success = await updateProfile(userData);
      if (!success) {
        setAuthError('Profile update failed. Please try again.');
        return false;
      }
      setCurrentView('main');
      return true;
    } catch (err: any) {
      console.error('Profile update failed:', err);
      
      // Extract error message
      let errorMessage = 'An error occurred during profile update';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (err && typeof err === 'object') {
        if (err.message) {
          errorMessage = err.message;
        } else if (err.error) {
          errorMessage = err.error;
        }
      }
      
      setAuthError(errorMessage);
      return false;
    }
  };

  const handleSocialLogin = async (provider: SocialProvider) => {
    setAuthError(null);
    
    try {
      const success = await socialLogin(provider);
      if (!success) {
        setAuthError(`${provider} login failed. Please try again.`);
        return false;
      }
      return true;
    } catch (err: any) {
      console.error(`${provider} login failed:`, err);
      
      // Extract error message
      let errorMessage = `An error occurred during ${provider} login`;
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (err && typeof err === 'object') {
        if (err.message) {
          errorMessage = err.message;
        } else if (err.error) {
          errorMessage = err.error;
        }
      }
      
      setAuthError(errorMessage);
      return false;
    }
  };

  const handlePhoneAuth = {
    requestOTP: async (phone: string) => {
      setAuthError(null);
      
      try {
        setPhoneNumber(phone);
        const sessionId = await phoneLogin.requestOTP(phone);
        setPhoneAuthSessionId(sessionId);
        return true;
      } catch (err: any) {
        console.error('Phone OTP request failed:', err);
        
        // Extract error message
        let errorMessage = 'Failed to send verification code';
        if (err instanceof Error) {
          errorMessage = err.message;
        } else if (err && typeof err === 'object') {
          if (err.message) {
            errorMessage = err.message;
          } else if (err.error) {
            errorMessage = err.error;
          }
        }
        
        setAuthError(errorMessage);
        return false;
      }
    },
    
    verifyOTP: async (otp: string) => {
      if (!phoneAuthSessionId || !phoneNumber) {
        setAuthError('Phone verification session expired. Please try again.');
        return false;
      }
      
      setAuthError(null);
      
      try {
        const success = await phoneLogin.verifyOTP(phoneNumber, otp, phoneAuthSessionId);
        if (!success) {
          setAuthError('Invalid verification code. Please try again.');
          return false;
        }
        setCurrentView('main');
        return true;
      } catch (err: any) {
        console.error('Phone OTP verification failed:', err);
        
        // Extract error message
        let errorMessage = 'Failed to verify code';
        if (err instanceof Error) {
          errorMessage = err.message;
        } else if (err && typeof err === 'object') {
          if (err.message) {
            errorMessage = err.message;
          } else if (err.error) {
            errorMessage = err.error;
          }
        }
        
        setAuthError(errorMessage);
        return false;
      }
    }
  };

  // Combine auth errors from hook and component state
  const combinedError = authError || error;

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
          error={combinedError}
        />
      );
    }

    // Pass user and signOut through to the child components
    const childrenWithProps = React.Children.map(children, child => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child, { 
          user,
          onViewProfile: () => setCurrentView('profile'),
          onSignOut: handleSignOut,
          error: combinedError
        } as any);
      }
      return child;
    });

    return <>{childrenWithProps}</>;
  }

  // Show phone authentication screen
  if (currentView === 'phone') {
    return (
      <div className="flex justify-center items-center bg-gray-50">
        <div className="w-full max-w-md">
          <PhoneAuth 
            onSuccess={() => setCurrentView('main')}
            onCancel={() => setCurrentView('signin')}
            error={combinedError}
            onRequestOTP={handlePhoneAuth.requestOTP}
            onVerifyOTP={handlePhoneAuth.verifyOTP}
          />
        </div>
      </div>
    );
  }

  // Show authentication screens
  return (
    <div className="flex justify-center items-center bg-gray-50">
      <div className="w-full max-w-md">
        {currentView === 'signin' && (
          <SignIn
            onSignIn={async (email, password) => {
              console.log('SignIn component calling handleSignIn');
              const success = await handleSignIn(email, password);
              console.log('handleSignIn result:', success);
              return success;
            }}
            onSwitchToSignUp={() => {
              clearError();
              setAuthError(null);
              setCurrentView('signup');
            }}
            onSocialLogin={handleSocialLogin}
            onPhoneLogin={() => {
              clearError();
              setAuthError(null);
              setCurrentView('phone');
            }}
            error={combinedError} // Pass error to SignIn component
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
              setAuthError(null);
              setCurrentView('signin');
            }}
            onSocialLogin={handleSocialLogin}
            onPhoneLogin={() => {
              clearError();
              setAuthError(null);
              setCurrentView('phone');
            }}
            error={combinedError} // Pass error to SignUp component
          />
        )}
      </div>
    </div>
  );
};

export default AuthWrapper;