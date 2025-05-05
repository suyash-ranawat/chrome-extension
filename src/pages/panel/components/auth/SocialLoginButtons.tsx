import React from 'react';
import { SocialProvider, initiateSocialLogin } from '@/services/socialAuth';

interface SocialLoginButtonsProps {
  onLoginStart: () => void;
  onLoginSuccess: () => void;
  onLoginError: (error: Error) => void;
  onSocialLogin?: (provider: SocialProvider) => Promise<boolean>;
}

const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({
  onLoginStart,
  onLoginSuccess,
  onLoginError,
  onSocialLogin
}) => {
  const handleSocialLogin = async (provider: SocialProvider) => {
    onLoginStart();
    try {
      if (onSocialLogin) {
        // Use the parent component's social login handler
        const success = await onSocialLogin(provider);
        if (success) {
          onLoginSuccess();
        }
      } else {
        // Use the default social login method
        await initiateSocialLogin(provider);
        onLoginSuccess();
      }
    } catch (error) {
      onLoginError(error instanceof Error ? error : new Error('Login failed'));
    }
  };

  return (
    <div className="space-y-3">
      {/* Google */}
      <button
        type="button"
        className="w-full flex items-center justify-center gap-3 py-2 px-4 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        onClick={() => handleSocialLogin('google')}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 48 48"
        >
          <path
            fill="#FFC107"
            d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
          />
          <path
            fill="#FF3D00"
            d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
          />
          <path
            fill="#4CAF50"
            d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
          />
          <path
            fill="#1976D2"
            d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
          />
        </svg>
        <span>Continue with Google</span>
      </button>

      {/* Facebook */}
      <button
        type="button"
        className="w-full flex items-center justify-center gap-3 py-2 px-4 bg-[#1877F2] border border-[#1877F2] rounded-md shadow-sm text-sm font-medium text-white hover:bg-[#166FE5] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1877F2]"
        onClick={() => handleSocialLogin('facebook')}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="white"
        >
          <path d="M9.19795 21.5H13.198V13.4901H16.8021L17.198 9.50977H13.198V7.5C13.198 6.94772 13.6457 6.5 14.198 6.5H17.198V2.5H14.198C11.4365 2.5 9.19795 4.73858 9.19795 7.5V9.50977H7.19795L6.80206 13.4901H9.19795V21.5Z" />
        </svg>
        <span>Continue with Facebook</span>
      </button>

      {/* Microsoft */}
      <button
        type="button"
        className="w-full flex items-center justify-center gap-3 py-2 px-4 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0078d7]"
        onClick={() => handleSocialLogin('microsoft')}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 23 23"
        >
          <path fill="#f3f3f3" d="M0 0h23v23H0z" />
          <path fill="#f35325" d="M1 1h10v10H1z" />
          <path fill="#81bc06" d="M12 1h10v10H12z" />
          <path fill="#05a6f0" d="M1 12h10v10H1z" />
          <path fill="#ffba08" d="M12 12h10v10H12z" />
        </svg>
        <span>Continue with Microsoft</span>
      </button>

      {/* Apple */}
      <button
        type="button"
        className="w-full flex items-center justify-center gap-3 py-2 px-4 bg-black border border-black rounded-md shadow-sm text-sm font-medium text-white hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
        onClick={() => handleSocialLogin('apple')}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="white"
        >
          <path d="M17.543 11.29c-.019-2.168 1.77-3.216 1.852-3.266-1.01-1.482-2.583-1.683-3.143-1.707-1.335-.142-2.606.79-3.283.79-.679 0-1.726-.772-2.837-.752-1.456.024-2.802.848-3.55 2.16-1.517 2.64-.388 6.548 1.087 8.692.725 1.048 1.588 2.22 2.721 2.18 1.09-.044 1.505-.706 2.822-.706 1.320 0 1.695.706 2.847.683 1.177-.02 1.924-1.07 2.642-2.123.834-1.214 1.177-2.395 1.196-2.455-.026-.012-2.295-.885-2.317-3.51zM15.62 5.82c.6-.73 1.005-1.742.894-2.754-.864.036-1.909.578-2.527 1.304-.554.645-1.038 1.675-.908 2.665.963.075 1.945-.494 2.54-1.214z" />
        </svg>
        <span>Continue with Apple</span>
      </button>

      {/* Or divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or</span>
        </div>
      </div>
    </div>
  );
};

export default SocialLoginButtons;