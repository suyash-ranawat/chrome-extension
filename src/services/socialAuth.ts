import { API_BASE_URL } from './config';
import { storeToken, storeUser } from './auth';

export type SocialProvider = 'google' | 'facebook' | 'microsoft' | 'apple';

// Initiate social login with a specific provider
export const initiateSocialLogin = async (provider: SocialProvider): Promise<void> => {
  // Create a popup window for the OAuth flow
  const width = 600;
  const height = 600;
  const left = window.screen.width / 2 - width / 2;
  const top = window.screen.height / 2 - height / 2;
  
  const url = `${API_BASE_URL}/auth/${provider}`;
  
  const popup = window.open(
    url,
    `${provider}Auth`,
    `width=${width},height=${height},left=${left},top=${top}`
  );
  
  if (!popup) {
    throw new Error('Could not open popup window. Please check your popup blocker settings.');
  }
  
  return new Promise((resolve, reject) => {
    // Listen for messages from the popup
    const messageListener = async (event: MessageEvent) => {
      if (event.origin !== API_BASE_URL || !event.data) return;
      
      try {
        // Handle the auth response
        if (event.data.type === 'AUTH_SUCCESS') {
          // Save the token and user data
          await storeToken(event.data.token);
          await storeUser(event.data.user);
          
          // Close the popup
          if (popup) popup.close();
          
          // Resolve the promise
          resolve();
        } else if (event.data.type === 'AUTH_ERROR') {
          throw new Error(event.data.error || 'Authentication failed');
        }
      } catch (error) {
        reject(error);
      } finally {
        // Remove the event listener
        window.removeEventListener('message', messageListener);
      }
    };
    
    // Add message listener
    window.addEventListener('message', messageListener);
    
    // Add timeout to handle cases where the popup is closed without completing auth
    const checkClosed = setInterval(() => {
      if (popup && popup.closed) {
        clearInterval(checkClosed);
        window.removeEventListener('message', messageListener);
        reject(new Error('Authentication window was closed'));
      }
    }, 500);
  });
};

// Phone authentication - request OTP
export const requestPhoneOTP = async (phoneNumber: string): Promise<{ success: boolean, sessionId?: string }> => {
  const response = await fetch(`${API_BASE_URL}/auth/phone/request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ phoneNumber }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to send OTP');
  }
  
  return await response.json();
};

// Phone authentication - verify OTP
export const verifyPhoneOTP = async (phoneNumber: string, otp: string, sessionId: string): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/auth/phone/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ phoneNumber, otp, sessionId }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to verify OTP');
  }
  
  const data = await response.json();
  await storeToken(data.token);
  await storeUser(data.user);
  
  return data;
};