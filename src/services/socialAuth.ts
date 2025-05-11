import { API_BASE_URL, GOOGLE_CLIENT_ID, FACEBOOK_APP_ID, MICROSOFT_CLIENT_ID, APPLE_SERVICE_ID } from './config';
import { storeToken, storeUser, User, storeRefreshToken } from './auth';

export type SocialProvider = 'google' | 'facebook' | 'microsoft' | 'apple';

/**
 * Function to handle social logins by making direct API calls to the backend
 * This approach uses the API endpoints directly rather than going through SDKs
 */
export const initiateSocialLogin = async (provider: SocialProvider): Promise<void> => {
  try {
    console.log(`Initiating ${provider} login...`);
    
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

/**
 * Handle Google Authentication
 */
// const handleGoogleAuth = async (): Promise<void> => {
//   return new Promise((resolve, reject) => {
//     // First load Google script if needed
//     const loadGoogleScript = () => {
//       const script = document.createElement('script');
//       script.src = 'https://accounts.google.com/gsi/client';
//       script.id = 'google-signin-script';
//       script.async = true;
//       script.defer = true;
//       script.onload = initGoogleAuth;
//       script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
//       document.head.appendChild(script);
//     };

//     // Initialize Google Auth
//     const initGoogleAuth = () => {
//       if (!window.google || !window.google.accounts) {
//         reject(new Error('Google Identity Services not available'));
//         return;
//       }

//       // Create a hidden button element
//       const googleButtonContainer = document.createElement('div');
//       googleButtonContainer.style.display = 'none';
//       document.body.appendChild(googleButtonContainer);

//       // Set up callback
//       window.handleCredentialResponse = (response) => {
//         if (!response.credential) {
//           reject(new Error('No credential received from Google'));
//           return;
//         }

//         // Parse JWT token
//         const responsePayload = parseJwt(response.credential);
//         console.log('Google auth successful:', responsePayload);

//         const userData = {
//           full_name: responsePayload.name,
//           username: responsePayload.email,
//           email: responsePayload.email,
//           google_id: responsePayload.sub,
//           image_url: responsePayload.picture,
//           task: 'signin'
//         };

//         registerSocialUser(userData)
//           .then(() => resolve())
//           .catch((error) => reject(error));
//       };

//       // Initialize Google Sign-In with error handling
//       try {
//         const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';
//         console.log('Using Google client ID:', clientId);

//         window.google.accounts.id.initialize({
//           client_id: clientId,
//           callback: window.handleCredentialResponse,
//           ux_mode: "popup"
//         });

//         // Render button and trigger click
//         window.google.accounts.id.renderButton(googleButtonContainer, {
//           type: "icon",
//           width: 200
//         });

//         // Try prompt first
//         window.google.accounts.id.prompt((notification) => {
//           if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
//             console.log('Google prompt not displayed:', notification.getNotDisplayedReason());
//             // Try clicking the button as fallback
//             const button = googleButtonContainer.querySelector('div[role=button]');
//             if (button) {
//               (button as HTMLElement).click();
//             } else {
//               reject(new Error('Failed to display Google login prompt'));
//             }
//           }
//         });
//       } catch (error) {
//         console.error('Google auth initialization error:', error);
//         reject(error);
//       }
//     };

//     // Start the process
//     if (document.getElementById('google-signin-script') && window.google?.accounts) {
//       // Script already loaded
//       initGoogleAuth();
//     } else {
//       // Load script first
//       loadGoogleScript();
//     }
//   });
// };
const handleGoogleAuth = async (): Promise<void> => {
  const redirectUri = chrome.identity.getRedirectURL('google');

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth` +
    `?client_id=${GOOGLE_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=token` +
    `&scope=openid%20email%20profile`;

  return new Promise<void>((resolve, reject) => {
    chrome.identity.launchWebAuthFlow(
      {
        url: authUrl,
        interactive: true
      },
      async (redirectUrl) => {
        if (chrome.runtime.lastError || !redirectUrl) {
          return reject(chrome.runtime.lastError || new Error("No redirect URL"));
        }

        const accessToken = new URL(redirectUrl).hash
          .substring(1)
          .split('&')
          .find(param => param.startsWith("access_token="))
          ?.split('=')[1];

        if (!accessToken) {
          return reject(new Error("No access token found"));
        }

        // Fetch user info from Google
        const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${accessToken}` }
        });

        const userInfo = await res.json();

        const userData = {
          full_name: userInfo.name,
          username: userInfo.email,
          email: userInfo.email,
          google_id: userInfo.sub,
          image_url: userInfo.picture,
          task: 'signin'
        };

        // Send data to your existing registration API
        await registerSocialUser(userData);
        resolve();
      }
    );
  });
};



/**
 * Handle Facebook Authentication
 */
// const handleFacebookAuth = async (): Promise<void> => {
//   // Load Facebook SDK
//   // if (!document.getElementById('facebook-jssdk')) {
//     const script = document.createElement('script');
//     script.src = 'https://connect.facebook.net/en_US/sdk.js';
//     script.id = 'facebook-jssdk';
//     script.async = true;
//     script.defer = true;
//     document.head.appendChild(script);
    
//     await new Promise((resolve, reject) => {
//       script.onload = resolve;
//       script.onerror = reject;
//     });
//   // }
  
//   return new Promise((resolve, reject) => {
//     try {
//       // Initialize Facebook SDK if not already initialized
//       if (!window.FB) {
//         reject(new Error('Facebook SDK not available'));
//         return;
//       }
      
//       window.FB.init({
//         appId: `${FACEBOOK_APP_ID}` || '',
//         xfbml: true,
//         version: 'v18.0'
//       });
      
//       // Trigger Facebook login
//       window.FB.login(function(response) {
//         if (response.authResponse) {
//           const accessToken = response.authResponse.accessToken;
//           const userId = response.authResponse.userID;
          
//           // Get user profile
//           window.FB.api('/me', {
//             locale: 'en_US',
//             fields: 'name, email, picture'
//           }, function(profileResponse) {
//             if (!profileResponse || profileResponse.error) {
//               reject(new Error(profileResponse?.error?.message || 'Failed to fetch profile'));
//               return;
//             }
            
//             // Prepare data for API call
//             const userData = {
//               full_name: profileResponse.name,
//               username: profileResponse.email,
//               email: profileResponse.email,
//               fb_id: userId,
//               image_url: profileResponse.picture?.data?.url || '',
//               task: 'signin' // Using 'signin' as specified in your cURL example
//             };
            
//             // Send data to API
//             registerSocialUser(userData)
//               .then(() => resolve())
//               .catch((error) => reject(error));
//           });
//         } else {
//           reject(new Error('User cancelled login or did not fully authorize'));
//         }
//       }, {
//         scope: 'email'
//       });
//     } catch (error) {
//       reject(error);
//     }
//   });
// };
const handleFacebookAuth = async (): Promise<void> => {
  const redirectUri = chrome.identity.getRedirectURL('facebook');
  const authUrl = `https://www.facebook.com/v12.0/dialog/oauth` +
    `?client_id=${FACEBOOK_APP_ID}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=email`;

  return new Promise<void>((resolve, reject) => {
    chrome.identity.launchWebAuthFlow(
      { url: authUrl, interactive: true },
      async (redirectUrl) => {
        if (chrome.runtime.lastError || !redirectUrl) {
          return reject(chrome.runtime.lastError || new Error("No redirect URL"));
        }

        const urlParams = new URL(redirectUrl);
        const accessToken = urlParams.searchParams.get("access_token");

        if (!accessToken) {
          return reject(new Error("No access token found"));
        }

        // Fetch user info from Facebook Graph API
        const res = await fetch(`https://graph.facebook.com/me?fields=name,email,picture&access_token=${accessToken}`);
        const userInfo = await res.json();

        const userData = {
          full_name: userInfo.name,
          username: userInfo.email,
          email: userInfo.email,
          fb_id: userInfo.id,
          image_url: userInfo.picture?.data?.url,
          task: 'signin'
        };

        // Send data to your existing registration API
        await registerSocialUser(userData);
        resolve();
      }
    );
  });
};



/**
 * Handle Microsoft Authentication
 */
// const handleMicrosoftAuth = async (): Promise<void> => {
//   // Load Microsoft MSAL
//   // if (!document.getElementById('microsoft-msal-script')) {
//     const script = document.createElement('script');
//     script.src = 'https://alcdn.msauth.net/browser/2.35.0/js/msal-browser.min.js';
//     script.id = 'microsoft-msal-script';
//     script.async = true;
//     script.defer = true;
//     document.head.appendChild(script);
    
//     await new Promise((resolve, reject) => {
//       script.onload = resolve;
//       script.onerror = reject;
//     });
//   // }
  
//   return new Promise((resolve, reject) => {
//     try {
//       if (!window.msal) {
//         reject(new Error('MSAL library not available'));
//         return;
//       }
      
//       // Initialize MSAL
//       const msalConfig = {
//         auth: {
//           clientId: `${MICROSOFT_CLIENT_ID}` || '',
//           authority: 'https://login.microsoftonline.com/common',
//           redirectUri: window.location.origin + '/auth/microsoft/callback'
//         },
//         cache: {
//           cacheLocation: 'sessionStorage',
//           storeAuthStateInCookie: true
//         }
//       };
      
//       const msalInstance = new window.msal.PublicClientApplication(msalConfig);
      
//       // Login request
//       const loginRequest = {
//         scopes: ["user.read", "mail.read", "openid", "profile", "email"]
//       };
      
//       // Trigger Microsoft login
//       msalInstance.loginPopup(loginRequest)
//         .then(function(loginResponse) {
//           const accessToken = loginResponse.accessToken;
          
//           // Fetch user profile from Microsoft Graph API
//           fetch('https://graph.microsoft.com/v1.0/me', {
//             method: 'GET',
//             headers: {
//               'Authorization': 'Bearer ' + accessToken
//             }
//           })
//           .then(response => response.json())
//           .then(data => {
//             if (data.error) {
//               reject(new Error(data.error.message || 'Failed to fetch profile'));
//               return;
//             }
            
//             // Get user photo if available
//             fetch('https://graph.microsoft.com/v1.0/me/photo/$value', {
//               method: 'GET',
//               headers: {
//                 'Authorization': 'Bearer ' + accessToken
//               }
//             })
//             .then(photoResponse => {
//               let imageUrl = '';
              
//               if (photoResponse.ok) {
//                 imageUrl = URL.createObjectURL(photoResponse.blob());
//               }
              
//               // Prepare data for API call
//               const userData = {
//                 full_name: data.displayName,
//                 username: data.userPrincipalName,
//                 email: data.mail || data.userPrincipalName,
//                 ms_id: data.id,
//                 image_url: imageUrl,
//                 task: 'signin'
//               };
              
//               // Send data to API
//               registerSocialUser(userData)
//                 .then(() => resolve())
//                 .catch((error) => reject(error));
//             })
//             .catch(() => {
//               // Continue even if photo fetch fails
//               const userData = {
//                 full_name: data.displayName,
//                 username: data.userPrincipalName,
//                 email: data.mail || data.userPrincipalName,
//                 ms_id: data.id,
//                 task: 'signin'
//               };
              
//               registerSocialUser(userData)
//                 .then(() => resolve())
//                 .catch((error) => reject(error));
//             });
//           })
//           .catch(error => {
//             console.error('Error fetching Microsoft profile:', error);
//             reject(error);
//           });
//         })
//         .catch(function(error) {
//           console.error('Microsoft login failed:', error);
//           reject(error);
//         });
//     } catch (error) {
//       reject(error);
//     }
//   });
// };
const handleMicrosoftAuth = async (): Promise<void> => {
  const redirectUri = chrome.identity.getRedirectURL('microsoft');
  const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize` +
    `?client_id=${MICROSOFT_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=token` +
    `&scope=openid profile email`;

  return new Promise<void>((resolve, reject) => {
    chrome.identity.launchWebAuthFlow(
      { url: authUrl, interactive: true },
      async (redirectUrl) => {
        if (chrome.runtime.lastError || !redirectUrl) {
          return reject(chrome.runtime.lastError || new Error("No redirect URL"));
        }

        const accessToken = new URL(redirectUrl).hash
          .substring(1)
          .split('&')
          .find(param => param.startsWith("access_token="))
          ?.split('=')[1];

        if (!accessToken) {
          return reject(new Error("No access token found"));
        }

        // Fetch user info from Microsoft Graph API
        const res = await fetch('https://graph.microsoft.com/v1.0/me', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });

        const userInfo = await res.json();

        const userData = {
          full_name: userInfo.displayName,
          username: userInfo.mail || userInfo.userPrincipalName,
          email: userInfo.mail || userInfo.userPrincipalName,
          ms_id: userInfo.id,
          image_url: userInfo.photo ? URL.createObjectURL(userInfo.photo) : '',
          task: 'signin'
        };

        // Send data to your existing registration API
        await registerSocialUser(userData);
        resolve();
      }
    );
  });
};


/**
 * Handle Apple Authentication
 */
// const handleAppleAuth = async (): Promise<void> => {
//   // Load Apple Sign In JS
//   // if (!document.getElementById('apple-signin-script')) {
//     const script = document.createElement('script');
//     script.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
//     script.id = 'apple-signin-script';
//     script.async = true;
//     script.defer = true;
//     document.head.appendChild(script);
    
//     await new Promise((resolve, reject) => {
//       script.onload = resolve;
//       script.onerror = reject;
//     });
//   // }
  
//   return new Promise((resolve, reject) => {
//     try {
//       if (!window.AppleID) {
//         reject(new Error('Apple Sign In JS not available'));
//         return;
//       }
      
//       // Get the domain from current URL
//       const parsedUrl = new URL(window.location.href);
//       const protocolAndDomain = parsedUrl.origin;
      
//       // Initialize Apple Sign-In
//       window.AppleID.auth.init({
//         clientId: `${APPLE_SERVICE_ID}` || '',
//         redirectURI: protocolAndDomain,
//         usePopup: true
//       });
      
//       // Trigger Apple sign-in
//       window.AppleID.auth.signIn()
//         .then(function(response) {
//           const idToken = response.authorization.id_token;
//           const userData = parseJwt(idToken);
          
//           if (!userData) {
//             reject(new Error('Failed to parse Apple ID token'));
//             return;
//           }
          
//           // Prepare API data
//           const postData: Record<string, any> = {
//             email: userData.email,
//             app_id: userData.sub,
//             task: 'signup' // Using 'signup' as specified in your cURL example
//           };
          
//           // Add full name if available
//           const fullName = response.user ? response.user.name : null;
//           if (fullName) {
//             postData.full_name = `${fullName.firstName} ${fullName.lastName}`;
//           }
          
//           // Send data to API
//           registerSocialUser(postData)
//             .then(() => resolve())
//             .catch((error) => reject(error));
//         })
//         .catch(function(error) {
//           console.error('Apple Sign-In Error:', error);
//           reject(error);
//         });
//     } catch (error) {
//       reject(error);
//     }
//   });
// };
const handleAppleAuth = async (): Promise<void> => {
  const redirectUri = chrome.identity.getRedirectURL('apple');
  const authUrl = `https://appleid.apple.com/auth/authorize` +
    `?client_id=${APPLE_SERVICE_ID}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code id_token` +
    `&scope=name email`;

  return new Promise<void>((resolve, reject) => {
    chrome.identity.launchWebAuthFlow(
      { url: authUrl, interactive: true },
      async (redirectUrl) => {
        if (chrome.runtime.lastError || !redirectUrl) {
          return reject(chrome.runtime.lastError || new Error("No redirect URL"));
        }

        const urlParams = new URL(redirectUrl);
        const authorizationCode = urlParams.searchParams.get("code");
        const idToken = urlParams.searchParams.get("id_token");

        if (!idToken) {
          return reject(new Error("No id_token found"));
        }

        // Parse the JWT from Apple and fetch user info
        const userData = parseJwt(idToken);
        
        // Send data to your existing registration API
        await registerSocialUser({
          full_name: userData?.name,
          email: userData?.email,
          app_id: userData?.sub,
          task: 'signup' // Using 'signup' as specified
        });
        resolve();
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
    
    if (responseData.status) {
      // Store authentication data
      if (responseData.token) {
        await storeToken(responseData.token);
      }
      if (responseData.refresh_token) {
        await storeRefreshToken(responseData.refresh_token);
      }
      
      if (responseData.user) {
        await storeUser(responseData.user);
      }
      
      return Promise.resolve();
    } else {
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