import { API_BASE_URL, API_KEYS } from './config';

export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  createdAt: string;
  phoneNumber?: string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  socialProviders?: string[];
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiResponse {
  success: boolean | number;
  message: string;
  data?: {
    user_id: string;
    email: string;
    phone_number: string | null;
    is_subscribed: boolean | string | null;
    logged_in: boolean;
    uid: string;
    access_token: string;
    refresh_token: string;
    expires_in: number;
    [key: string]: any; // For additional fields
  };
  validation?: {
    email?: string[];
    password?: string[];
    phone_number?: string[];
    [key: string]: string[] | undefined;
  };
}

// Store token in Chrome storage
export const storeToken = async (token: string): Promise<void> => {
  await chrome.storage.local.set({ authToken: token });
  // Notify background script
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
};

// Store user in Chrome storage
export const storeUser = async (user: User): Promise<void> => {
  await chrome.storage.local.set({ user });
};

// Get token from Chrome storage
export const getToken = async (): Promise<string | null> => {
  const result = await chrome.storage.local.get('authToken');
  return result.authToken || null;
};

// Get user from Chrome storage
export const getUser = async (): Promise<User | null> => {
  const result = await chrome.storage.local.get('user');
  return result.user || null;
};

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  const token = await getToken();
  return !!token;
};

// Transform API response to AuthResponse format expected by the application
const transformApiResponse = (apiResponse: ApiResponse): AuthResponse => {
  // Extract data from API response
  const { data } = apiResponse;
  
  if (!data) {
    throw new Error('Invalid API response: missing data');
  }
  
  // Create user object from API data
  const user: User = {
    id: data.user_id,
    email: data.email,
    username: data.email.split('@')[0], // Default username to first part of email
    createdAt: new Date().toISOString(),
    phoneNumber: data.phone_number || undefined,
    isEmailVerified: true, // Default to true since they just logged in
    isPhoneVerified: !!data.phone_number, // True if phone number exists
  };
  
  // Create auth response
  return {
    token: data.access_token,
    user
  };
};

// Sign up user
export const signUp = async (username: string, email: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      // If it's an API error with structured response
      if (data && data.message) {
        throw data;
      }
      throw new Error('Failed to sign up');
    }

    await storeToken(data.token);
    await storeUser(data.user);
    return data;
  } catch (error) {
    console.error('Sign up error:', error);
    throw error;
  }
};

// Sign in user
export const signIn = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    // Validate input
    if (!email && !password) {
      throw {
        success: false,
        message: 'Email and password are required',
        validation: {
          email: ['Email is required'],
          password: ['Password is required']
        }
      };
    }
    
    if (!email) {
      throw {
        success: false,
        message: 'Email is required',
        validation: {
          email: ['Email is required']
        }
      };
    }
    
    if (!password) {
      throw {
        success: false,
        message: 'Password is required',
        validation: {
          password: ['Password is required']
        }
      };
    }
    
    // Create form data
    const formData = new URLSearchParams();
    formData.append('email', email);
    formData.append('password', password);
    
    const response = await fetch(`${API_BASE_URL}/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });
    
    const apiResponse = await response.json();
    
    // Check for API errors - including simple error messages like "Invalid email or password"
    if (apiResponse.success === false || apiResponse.success === 0) {
      console.error('API error:', apiResponse);
      throw apiResponse;
    }
    
    // Transform API response to expected format
    const authResponse = transformApiResponse(apiResponse);
    
    // Store authentication data
    await storeToken(authResponse.token);
    await storeUser(authResponse.user);
    
    return authResponse;
  } catch (error) {
    console.error('Sign in error:', error);
    // Re-throw the error for the UI to handle
    throw error;
  }
};

// Sign out user
export const signOut = async (): Promise<void> => {
  await chrome.storage.local.remove(['authToken', 'user']);
  // Notify background script
  try {
    await chrome.runtime.sendMessage({ 
      type: 'AUTH_STATE_CHANGED', 
      isAuthenticated: false 
    });
  } catch (error) {
    // Silent failure in production
    if (process.env.NODE_ENV !== 'production') {
      console.error('Failed to notify background script:', error);
    }
  }
};

// Update user profile
export const updateProfile = async (userData: Partial<User>): Promise<User> => {
  const token = await getToken();
  if (!token) {
    throw new Error('Not authenticated');
  }
  
  const response = await fetch(`${API_BASE_URL}/auth/profile`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(userData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw error.message || 'Failed to update profile';
  }
  
  const updatedUser = await response.json();
  await storeUser(updatedUser);
  return updatedUser;
};