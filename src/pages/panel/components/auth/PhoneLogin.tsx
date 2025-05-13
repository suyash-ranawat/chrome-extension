import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import PhoneInput from 'react-phone-input-2';  // Import the PhoneInput component from the library
import 'react-phone-input-2/lib/style.css';   // Import the default styles for the phone input
import axios from 'axios';  // Import Axios

interface PhoneLoginProps {
  onBackToSignIn: () => void;  // Callback function passed as a prop to navigate back to the sign-in page
}

const PhoneLogin: React.FC<PhoneLoginProps> = ({ onBackToSignIn }) => {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Define the function to handle login using phone number and password
    const onPhoneSignIn = async (phone: string, password: string) => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await axios.post('https://api.search.com/signin', {
                phone: phone,
                password: password,
            });

            // Check if login was successful based on response content
            if (response.data && response.data.success) {
                console.log('Login successful:', response.data);
                localStorage.setItem('token', response.data.token);
            } else {
                const errorMsg = response.data?.message || 'Invalid phone or password.';
                setError(errorMsg);
                console.error('Login failed:', errorMsg);
            }
        } catch (error: any) {
            console.error('Error during login:', error);
            setError(error.response?.data?.message || 'Failed to sign in with phone number.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onPhoneSignIn(phone, password);
    };

    return (
        <div className="flex flex-col items-center p-6 w-full h-full">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Welcome back</h2>

            {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>}

            <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
                {/* Phone number input with country code */}
                <div className="w-full mb-4">
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <div className="w-full">
                        <PhoneInput
                            country="in"
                            value={phone}
                            onChange={setPhone}
                            inputClass="form-phone w-full py-2 px-3 border border-gray-300 rounded-md"
                            placeholder="Enter your phone number"
                            required
                        />
                    </div>
                </div>

                {/* Password input */}
                <div className="w-full mb-4">
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full py-2 px-3 border border-gray-300 rounded-md"
                        placeholder="Enter your password"
                        required
                    />
                </div>

                <div className="w-full">
                    <Button type="submit" variant="primary" fullWidth isLoading={isLoading} className="w-full py-2 px-3">
                        Continue
                    </Button>
                </div>
            </form>

            <div className="mt-4 text-center text-sm text-gray-600">
                <button
                    type="button"
                    onClick={onBackToSignIn}  // Call the onBackToSignIn function passed from parent
                    className="font-medium text-green-600 hover:text-green-500"
                >
                    ← Back to Sign In
                </button>
            </div>
        </div>
    );
};

export default PhoneLogin;
