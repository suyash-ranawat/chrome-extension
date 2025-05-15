import { API_BASE_URL, GOOGLE_CLIENT_ID, FACEBOOK_APP_ID, MICROSOFT_CLIENT_ID, APPLE_SERVICE_ID, DEV_FLAG } from './config';
import { storeToken, storeUser, User, storeRefreshToken } from './auth';
import { setAuthState } from '@/store/authStore';

export type SocialProvider = 'google' | 'facebook' | 'microsoft' | 'apple';

/**
 * Function to handle social logins by making direct API calls to the backend
 * This approach uses the API endpoints directly rather than going through SDKs
 */
export const initiateSocialLogin = async (provider: SocialProvider): Promise<void> => {
  try {
    console.log(`Initiating ${provider} login...`);
    
    // Use dummy data for testing if DEV_FLAG is '1'
    if (DEV_FLAG === '1') {
      switch (provider) {
        case 'google':
          return await handleDummyGoogleAuth();
        case 'facebook':
          return await handleDummyFacebookAuth();
        case 'microsoft':
          return await handleDummyMicrosoftAuth();
        case 'apple':
          return await handleDummyAppleAuth();
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }
    }
    
    // Normal OAuth flow if DEV_FLAG is not '1'
    switch (provider) {
      case 'google':
        return await handleGoogleAuth();
      case 'facebook':
        return await handleFacebookAuth();
      case 'microsoft':
        return await handleMicrosoftAuth();
      case 'apple':
        return await handleAppleAuth();
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  } catch (error) {
    console.error(`${provider} login failed:`, error);
    throw error;
  }
};

// Dummy Data for Testing
const DUMMY_GOOGLE_USER = {
  full_name: 'Dummy Google User',
  username: 'dummygoogleuser@example.com',
  email: 'dummygoogleuser@example.com',
  google_id: 'google-dummy-id-12345',
  image_url: 'https://www.example.com/dummy-google-avatar.jpg',
  task: 'signin'
};

const DUMMY_FACEBOOK_USER = {
  full_name: 'Dummy Facebook User',
  username: 'dummyfacebookuser@example.com',
  email: 'dummyfacebookuser@example.com',
  fb_id: 'facebook-dummy-id-67890',
  image_url: 'https://www.example.com/dummy-facebook-avatar.jpg',
  task: 'signin'
};

const DUMMY_MICROSOFT_USER = {
  full_name: 'Dummy Microsoft User',
  username: 'dummymicrosoftuser@example.com',
  email: 'dummymicrosoftuser@example.com',
  ms_id: 'microsoft-dummy-id-11223',
  image_url: 'https://www.example.com/dummy-microsoft-avatar.jpg',
  task: 'signin'
};

const DUMMY_APPLE_USER = {
  full_name: 'Dummy Apple User',
  username: 'dummyappleuser@example.com',
  email: 'dummyappleuser@example.com',
  app_id: 'apple-dummy-id-44556',
  image_url: 'https://www.example.com/dummy-apple-avatar.jpg',
  task: 'signin'
};

// Handle Dummy Google Authentication
const handleDummyGoogleAuth = async (): Promise<void> => {
  const userData = DUMMY_GOOGLE_USER;
  console.log("Dummy Google Auth successful:", userData);
  await registerSocialUser(userData);
};

// Handle Dummy Facebook Authentication
const handleDummyFacebookAuth = async (): Promise<void> => {
  const userData = DUMMY_FACEBOOK_USER;
  console.log("Dummy Facebook Auth successful:", userData);
  await registerSocialUser(userData);
};

// Handle Dummy Microsoft Authentication
const handleDummyMicrosoftAuth = async (): Promise<void> => {
  const userData = DUMMY_MICROSOFT_USER;
  console.log("Dummy Microsoft Auth successful:", userData);
  await registerSocialUser(userData);
};

// Handle Dummy Apple Authentication
const handleDummyAppleAuth = async (): Promise<void> => {
  const userData = DUMMY_APPLE_USER;
  console.log("Dummy Apple Auth successful:", userData);
  await registerSocialUser(userData);
};

/**
 * Handle Google Authentication using Chrome's identity API
 */
const handleGoogleAuth = async (): Promise<void> => {
  // Use Chrome identity API for authentication
  return new Promise<void>((resolve, reject) => {
    // Define the authentication details
    const manifest = chrome.runtime.getManifest();
    const clientId = manifest.oauth2?.client_id || '';
    console.log(chrome.identity.getRedirectURL("google"));
    if (!clientId) {
      return reject(new Error("Google OAuth client ID is not configured in manifest"));
    }
    
    // Set up authentication parameters
    const authParams = new URLSearchParams({
      'client_id': clientId,
      'response_type': 'token',
      'redirect_uri': chrome.identity.getRedirectURL("google"),
      'scope': 'email profile'
    });
    
    const authUrl = `https://accounts.google.com/o/oauth2/auth?${authParams.toString()}`;
    
    // Launch the web auth flow
    chrome.identity.launchWebAuthFlow(
      {
        url: authUrl,
        interactive: true
      },
      async (redirectUrl) => {
        // Handle errors from identity API
        if (chrome.runtime.lastError) {
          console.error('Chrome identity error:', chrome.runtime.lastError);
          return reject(new Error(chrome.runtime.lastError.message || "Authentication failed"));
        }
        
        if (!redirectUrl) {
          return reject(new Error("No redirect URL returned from authentication"));
        }
        
        try {
          // Extract access token from the redirect URL
          const url = new URL(redirectUrl);
          const fragmentParams = new URLSearchParams(url.hash.substring(1));
          const accessToken = fragmentParams.get('access_token');
          
          if (!accessToken) {
            return reject(new Error("No access token found in the response"));
          }
          
          // Get user info from Google using the access token
          const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          });
          
          if (!userInfoResponse.ok) {
            throw new Error(`Failed to get user info: ${userInfoResponse.status}`);
          }
          
          const userInfo = await userInfoResponse.json();
          
          // Prepare user data for API
          const userData = {
            full_name: userInfo.name,
            username: userInfo.email,
            email: userInfo.email,
            google_id: userInfo.sub,
            image_url: userInfo.picture,
            task: 'signin'
          };
          
          // Register the user with our backend
          await registerSocialUser(userData);
          resolve();
        } catch (error) {
          console.error('Error during Google authentication:', error);
          reject(error);
        }
      }
    );
  });
};

/**
 * Handle Facebook Authentication
 */
const handleFacebookAuth = async (): Promise<void> => {
  // For Chrome extensions, we need to use Chrome's identity API
  return new Promise<void>((resolve, reject) => {
    const redirectURL = chrome.identity.getRedirectURL("facebook");
    const appId = `${FACEBOOK_APP_ID}`; // Replace with your actual Facebook App ID
    console.log(redirectURL);
    const authParams = new URLSearchParams({
      'client_id': appId,
      'response_type': 'token',
      'redirect_uri': redirectURL,
      'scope': 'email,public_profile'
    });
    
    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?${authParams.toString()}`;
    
    chrome.identity.launchWebAuthFlow(
      {
        url: authUrl,
        interactive: true
      },
      async (redirectUrl) => {
        if (chrome.runtime.lastError) {
          return reject(new Error(chrome.runtime.lastError.message || "Facebook authentication failed"));
        }
        
        if (!redirectUrl) {
          return reject(new Error("No redirect URL returned from Facebook authentication"));
        }
        
        try {
          // Extract access token from the redirect URL
          const url = new URL(redirectUrl);
          const fragmentParams = new URLSearchParams(url.hash.substring(1));
          const accessToken = fragmentParams.get('access_token');
          
          if (!accessToken) {
            return reject(new Error("No access token found in Facebook response"));
          }
          
          // Get user info from Facebook using the access token
          const userInfoResponse = await fetch(`https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`);
          
          if (!userInfoResponse.ok) {
            throw new Error(`Failed to get user info from Facebook: ${userInfoResponse.status}`);
          }
          
          const userInfo = await userInfoResponse.json();
          
          // Prepare user data for API
          const userData = {
            full_name: userInfo.name,
            username: userInfo.email,
            email: userInfo.email,
            fb_id: userInfo.id,
            image_url: userInfo.picture?.data?.url || '',
            task: 'signin'
          };
          
          // Register the user with our backend
          await registerSocialUser(userData);
          resolve();
        } catch (error) {
          console.error('Error during Facebook authentication:', error);
          reject(error);
        }
      }
    );
  });
};

/**
 * Handle Microsoft Authentication
 */
const handleMicrosoftAuth = async (): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    const redirectURL = chrome.identity.getRedirectURL("microsoft");
    const clientId = `${MICROSOFT_CLIENT_ID}`; // Replace with your actual Microsoft Client ID
    console.log(redirectURL);
    const authParams = new URLSearchParams({
      'client_id': clientId,
      'response_type': 'token',
      'redirect_uri': redirectURL,
      'scope': 'user.read openid profile email'
    });
    
    const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${authParams.toString()}`;
    
    chrome.identity.launchWebAuthFlow(
      {
        url: authUrl,
        interactive: true
      },
      async (redirectUrl) => {
        if (chrome.runtime.lastError) {
          return reject(new Error(chrome.runtime.lastError.message || "Microsoft authentication failed"));
        }
        
        if (!redirectUrl) {
          return reject(new Error("No redirect URL returned from Microsoft authentication"));
        }
        
        try {
          // Extract access token from the redirect URL
          const url = new URL(redirectUrl);
          const fragmentParams = new URLSearchParams(url.hash.substring(1));
          const accessToken = fragmentParams.get('access_token');
          
          if (!accessToken) {
            return reject(new Error("No access token found in Microsoft response"));
          }
          
          // Get user info from Microsoft Graph API
          const userInfoResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          });
          
          if (!userInfoResponse.ok) {
            throw new Error(`Failed to get user info from Microsoft: ${userInfoResponse.status}`);
          }
          
          const userInfo = await userInfoResponse.json();
          
          // Prepare user data for API
          const userData = {
            full_name: userInfo.displayName,
            username: userInfo.userPrincipalName || userInfo.mail,
            email: userInfo.mail || userInfo.userPrincipalName,
            ms_id: userInfo.id,
            task: 'signin'
          };
          
          // Register the user with our backend
          await registerSocialUser(userData);
          resolve();
        } catch (error) {
          console.error('Error during Microsoft authentication:', error);
          reject(error);
        }
      }
    );
  });
};

/**
 * Handle Apple Authentication
 */
/**
 * Handle Apple Authentication
 */
const handleAppleAuth = async (): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    const redirectURL = chrome.identity.getRedirectURL("apple");
    const clientId = `${APPLE_SERVICE_ID}`; // Your Apple Service ID
    console.log(redirectURL);
    
    // Updated parameters for Apple Sign In
    const authParams = new URLSearchParams({
      'client_id': clientId,
      'redirect_uri': redirectURL,
      'response_type': 'code id_token',
      'scope': 'name email',
      'response_mode': 'form_post', // Changed from 'fragment' to 'form_post'
    });
    
    const authUrl = `https://appleid.apple.com/auth/authorize?${authParams.toString()}`;
    
    chrome.identity.launchWebAuthFlow(
      {
        url: authUrl,
        interactive: true
      },
      async (redirectUrl) => {
        if (chrome.runtime.lastError) {
          return reject(new Error(chrome.runtime.lastError.message || "Apple authentication failed"));
        }
        
        if (!redirectUrl) {
          return reject(new Error("No redirect URL returned from Apple authentication"));
        }
        
        try {
          // Since we're using form_post, the tokens will be sent as POST parameters
          // The redirect URL will be used by Apple to send the POST request
          // We need to process this differently
          
          // For Chrome extensions, we may need to use a background script or event page
          // to intercept the POST request and extract the tokens
          
          // This is a simplified approach that assumes you can extract the id_token from the URL
          // In practice, you'll need a more robust solution
          
          // Extract code and id_token from the redirect URL
          const url = new URL(redirectUrl);
          const searchParams = new URLSearchParams(url.search);
          const code = searchParams.get('code');
          const idToken = searchParams.get('id_token');
          
          if (!idToken && !code) {
            // Since form_post sends data via POST, we might not have the token in the URL
            // You'll need a proper endpoint to receive this POST
            return reject(new Error("Invalid response from Apple. Please ensure your redirect URL is properly set up to handle form_post."));
          }
          
          let userData;
          if (idToken) {
            // If we have an ID token, parse it
            userData = parseJwt(idToken);
          } else {
            // Otherwise, we need to exchange the code for tokens
            // This requires a server endpoint
            return reject(new Error("Code-only flow requires a server endpoint to exchange for tokens."));
          }
          
          if (!userData) {
            return reject(new Error('Failed to parse Apple ID token'));
          }
          
          // Prepare data for API
          const postData: Record<string, any> = {
            email: userData.email,
            app_id: userData.sub,
            task: 'signin'
          };
          
          // Add full name if available in the user object
          if (userData.name) {
            postData.full_name = `${userData.name.firstName} ${userData.name.lastName}`;
          }
          
          // Register the user with your backend
          await registerSocialUser(postData);
          resolve();
        } catch (error) {
          console.error('Error during Apple authentication:', error);
          reject(error);
        }
      }
    );
  });
};

/**
 * Parse JWT token (used by Google and Apple authentication)
 */
const parseJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Error parsing JWT token:', e);
    return null;
  }
};

/**
 * Register user with social login data
 * This function sends the collected user data to your API endpoint
 */
const registerSocialUser = async (data: Record<string, any>): Promise<void> => {
  try {
    console.log('Registering with social data:', data);
    
    // Add UTM parameters if available
    const utmParams = getUTMParams();
    const postData = { ...data, ...utmParams };
    
    // Make API call to register user
    const response = await fetch(`${API_BASE_URL}/app/social_register_user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(postData).toString()
    });
    
    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse response as JSON:', responseText);
      throw new Error('Invalid response format');
    }
    
    if (responseData.success) {
      console.log('Social login successful:', responseData);
      
      // Extract token and refresh token
      const accessToken = responseData.data?.access_token;
      const refreshToken = responseData.data?.refresh_token;
      
      // Check if we have the required authentication data
      if (!accessToken) {
        throw new Error('Access token missing from response');
      }
      
      // Create user object from response data
      const userData: User = {
        id: responseData.data.user_id || '',
        email: responseData.data.email || '',
        username: responseData.data.email ? responseData.data.email.split('@')[0] : '',
        createdAt: new Date().toISOString(),
        phoneNumber: responseData.data.phone_number || undefined,
        isEmailVerified: true, // Since they authenticated through a social provider
        isPhoneVerified: !!responseData.data.phone_number,
        // Store which social provider was used if available
        socialProviders: data.google_id ? ['google'] : 
                         data.fb_id ? ['facebook'] : 
                         data.ms_id ? ['microsoft'] : 
                         data.app_id ? ['apple'] : undefined
      };
      
      // Store authentication data
      await storeToken(accessToken);
      if (refreshToken) {
        await storeRefreshToken(refreshToken);
      }
      await storeUser(userData);
      
      // Update global auth state
      setAuthState(userData, true);
      
      // Notify background script about auth state change
      try {
        await chrome.runtime.sendMessage({ 
          type: 'AUTH_STATE_CHANGED', 
          isAuthenticated: true 
        });
      } catch (error) {
        // Silent failure in production
        if (process.env.NODE_ENV !== 'production') {
          console.error('Failed to notify background script:', error);
        }
      }
      
      return Promise.resolve();
    } else {
      console.error('Social registration failed:', responseData.message);
      return Promise.reject(new Error(responseData.message || 'Registration failed'));
    }
  } catch (error) {
    console.error('Social registration error:', error);
    return Promise.reject(error);
  }
};

/**
 * Get UTM parameters from cookies
 */
const getUTMParams = () => {
  const getCookie = (name: string) => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i].trim();
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length);
    }
    return undefined;
  };

  const utm_medium = getCookie("utm_medium");
  const utm_source = getCookie("utm_source");
  const utm_campaign = getCookie("utm_campaign");

  const utm_param_obj: Record<string, string> = {};
  
  if (utm_medium) utm_param_obj["utm_medium"] = encodeURIComponent(utm_medium);
  if (utm_source) utm_param_obj["utm_source"] = encodeURIComponent(utm_source);
  if (utm_campaign) utm_param_obj["utm_campaign"] = encodeURIComponent(utm_campaign);
  
  return utm_param_obj;
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
      const refreshToken = apiResponse.data.refresh_token || '';
      
      // Store authentication data
      await storeToken(token);
      await storeRefreshToken(refreshToken);
      await storeUser(userData);
      
      // Update global auth state
      setAuthState(userData, true);
      
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

// Type definitions to extend Window interface
declare global {
  interface Window {
    google?: any;
    FB?: any;
    msal?: any;
    msalInstance?: any;
    AppleID?: any;
    handleCredentialResponse?: (response: any) => void;
    fbAsyncInit?: () => void;
  }
}