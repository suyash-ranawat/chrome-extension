import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import SocialLoginButtons from './SocialLoginButtons';
import PhoneAuth from './PhoneAuth';
import { SocialProvider } from '@/services/socialAuth';

interface SignInProps {
  onSignIn: (email: string, password: string) => Promise<boolean>;
  onSwitchToSignUp: () => void;
  onSocialLogin?: (provider: SocialProvider) => Promise<boolean>;
  onPhoneLogin?: () => void;
}

const SignIn: React.FC<SignInProps> = ({ 
  onSignIn, 
  onSwitchToSignUp,
  onSocialLogin,
  onPhoneLogin 
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPhoneAuth, setShowPhoneAuth] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const success = await onSignIn(email, password);
      if (!success) {
        setError('Sign in failed. Please check your credentials and try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during sign in');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle social login
  const handleSocialLoginStart = () => {
    setIsLoading(true);
    setError(null);
  };

  const handleSocialLoginSuccess = () => {
    setIsLoading(false);
    // The main auth flow will handle the redirect after successful login
  };

  const handleSocialLoginError = (error: Error) => {
    setIsLoading(false);
    setError(error.message);
  };

  // Handle phone login
  const handlePhoneLoginClick = () => {
    if (onPhoneLogin) {
      onPhoneLogin();
    } else {
      setShowPhoneAuth(true);
    }
  };

  // Show phone authentication UI
  if (showPhoneAuth) {
    return (
      <PhoneAuth
        onSuccess={() => {
          // The auth wrapper will handle the redirect
        }}
        onCancel={() => setShowPhoneAuth(false)}
      />
    );
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

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md w-full max-w-md text-sm">
          {error}
        </div>
      )}

      {/* Social Login Buttons */}
      <div className="w-full max-w-md mb-6">
        <SocialLoginButtons
          onLoginStart={handleSocialLoginStart}
          onLoginSuccess={handleSocialLoginSuccess}
          onLoginError={handleSocialLoginError}
          onSocialLogin={onSocialLogin}
        />
      </div>

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
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <a href="#" className="font-medium text-green-600 hover:text-green-500">
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
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
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