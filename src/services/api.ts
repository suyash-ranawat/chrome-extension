import { API_BASE_URL, API_KEYS } from './config';

// Define return types for better type safety
interface ChatResponse {
  chatId: string;
  response: string;
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

  if (API_KEYS.uid) formData.append('uid', API_KEYS.uid);
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

  if (API_KEYS.uid) formData.append('uid', API_KEYS.uid);
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

// Function to fetch chat history (if needed)
export async function getChatHistory(chatId: string): Promise<Message[]> {
  const url = new URL(`${API_BASE_URL}/chat/history`);
  
  url.searchParams.set('chatId', chatId);
  url.searchParams.set('key', API_KEYS.key);
  url.searchParams.set('auth', API_KEYS.auth);
  
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

// Types for messages
interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}