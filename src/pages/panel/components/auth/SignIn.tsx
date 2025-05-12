import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import SocialLoginButtons from './SocialLoginButtons';
import ForgotPassword from './ForgotPassword'; // Import the ForgotPassword component
import { SocialProvider } from '@/services/socialAuth';

interface SignInProps {
  onSignIn: (email: string, password: string) => Promise<boolean>;
  onSwitchToSignUp: () => void;
  onSocialLogin?: (provider: SocialProvider) => Promise<boolean>;
  onPhoneLogin?: () => void;
  error?: string | null;
}

const SignIn: React.FC<SignInProps> = ({ 
  onSignIn, 
  onSwitchToSignUp,
  onSocialLogin,
  onPhoneLogin,
  error 
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false); // New state for showing forgot password

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await onSignIn(email, password);
      // No need to handle errors here - parent component does that
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

  // Handle forgot password click
  const handleForgotPasswordClick = () => {
    setShowForgotPassword(true); // Show ForgotPassword component
  };

  // Handle back to sign-in
  const handleBackToSignIn = () => {
    setShowForgotPassword(false); // Hide ForgotPassword component
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

  // If Forgot Password is being shown, render that component
  if (showForgotPassword) {
    return <ForgotPassword onResetPassword={onSignIn} onBackToSignIn={handleBackToSignIn} />;
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
        <SocialLoginButtons
          onSocialLogin={handleSocialLoginClick}
        />
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
            <a 
              href="#"
              className="font-medium text-green-600 hover:text-green-500"
              onClick={handleForgotPasswordClick} // Open Forgot Password
            >
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























// import React, { useState } from 'react';
// import { Input } from '@/components/ui/Input';
// import { Button } from '@/components/ui/Button';
// import SocialLoginButtons from './SocialLoginButtons';
// import { SocialProvider } from '@/services/socialAuth';

// interface SignInProps {
//   onSignIn: (email: string, password: string) => Promise<boolean>;
//   onSwitchToSignUp: () => void;
//   onSocialLogin?: (provider: SocialProvider) => Promise<boolean>;
//   onPhoneLogin?: () => void;
//   error?: string | null;
// }

// const SignIn: React.FC<SignInProps> = ({ 
//   onSignIn, 
//   onSwitchToSignUp,
//   onSocialLogin,
//   onPhoneLogin,
//   error 
// }) => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [rememberMe, setRememberMe] = useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);

//     try {
//       await onSignIn(email, password);
//       // No need to handle errors here - parent component does that
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Handle social login
//   const handleSocialLoginClick = async (provider: SocialProvider) => {
//     setIsLoading(true);
//     try {
//       if (onSocialLogin) {
//         await onSocialLogin(provider);
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Handle phone login
//   const handlePhoneLoginClick = () => {
//     if (onPhoneLogin) {
//       onPhoneLogin();
//     }
//   };

//   // Loading state
//   if (isLoading) {
//     return (
//       <div className="flex flex-col items-center justify-center p-6 h-full w-full">
//         <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-green-500 animate-spin mb-4"></div>
//         <p className="text-gray-600">Signing in...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col items-center p-6">
//       <div className="mb-6 text-center">
//         <div className="h-12 w-12 mx-auto bg-green-500 rounded-full flex items-center justify-center">
//           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="white" className="w-6 h-6">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
//           </svg>
//         </div>
//         <h2 className="mt-2 text-xl font-semibold text-gray-800">Sign in to your account</h2>
//         <p className="mt-1 text-sm text-gray-600">Welcome back! Please enter your details.</p>
//       </div>

//       {/* Social Login Buttons */}
//       <div className="w-full max-w-md mb-6">
//         <SocialLoginButtons
//           onSocialLogin={handleSocialLoginClick}
//         />
//       </div>
      
//       {error && (
//         <div className="mb-6 p-4 w-full max-w-md bg-red-50 border border-red-200 rounded-md">
//           <div className="flex">
//             <div className="flex-shrink-0">
//               <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
//                 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
//               </svg>
//             </div>
//             <div className="ml-3">
//               <p className="text-sm font-medium text-red-800">{error}</p>
//             </div>
//           </div>
//         </div>
//       )}

//       <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
//         <Input
//           label="Email"
//           type="email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           placeholder="Enter your email"
//           required
//           fullWidth
//         />

//         <Input
//           label="Password"
//           type="password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           placeholder="Enter your password"
//           required
//           fullWidth
//         />

//         <div className="flex items-center justify-between">
//           <div className="flex items-center">
//             <input
//               id="remember-me"
//               name="remember-me"
//               type="checkbox"
//               className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
//               checked={rememberMe}
//               onChange={(e) => setRememberMe(e.target.checked)}
//             />
//             <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
//               Remember me
//             </label>
//           </div>

//           <div className="text-sm">
//             <a href="#" className="font-medium text-green-600 hover:text-green-500">
//               Forgot password?
//             </a>
//           </div>
//         </div>

//         <Button type="submit" variant="primary" fullWidth isLoading={isLoading}>
//           Sign in
//         </Button>

//         <div className="flex flex-col space-y-4">
//           <button
//             type="button"
//             onClick={handlePhoneLoginClick}
//             className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
//           >
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
//             </svg>
//             Sign in with phone number
//           </button>

//           <div className="mt-4 text-center text-sm text-gray-600">
//             Don't have an account?{' '}
//             <button
//               type="button"
//               onClick={onSwitchToSignUp}
//               className="font-medium text-green-600 hover:text-green-500"
//             >
//               Sign up
//             </button>
//           </div>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default SignIn;