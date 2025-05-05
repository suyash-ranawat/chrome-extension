import React, { useState } from 'react';
import { requestPhoneOTP, verifyPhoneOTP } from '@/services/socialAuth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface PhoneAuthProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const PhoneAuth: React.FC<PhoneAuthProps> = ({ onSuccess, onCancel }) => {
  // ... previous part of the component ...

  // Phone number input step
  if (!stepOtp) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium mb-4 text-gray-800">Sign in with phone</h2>
        
        {error && (
          <div className="mb-4 p-2 bg-red-50 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleRequestOTP}>
          <div className="mb-4">
            <Input
              label="Phone Number"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1 (123) 456-7890"
              required
              fullWidth
            />
            <p className="mt-1 text-xs text-gray-500">
              We'll send a verification code to this number
            </p>
          </div>
          
          <div className="flex gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              fullWidth
            >
              Send Code
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // OTP verification step
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-medium mb-4 text-gray-800">Enter verification code</h2>
      
      {error && (
        <div className="mb-4 p-2 bg-red-50 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <p className="text-sm text-gray-600 mb-4">
        We sent a code to <span className="font-medium">{phoneNumber}</span>
      </p>
      
      <form onSubmit={handleVerifyOTP}>
        <div className="mb-4">
          <Input
            label="Verification Code"
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter code"
            required
            fullWidth
          />
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <button
            type="button"
            className="text-sm text-green-600 hover:text-green-700"
            onClick={() => setStepOtp(false)}
          >
            Change phone number
          </button>
          
          <button
            type="button"
            className={`text-sm ${countdown > 0 ? 'text-gray-400' : 'text-green-600 hover:text-green-700'}`}
            disabled={countdown > 0}
            onClick={countdown > 0 ? undefined : handleRequestOTP}
          >
            {countdown > 0 ? `Resend in ${countdown}s` : 'Resend code'}
          </button>
        </div>
        
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          fullWidth
        >
          Verify
        </Button>
      </form>
    </div>
  );
};

export default PhoneAuth;