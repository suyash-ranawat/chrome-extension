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
    console.error('Failed to notify background script:', error);
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

// Sign up user
export const signUp = async (username: string, email: string, password: string): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to sign up');
  }

  const data = await response.json();
  await storeToken(data.token);
  await storeUser(data.user);
  return data;
};

// Sign in user
export const signIn = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/signin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to sign in');
  }

  const data = await response.json();
  await storeToken(data.token);
  await storeUser(data.user);
  return data;
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
    console.error('Failed to notify background script:', error);
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
    throw new Error(error.message || 'Failed to update profile');
  }

  const updatedUser = await response.json();
  await storeUser(updatedUser);
  return updatedUser;
};