import { API_BASE_URL, API_KEYS } from './config';
import { getUser, isAuthenticated as checkAuth } from './auth';
import { getEncryptedIpAddress } from '../utils/encryption';

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
  formData.append('auth', API_KEYS.auth);
  formData.append('sub', API_KEYS.sub);

  // Get the encrypted IP address instead of using the API key directly
  const encryptedIp = await getEncryptedIpAddress();
  formData.append('key', encryptedIp);
  
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

    // Try to parse the response as JSON, even for error responses
    let jsonData;
    try {
      jsonData = await res.json();
    } catch (parseError) {
      // If it can't be parsed as JSON, get the text instead
      const textResponse = await res.text();
      console.error('API response not JSON:', textResponse);
      throw new Error(`API response invalid format: ${textResponse}`);
    }

    // Handle specific status codes
    if (res.status === 429) {
      console.warn('Rate limited:', jsonData);
      
      // Return a formatted response for rate limiting
      return {
        chatId: currentChatId || '',
        response: "Rate limit exceeded. Please login or upgrade your account."
      };
    }
    
    // For other non-OK responses
    if (!res.ok) {
      console.error('API error:', jsonData);
      
      // If there's a readable error message in the response, use it
      if (jsonData && jsonData.response) {
        return {
          chatId: currentChatId || '',
          response: jsonData.response
        };
      }
      
      throw new Error(`API request failed with status ${res.status}`);
    }

    // Normal success response
    return {
      chatId: jsonData.chatId || currentChatId || '',
      response: jsonData.response || jsonData.content || "I'm sorry, I couldn't process that request."
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
  formData.append('auth', API_KEYS.auth);
  formData.append('sub', API_KEYS.sub);
  
  // Only add reset parameter if it exists and has a value
  if (API_KEYS.reset) {
    formData.append('reset', API_KEYS.reset);
  }

  // Get the encrypted IP address instead of using the API key directly
  const encryptedIp = await getEncryptedIpAddress();
  formData.append('key', encryptedIp);

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

    // Try to parse the response as JSON, even for error responses
    let jsonData;
    try {
      jsonData = await res.json();
    } catch (parseError) {
      // If it can't be parsed as JSON, get the text instead
      const textResponse = await res.text();
      console.error('API response not JSON:', textResponse);
      throw new Error(`API response invalid format: ${textResponse}`);
    }

    // Handle specific status codes
    if (res.status === 429) {
      console.warn('Rate limited:', jsonData);
      
      // Return a formatted response for rate limiting
      return {
        chatId: '',
        response: "Rate limit exceeded. Please login or upgrade your account."
      };
    }
    
    // For other non-OK responses
    if (!res.ok) {
      console.error('API error:', jsonData);
      
      // If there's a readable error message in the response, use it
      if (jsonData && jsonData.response) {
        return {
          chatId: '',
          response: jsonData.response
        };
      }
      
      throw new Error(`API request failed with status ${res.status}`);
    }

    // Normal success response
    return {
      chatId: jsonData.chatId || '',
      response: jsonData.response || jsonData.content || "I'm sorry, I couldn't process that request."
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
  // url.searchParams.set('key', API_KEYS.key);
  url.searchParams.set('auth', API_KEYS.auth);

  // Get the encrypted IP address instead of using the API key directly
  const encryptedIp = await getEncryptedIpAddress();
  url.searchParams.set('key', encryptedIp);
  
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
  // url.searchParams.set('key', API_KEYS.key);
  url.searchParams.set('auth', API_KEYS.auth);
  url.searchParams.set('sub', API_KEYS.sub || '');

  // Get the encrypted IP address instead of using the API key directly
  const encryptedIp = await getEncryptedIpAddress();
  url.searchParams.set('key', encryptedIp);
  
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