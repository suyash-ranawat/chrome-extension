import { API_BASE_URL } from './config';
import { storeToken, storeUser, User } from './auth';

export type SocialProvider = 'google' | 'facebook' | 'microsoft' | 'apple';

// Initiate social login with a specific provider
export const initiateSocialLogin = async (provider: SocialProvider): Promise<void> => {
  // Create a popup window for the OAuth flow
  const width = 600;
  const height = 600;
  const left = window.screen.width / 2 - width / 2;
  const top = window.screen.height / 2 - height / 2;
  
  // Construct the appropriate endpoint URL based on the provider
  let url = '';
  switch (provider) {
    case 'google':
      url = `${API_BASE_URL}/auth/google`;
      break;
    case 'facebook':
      url = `${API_BASE_URL}/auth/facebook`;
      break;
    case 'microsoft':
      url = `${API_BASE_URL}/auth/microsoft`;
      break;
    case 'apple':
      url = `${API_BASE_URL}/auth/apple`;
      break;
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
  
  // Open the popup
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
      // Verify the origin to prevent security issues
      if (event.origin !== API_BASE_URL || !event.data) return;
      
      try {
        // Handle the auth response
        if (event.data.type === 'AUTH_SUCCESS') {
          console.log('Received AUTH_SUCCESS message from popup', event.data);
          
          // Save the token and user data
          await storeToken(event.data.token);
          await storeUser(event.data.user);
          
          // Close the popup
          if (popup) popup.close();
          
          // Resolve the promise
          resolve();
        } else if (event.data.type === 'AUTH_ERROR') {
          console.error('Received AUTH_ERROR message from popup', event.data);
          
          // Close the popup
          if (popup) popup.close();
          
          // Reject with the error
          reject(new Error(event.data.error || 'Authentication failed'));
        }
      } catch (error) {
        console.error('Error handling auth message:', error);
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
export const requestPhoneOTP = async (phoneNumber: string): Promise<string> => {
  try {
    // Create form data
    const formData = new URLSearchParams();
    formData.append('phone_number', phoneNumber);
    
    // Make API request to send OTP
    const response = await fetch(`${API_BASE_URL}/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });
    
    // Parse response
    const apiResponse = await response.json();
    
    // Check if OTP was sent successfully
    if (apiResponse.success && apiResponse.data && apiResponse.data.session_id) {
      return apiResponse.data.session_id;
    }
    
    // Handle error
    throw new Error(apiResponse.message || 'Failed to send verification code');
  } catch (error) {
    console.error('Request OTP error:', error);
    throw error;
  }
};

// Phone authentication - verify OTP
export const verifyPhoneOTP = async (phoneNumber: string, otp: string, sessionId: string): Promise<{success: boolean, user: User}> => {
  try {
    // Create form data
    const formData = new URLSearchParams();
    formData.append('phone_number', phoneNumber);
    formData.append('otp', otp);
    formData.append('session_id', sessionId);
    
    // Make API request to verify OTP
    const response = await fetch(`${API_BASE_URL}/phone-register-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });
    
    // Parse response
    const apiResponse = await response.json();
    
    // Check if verification was successful
    if (apiResponse.status && apiResponse.data) {
      // Extract user information
      const userData: User = {
        id: apiResponse.data.user_id || '',
        email: apiResponse.data.email || '',
        username: (apiResponse.data.email || '').split('@')[0],
        phoneNumber: phoneNumber,
        createdAt: new Date().toISOString(),
        isPhoneVerified: true
      };
      
      // Extract token
      const token = apiResponse.data.access_token || '';
      
      // Store authentication data
      await storeToken(token);
      await storeUser(userData);
      
      return {
        success: true,
        user: userData
      };
    }
    
    // Handle error
    throw new Error(apiResponse.message || 'Failed to verify code');
  } catch (error) {
    console.error('Verify OTP error:', error);
    throw error;
  }
};