import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import axios from 'axios';  // Import axios for making API requests

interface ForgotPasswordProps {
  onResetPassword: (email: string) => Promise<void>;
  onBackToSignIn: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onResetPassword, onBackToSignIn }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setError(null);
  setSuccessMessage(null);

  try {
    // Send the email to the backend to trigger password reset
    const response = await axios.post('https://api.search.com/forgot-password', { email });

    console.log('API Response:', response);

    // Check if the response has a success or error message
    if (response.data.status === false) {
      // Display error message from the backend (email not found)
      setError(response.data.message);
    } else if (response.data.status === true && response.data.message) {
      // Success case: display success message
      setSuccessMessage(response.data.message);
    }
  } catch (err) {
    // Handle unexpected errors (e.g., network issues)
    setError('Error sending password reset link. Please try again.');
  } finally {
    setIsLoading(false);  // Reset loading state
  }
};


  return (
    <div className="flex flex-col items-center p-6">
      {successMessage ? (
        <div className="text-center">
          <div className="mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-12 h-12 text-green-500">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Check Your Email</h2>
          <p className="text-sm text-gray-600 mb-4">{successMessage}</p>
          <Button onClick={onBackToSignIn} variant="outline" fullWidth>
            Back to Login
          </Button>
        </div>
      ) : (
        <>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Forgot Password</h2>
          <p className="text-sm text-gray-600 mb-4">Enter your email address to receive a password reset link.</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>
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

            <Button type="submit" variant="primary" fullWidth isLoading={isLoading}>
              Reset Password
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-600">
            <button
              type="button"
              onClick={onBackToSignIn}
              className="font-medium text-green-600 hover:text-green-500"
            >
              ← Back to Sign In
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ForgotPassword;
