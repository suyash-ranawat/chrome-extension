import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import SocialLoginButtons from './SocialLoginButtons';
import ForgotPassword from './ForgotPassword';  // Import ForgotPassword Component
import PhoneLogin from './PhoneLogin';  // Import PhoneLogin Component
import { SocialProvider } from '@/services/socialAuth';

interface SignInProps {
  onSignIn: (email: string, password: string) => Promise<boolean>;
  onPhoneSignIn: (phone: string, password: string) => Promise<void>;
  onSwitchToSignUp: () => void;
  onSocialLogin?: (provider: SocialProvider) => Promise<boolean>;
  error?: string | null;
}

const SignIn: React.FC<SignInProps> = ({ 
  onSignIn, 
  onPhoneSignIn, 
  onSwitchToSignUp,
  onSocialLogin,
  error 
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);  // State to handle ForgotPassword
  const [showPhoneLogin, setShowPhoneLogin] = useState(false);  // State to handle PhoneLogin

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await onSignIn(email, password);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordClick = () => {
    setShowForgotPassword(true);  // Show ForgotPassword Component
  };

  const handlePhoneLoginClick = () => {
    setShowPhoneLogin(true);  // Show PhoneLogin Component
  };

  const handleBackToSignIn = () => {
    setShowForgotPassword(false);
    setShowPhoneLogin(false);  // Hide PhoneLogin Component
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-6 h-full w-full">
        <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-green-500 animate-spin mb-4"></div>
        <p className="text-gray-600">Signing in...</p>
      </div>
    );
  }

  // Show ForgotPassword or PhoneLogin if needed
  if (showForgotPassword) {
    return <ForgotPassword onResetPassword={onSignIn} onBackToSignIn={handleBackToSignIn} />;
  }

  if (showPhoneLogin) {
    return <PhoneLogin onPhoneSignIn={onPhoneSignIn} onBackToSignIn={handleBackToSignIn} />;
  }

  return (
    <div className="flex flex-col items-center p-6">
      <div className="mb-6 text-center">
        <div className="h-12 w-12 mx-auto bg-green-500 rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="white" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="mt-2 text-xl font-semibold text-gray-800">Sign in to your account</h2>
        <p className="mt-1 text-sm text-gray-600">Welcome back! Please enter your details.</p>
      </div>

      {/* Social Login Buttons */}
      <div className="w-full max-w-md mb-6">
        <SocialLoginButtons onSocialLogin={onSocialLogin} />
      </div>
      
      {error && (
        <div className="mb-6 p-4 w-full max-w-md bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          fullWidth
        />

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
          fullWidth
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <a href="#" className="font-medium text-green-600 hover:text-green-500" onClick={handleForgotPasswordClick}>
              Forgot password?
            </a>
          </div>
        </div>

        <Button type="submit" variant="primary" fullWidth isLoading={isLoading}>
          Sign in
        </Button>

        <div className="flex flex-col space-y-4">
          <button
            type="button"
            onClick={handlePhoneLoginClick}
            className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Sign in with phone number
          </button>

          <div className="mt-4 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToSignUp}
              className="font-medium text-green-600 hover:text-green-500"
            >
              Sign up
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SignIn;
