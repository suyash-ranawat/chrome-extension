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
  refreshToken: string;
  user: User;
}

export interface ApiResponse {
  success: boolean | number;
  message?: string;
  data?: {
    user_id?: string;
    email?: string;
    phone_number?: string | null;
    is_subscribed?: boolean | string | null;
    logged_in?: boolean;
    uid?: string;
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
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

export const storeRefreshToken = async (token: string): Promise<void> => {
  await chrome.storage.local.set({ refreshToken: token });
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

export const getRefreshToken = async (): Promise<string | null> => {
  const result = await chrome.storage.local.get('refreshToken');
  return result.refreshToken || null;
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
  
  // Extract user information from API data
  const userId = data.user_id || '';
  const email = data.email || '';
  const phoneNumber = data.phone_number || undefined;
  const isSubscribed = !!data.is_subscribed;
  const accessToken = data.access_token || '';
  const refreshToken = data.refresh_token || '';
  
  // Create user object from API data
  const user: User = {
    id: userId,
    email: email,
    username: email.split('@')[0], // Default username to first part of email
    createdAt: new Date().toISOString(),
    phoneNumber: phoneNumber,
    isEmailVerified: true, // Default to true since they just logged in
    isPhoneVerified: !!phoneNumber, // True if phone number exists
  };
  
  // Create auth response
  return {
    token: accessToken,
    refreshToken: refreshToken,
    user
  };
};

// Extract error message from API error response
const extractErrorMessage = (apiResponse: any): string => {
  if (typeof apiResponse === 'string') {
    return apiResponse;
  }
  
  if (apiResponse && typeof apiResponse === 'object') {
    // Check for message field first
    if (apiResponse.message) {
      return apiResponse.message;
    }
    
    // Check for validation errors
    if (apiResponse.validation) {
      const validationErrors = apiResponse.validation;
      // Collect all validation error messages
      const errorMessages: string[] = [];
      
      for (const field in validationErrors) {
        if (Array.isArray(validationErrors[field])) {
          errorMessages.push(...validationErrors[field]);
        }
      }
      
      if (errorMessages.length > 0) {
        return errorMessages.join('. ');
      }
    }
  }
  
  return 'An unknown error occurred';
};

// Sign up user
export const signUp = async (username: string, email: string, password: string): Promise<AuthResponse> => {
  try {
    // Construct form data
    const formData = new URLSearchParams();
    formData.append('email', email);
    formData.append('password', password);
    formData.append('username', username);
    
    // Make API request to signup endpoint
    const response = await fetch(`${API_BASE_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });
    
    const apiResponse = await response.json();
    
    // Check for API errors
    if (apiResponse.success === false || apiResponse.success === 0) {
      throw extractErrorMessage(apiResponse);
    }
    
    // Transform API response
    const authResponse = transformApiResponse(apiResponse);
    
    // Store authentication data
    await storeToken(authResponse.token);
    await storeRefreshToken(authResponse.refreshToken);
    await storeUser(authResponse.user);
    
    return authResponse;
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
    
    // Make API request to signin endpoint
    const response = await fetch(`${API_BASE_URL}/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });
    
    // Parse response
    const apiResponse = await response.json();
    
    // Check for API errors
    if (apiResponse.success === false || apiResponse.success === 0) {
      throw extractErrorMessage(apiResponse);
    }
    
    // Transform API response
    const authResponse = transformApiResponse(apiResponse);
    
    // Store authentication data
    await storeToken(authResponse.token);
    await storeRefreshToken(authResponse.refreshToken);
    await storeUser(authResponse.user);
    
    return authResponse;
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
};

// Sign out user
export const signOut = async (): Promise<void> => {
  try {
    // Remove authentication data from storage
    await chrome.storage.local.remove(['authToken', 'user', 'refreshToken']);
    
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
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

// Update user profile
export const updateProfile = async (userData: Partial<User>): Promise<User> => {
  const token = await getToken();
  if (!token) {
    throw new Error('Not authenticated');
  }
  
  try {
    // Create form data for the update
    const formData = new URLSearchParams();
    
    // Add provided user data to form data
    if (userData.username) formData.append('username', userData.username);
    if (userData.email) formData.append('email', userData.email);
    
    // Handle password update if provided
    if (userData.hasOwnProperty('password')) {
      const passwordData = (userData as any).password;
      if (passwordData && typeof passwordData === 'object') {
        if (passwordData.current) formData.append('current_password', passwordData.current);
        if (passwordData.new) formData.append('new_password', passwordData.new);
      }
    }
    
    // Make API request to update profile
    const response = await fetch(`${API_BASE_URL}/update-profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${token}`
      },
      body: formData.toString(),
    });
    
    // Parse response
    const apiResponse = await response.json();
    
    // Check for API errors
    if (apiResponse.success === false || apiResponse.success === 0) {
      throw extractErrorMessage(apiResponse);
    }
    
    // Get updated user data
    const currentUser = await getUser();
    
    if (!currentUser) {
      throw new Error('User data not found');
    }
    
    // Update user with new information
    const updatedUser: User = {
      ...currentUser,
      ...(userData.username && { username: userData.username }),
      ...(userData.email && { email: userData.email }),
    };
    
    // Store updated user
    await storeUser(updatedUser);
    
    return updatedUser;
  } catch (error) {
    console.error('Update profile error:', error);
    throw error;
  }
};

// Request password reset
export const requestPasswordReset = async (email: string): Promise<boolean> => {
  try {
    // Create form data
    const formData = new URLSearchParams();
    formData.append('email', email);
    
    // Make API request to forgot-password endpoint
    const response = await fetch(`${API_BASE_URL}/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });
    
    // Parse response
    const apiResponse = await response.json();
    
    // Check if the request was successful
    if (apiResponse.status && apiResponse.status === true) {
      return true;
    }
    
    // If we have an error message, throw it
    if (apiResponse.message) {
      throw new Error(apiResponse.message);
    }
    
    // Default error
    throw new Error('Failed to send password reset email');
  } catch (error) {
    console.error('Password reset request error:', error);
    throw error;
  }
};

// Reset password with token
export const resetPassword = async (token: string, password: string): Promise<boolean> => {
  try {
    // Create form data
    const formData = new URLSearchParams();
    formData.append('token', token);
    formData.append('password', password);
    
    // Make API request to reset-password endpoint
    const response = await fetch(`${API_BASE_URL}/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });
    
    // Parse response
    const apiResponse = await response.json();
    
    // Check if the password reset was successful
    if (apiResponse.status && apiResponse.status === true) {
      return true;
    }
    
    // If we have an error message, throw it
    if (apiResponse.message) {
      throw new Error(apiResponse.message);
    }
    
    // Default error
    throw new Error('Failed to reset password');
  } catch (error) {
    console.error('Password reset error:', error);
    throw error;
  }
};

export const getChatHistory = async (): Promise<any> => {
  const token = await getToken();
  const refreshtoken = await getRefreshToken();
  
  if (!token) {
    throw new Error('Not authenticated');
  }

  const user = await getUser();
  
  if (!user) {
    throw new Error('User data not found');
  }

  try {
    const response = await fetch(`https://api.search.com/app/get_user_history/1`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Refresh-Token': `${refreshtoken}`,
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    });

    const apiResponse = await response.json();

    // Case 1: Access token was refreshed
    if (apiResponse.access_token) {
      await storeToken(apiResponse.access_token);
      
      // Call getChatHistory again to use the new token (recursive call)
      return await getChatHistory();  // Recursive call after token update
    }

    // Case 2: If `response` exists and has dynamic categories (e.g., Yesterday, Previous 7 Days)
    if (apiResponse.status === 'success' && apiResponse.response) {
      const chatHistory: any = {};

      // Loop through the response categories dynamically
      Object.keys(apiResponse.response).forEach((category) => {
        const chats = apiResponse.response[category];
        
        if (Array.isArray(chats)) {
          chatHistory[category] = chats.map((chat: any) => {
            return {
              id: chat.id || chat.chatId,
              name: chat.name || `Chat from ${new Date(chat.created_at).toLocaleString()}`,
              first_message: chat.first_message || 'No messages',
              message_count: chat.message_count || 0,
              created_at: chat.created_at || chat.timestamp,
              updated_at: chat.updated_at,
              last_updated: chat.last_updated,
              messages: chat.messages || []
            };
          });
        }
      });

      // Sort each category by created_at (newest first)
      Object.keys(chatHistory).forEach((category) => {
        chatHistory[category].sort(
          (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });

      return chatHistory;
    }

    throw new Error(apiResponse.message || 'Failed to fetch chat history');
  } catch (error) {
    console.error('Get chat history error:', error);
    throw error;
  }
};
