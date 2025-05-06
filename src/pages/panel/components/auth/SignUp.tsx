import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import SocialLoginButtons from './SocialLoginButtons';
import { SocialProvider } from '@/services/socialAuth';

interface SignUpProps {
  onSignUp: (username: string, email: string, password: string) => Promise<boolean>;
  onSwitchToSignIn: () => void;
  onSocialLogin?: (provider: SocialProvider) => Promise<boolean>;
  onPhoneLogin?: () => void;
  error?: string | null;
}

const SignUp: React.FC<SignUpProps> = ({ 
  onSignUp, 
  onSwitchToSignIn, 
  onSocialLogin,
  onPhoneLogin,
  error
}) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Local validation
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setValidationError('Password must be at least 8 characters long');
      return;
    }

    if (!agreedToTerms) {
      setValidationError('You must agree to the Terms of Service and Privacy Policy');
      return;
    }

    // Clear validation error
    setValidationError(null);
    setIsLoading(true);

    try {
      await onSignUp(username, email, password);
      // Success and error handling are managed by the parent component
    } finally {
      setIsLoading(false);
    }
  };

  // Handle social login
  const handleSocialLoginClick = async (provider: SocialProvider) => {
    setIsLoading(true);
    try {
      if (onSocialLogin) {
        await onSocialLogin(provider);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle phone login
  const handlePhoneLoginClick = () => {
    if (onPhoneLogin) {
      onPhoneLogin();
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-6 h-full w-full">
        <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-green-500 animate-spin mb-4"></div>
        <p className="text-gray-600">Creating your account...</p>
      </div>
    );
  }

  // The error to display - either from parent or local validation
  const displayError = error || validationError;

  return (
    <div className="flex flex-col items-center p-6">
      <div className="mb-6 text-center">
        <div className="h-12 w-12 mx-auto bg-green-500 rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="white" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </div>
        <h2 className="mt-2 text-xl font-semibold text-gray-800">Create an account</h2>
        <p className="mt-1 text-sm text-gray-600">Sign up to get started with Search.com</p>
      </div>

      {displayError && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md w-full max-w-md text-sm">
          {displayError}
        </div>
      )}

      {/* Social Login Buttons */}
      <div className="w-full max-w-md mb-6">
        <SocialLoginButtons
          onSocialLogin={handleSocialLoginClick}
        />
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <Input
          label="Username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Choose a username"
          required
          fullWidth
        />

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
          placeholder="Create a password"
          required
          fullWidth
        />

        <Input
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm your password"
          required
          fullWidth
        />

        <div className="flex items-center">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            required
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
          />
          <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
            I agree to the{' '}
            <a href="#" className="text-green-600 hover:text-green-500">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-green-600 hover:text-green-500">
              Privacy Policy
            </a>
          </label>
        </div>

        <Button type="submit" variant="primary" fullWidth isLoading={isLoading}>
          Sign up
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
            Sign up with phone number
          </button>

          <div className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToSignIn}
              className="font-medium text-green-600 hover:text-green-500"
            >
              Sign in
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SignUp;