import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/Button';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css'; // Import necessary CSS for phone input
import { Input } from '@/components/ui/Input';
import qs from 'qs';  // Import the qs library for URL encoding

const PhoneAuth: React.FC<{ onCancel: () => void }> = ({ onCancel }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [stepOtp, setStepOtp] = useState(false); // Step 1: Phone number, Step 2: OTP
  const [error, setError] = useState<string | null>(null); // Local error state

  // Step 1: Handle request to send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneNumber) {
      setError('Please enter a valid phone number');
      return;
    }

    setIsLoading(true);
    console.log('Phone number before sending OTP:', phoneNumber);

    try {
      const response = await axios.post(
        'https://api.search.com/send-otp',
        qs.stringify({
          country_code: '91', 
          phone_number: phoneNumber, // Send phone number in x-www-form-urlencoded format
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded', // Explicitly set content type
          },
        }
      );

      console.log('OTP request response:', response);

      // Check if response indicates success
      if (response.data.success === true) {
        console.log('OTP sent successfully');
        setStepOtp(true); // Move to OTP verification step after successful OTP send
      } else {
        setError('Failed to send OTP');
      }
    } catch (error) {
      setError('Failed to request OTP');
      console.error('Error requesting OTP:', error);  // Console log for error
    } finally {
      setIsLoading(false);
    }
};

  // Step 2: Handle OTP verification
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || !phoneNumber) {
      setError('Please enter a valid phone number and OTP');
      return;
    }

    setIsLoading(true);
    console.log('Phone number before OTP verification:', phoneNumber);
    console.log('OTP entered:', otp);

    try {
      const response = await axios.post(
        'https://api.search.com/phone-register-user',
        qs.stringify({
          phone_number: phoneNumber,
          otp: otp,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      console.log('OTP verification response:', response);

      if (response.data.status === 'success') {
        console.log('User registered and logged in');
        // Handle success logic (e.g., storing token, redirecting)
      } else {
        setError('Invalid OTP');
      }
    } catch (error) {
      setError('Error verifying OTP');
      console.error('Error verifying OTP:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-medium mb-4 text-gray-800">
        {stepOtp ? 'Enter verification code' : 'Sign up with phone'}
      </h2>

      {error && (
        <div className="mb-4 p-2 bg-red-50 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {stepOtp ? (
        // OTP Input Form
        <form onSubmit={handleVerifyOTP}>
          <p className="text-sm text-gray-600 mb-4">
            We sent a code to <span className="font-medium">{phoneNumber}</span>
          </p>

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

          <Button type="submit" variant="primary" isLoading={isLoading} fullWidth>
            Verify OTP
          </Button>
        </form>
      ) : (
        // Phone Number Input Form
        <form onSubmit={handleSendOtp}>
          <div className="flex gap-4 mb-4">
            <div className="w-full">
              <PhoneInput
                country={'in'}
                value={phoneNumber}
                onChange={(phone) => setPhoneNumber(phone)}
                inputClass="w-full py-3 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your phone number"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="w-full py-2 rounded-md"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              fullWidth
              className="w-full py-2 rounded-md"
            >
              Send OTP
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default PhoneAuth;
