import { API_BASE_URL, API_KEYS } from './config';
import { getUser, isAuthenticated as checkAuth } from './auth';

// Define return types for better type safety
interface ChatResponse {
  chatId: string;
  response: string;
}

// Helper function to add UID if user is authenticated
async function addUidIfAuthenticated(formData: FormData | URLSearchParams): Promise<void> {
  try {
    const isAuth = await checkAuth();
    if (isAuth) {
      const user = await getUser();
      if (user && user.id) {
        if (formData instanceof FormData) {
          formData.append('uid', user.id);
        } else {
          formData.set('uid', user.id);
        }
      }
    }
  } catch (error) {
    console.warn('Could not get user UID:', error);
  }
}

export async function sendChatMessage(
  prompt: string, 
  currentChatId?: string, 
  isTerms?: boolean
): Promise<ChatResponse> {
  const url = `${API_BASE_URL}/search`;

  // Create form data to be sent in POST request
  const formData = new URLSearchParams();
  
  // Add parameters from API_KEYS configuration
  formData.append('prompt', prompt);
  formData.append('key', API_KEYS.key);
  formData.append('auth', API_KEYS.auth);
  formData.append('sub', API_KEYS.sub);
  
  // Only add reset parameter if it exists and has a value
  if (API_KEYS.reset) {
    formData.append('reset', API_KEYS.reset);
  }

  // Add UID if user is authenticated
  await addUidIfAuthenticated(formData);
  
  if (currentChatId) formData.append('currentChatId', currentChatId);
  if (isTerms) formData.append('isTerms', '1');

  try {
    // Make POST request with the form data
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString()
    });

    if (!res.ok) {
      console.error('API error:', await res.text());
      throw new Error(`API request failed with status ${res.status}`);
    }

    const data = await res.json();
    return {
      chatId: data.chatId || currentChatId || '',
      response: data.response || data.content || "I'm sorry, I couldn't process that request."
    };
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

export async function inBrowerContent(prompt: string): Promise<ChatResponse> {
  const url = `${API_BASE_URL}/search`;

  // Create form data to be sent in POST request
  const formData = new URLSearchParams();
  
  // Add parameters from API_KEYS configuration
  formData.append('prompt', prompt);
  formData.append('key', API_KEYS.key);
  formData.append('auth', API_KEYS.auth);
  formData.append('sub', API_KEYS.sub);
  
  // Only add reset parameter if it exists and has a value
  if (API_KEYS.reset) {
    formData.append('reset', API_KEYS.reset);
  }

  // Add UID if user is authenticated
  await addUidIfAuthenticated(formData);
  
  formData.append('currentChatId', '');
  formData.append('isTerms', '1');

  try {
    // Make POST request with the form data
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString()
    });

    if (!res.ok) {
      console.error('API error:', await res.text());
      throw new Error(`API request failed with status ${res.status}`);
    }

    const data = await res.json();
    return {
      chatId: data.chatId || '',
      response: data.response || data.content || "I'm sorry, I couldn't process that request."
    };
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

// Function to fetch chat history
export async function getChatHistory(chatId: string): Promise<Message[]> {
  const url = new URL(`${API_BASE_URL}/chat/history`);
  
  url.searchParams.set('chatId', chatId);
  url.searchParams.set('key', API_KEYS.key);
  url.searchParams.set('auth', API_KEYS.auth);
  
  // Add UID if user is authenticated
  await addUidIfAuthenticated(url.searchParams);
  
  try {
    const res = await fetch(url.toString());
    
    if (!res.ok) {
      throw new Error(`Failed to fetch chat history: ${res.status}`);
    }
    
    const data = await res.json();
    return data.messages || [];
  } catch (error) {
    console.error('Failed to fetch chat history:', error);
    return [];
  }
}

// Function to fetch chat content by chat ID
export async function getChatContent(chatId: string): Promise<any> {
  const url = new URL(`${API_BASE_URL}/getchatcontent`);
  
  // Add required parameters
  url.searchParams.set('chatId', chatId);
  url.searchParams.set('key', API_KEYS.key);
  url.searchParams.set('auth', API_KEYS.auth);
  url.searchParams.set('sub', API_KEYS.sub || '');
  
  // Add UID if user is authenticated
  await addUidIfAuthenticated(url.searchParams);
  
  try {
    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!res.ok) {
      console.error('API error:', await res.text());
      throw new Error(`Failed to fetch chat content: ${res.status}`);
    }
    
    const data = await res.json();
    
    if (data.status !== 'success') {
      throw new Error(data.message || 'Failed to fetch chat content');
    }
    
    return data;
  } catch (error) {
    console.error('Failed to fetch chat content:', error);
    throw error;
  }
}

// Types for messages
interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}