
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { sendChatMessage, getChatContent } from '@/services/api';
import TopNavigation from './components/TopNavigation';
import SideIcons from './components/SideIcons';
import ChatArea from './components/ChatArea';
import InputArea from './components/InputArea';
import SuggestedPrompts from './components/SuggestedPrompts';
import Auth from './components/auth/Auth';
import Profile from './components/auth/Profile';
import HistoryView from './components/HistoryView'; // Import the new component
import useAuth from '@/hooks/useAuth';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const App: React.FC = () => {
  const { 
    user, 
    isAuthenticated, 
    isLoading,
    signOut,
    updateProfile,
    getChatHistory, // Use this to get chat history
    error: authError
  } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isMessageLoading, setIsMessageLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | undefined>(undefined);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [currentView, setCurrentView] = useState<'chat' | 'search' | 'write' | 'image' | 'file' | 'auth' | 'profile' | 'history'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // This effect will run whenever isAuthenticated changes
    // It ensures components re-render with the latest auth state
    console.log('Authentication state changed:', isAuthenticated);
    
    // If user just logged in and has a current chat ID, we should load their chat history
    if (isAuthenticated && currentChatId) {
      // Optionally refresh chat data here if needed
    }
  }, [isAuthenticated]);

  // Retrieve current chat ID from localStorage on component mount
  useEffect(() => {
    const savedChatId = localStorage.getItem('currentChatId');
    if (savedChatId) {
      setCurrentChatId(savedChatId);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);


  const saveChatHistoryToLocalStorage = (messages: Message[]) => {
    console.log('saveChatHistoryToLocalStorage');
    console.log(isAuthenticated);
  if (!isAuthenticated) {
    const formattedHistory = messages.map(msg => ({
      message: msg.content,
      type: msg.role
    }));
    console.log(formattedHistory);
    localStorage.setItem('chatHistory', JSON.stringify(formattedHistory));
  }
};

// Add this function to load messages from localStorage:
const loadChatHistoryFromLocalStorage = useCallback(() => {
  console.log('loadChatHistoryFromLocalStorage');
  console.log(isAuthenticated);
  if (!isAuthenticated) {
    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        const formattedMessages = parsedHistory.map((item: any) => ({
          role: item.type as 'user' | 'assistant',
          content: item.message
        }));
        setMessages(formattedMessages);
      } catch (error) {
        console.error('Error parsing chat history:', error);
      }
    }
  }
}, [isAuthenticated]);

// Add effect to load messages on component mount:
useEffect(() => {
  loadChatHistoryFromLocalStorage();
}, [loadChatHistoryFromLocalStorage]);

// Add effect to save messages when they change:
useEffect(() => {
  if (messages.length > 0) {
    saveChatHistoryToLocalStorage(messages);
  }
}, [messages, isAuthenticated]);

  const handleSubmit = async (userInput: string) => {
  if (!userInput.trim() || isMessageLoading) return;

  // Add user message to UI
  const newMessages = [...messages, { role: 'user' as const, content: userInput }];
  setMessages(newMessages);  // Update the state with the new user message
  setIsMessageLoading(true);
  setShowSuggestions(false);

  try {
    const { chatId, response } = await sendChatMessage(userInput, currentChatId);

    // Update chat ID if this is a new conversation
    if (chatId && !currentChatId) {
      setCurrentChatId(chatId);
      localStorage.setItem('currentChatId', chatId);
    }

    // Add assistant response to UI, using the updated newMessages array
    const updatedMessages = [...newMessages, { role: 'assistant' as const, content: response }];
    setMessages(updatedMessages);

    // Save to localStorage if not authenticated
    if (!isAuthenticated) {
      saveChatHistoryToLocalStorage(updatedMessages);
    }

    // Clear the input field after receiving the response
    setInput('');  // This line resets the input field

  } catch (error) {
    console.error('Error:', error);
    setMessages(prev => [...prev, { role: 'assistant', content: 'Error fetching response.' }]);
  } finally {
    setIsMessageLoading(false);
  }
};



  const handlePromptClick = (promptText: string) => {
    setInput(promptText);
    handleSubmit(promptText);
  };

  const handleNewConversation = () => {
    setMessages([]);
    setCurrentChatId(undefined);
    localStorage.removeItem('currentChatId');
    setShowSuggestions(true);
    // Switch back to chat view if not on chat view
    if (currentView !== 'chat') {
      setCurrentView('chat');
    }
  };

  // Handle selecting a chat from history
  const handleSelectChat = async (chatId: string) => {
    // Store the selected chat ID
    setCurrentChatId(chatId);
    localStorage.setItem('currentChatId', chatId);
    
    // Clear current messages
    setMessages([]);
    setIsMessageLoading(true);
    setShowSuggestions(false); // Hide suggestions when loading a chat
    
    try {
      // Fetch chat messages for this chat ID
      const { response, success, message } = await sendChatMessage('', chatId);

      // Show error only if success is explicitly false
      if (success === false) {
        throw new Error(message || 'Failed to load chat history.');
      }

      // Dynamically handle any message from the backend
      if (message) {
        // If there's any message, display it dynamically
        setMessages([{ role: 'assistant', content: message }]);
      } else if (response) {
        // Dynamically parse the response if it's in JSON format
        try {
          const parsedContent = JSON.parse(response);

          // If parsedContent is an array, display it directly
          if (Array.isArray(parsedContent)) {
            setMessages(parsedContent);
          } else if (parsedContent.messages && Array.isArray(parsedContent.messages)) {
            // If there are messages in parsedContent, display them
            setMessages(parsedContent.messages);
          } else {
            // Otherwise, just show the response as a single message
            setMessages([{ role: 'assistant', content: response }]);
          }
        } catch (parseError) {
          // If parsing fails, just display the raw response as a message
          setMessages([{ role: 'assistant', content: response }]);
        }
      } else {
        // If no message or response, display a default dynamic message
        setMessages([{ role: 'assistant', content: 'No chat history available or unexpected response format.' }]);
      }

      // Switch to chat view
      setCurrentView('chat');
    } catch (error) {
      console.error('Error loading chat:', error);
      setMessages([{ role: 'assistant', content: 'Error loading chat content. Please try again.' }]);
    } finally {
      setIsMessageLoading(false);
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      
       // Clear UI state
      setMessages([]);
      setCurrentChatId(undefined);
      setShowSuggestions(true);
      
      // Explicitly clear localStorage to ensure chat history is removed
      localStorage.removeItem('chatHistory');
      localStorage.removeItem('currentChatId');
      
      setCurrentView('chat');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  // Handle profile update
  const handleUpdateProfile = async (userData: any) => {
    try {
      await updateProfile(userData);
      return true;
    } catch (error) {
      console.error('Profile update failed:', error);
      return false;
    }
  };

  const handleMessageUpdate = (index: number, newContent: string) => {
    setMessages(prevMessages => {
      const updatedMessages = [...prevMessages];
      updatedMessages[index] = {
        ...updatedMessages[index],
        content: newContent
      };
      return updatedMessages;
    });
  };


  // Switch between different views
  const changeView = (view: 'chat' | 'search' | 'write' | 'image' | 'file' | 'auth' | 'profile' | 'history') => {
    setCurrentView(view);
  };

  // Handle completion of authentication flow (redirecting back to chat)
  const handleAuthComplete = () => {
    setCurrentView('chat');
  };

  // Auth view
  if (currentView === 'auth') {
    return (
      <div className="flex h-full">
        <div className="flex-1 flex flex-col h-full max-w-[calc(100%-5px)]">
          <Auth onAuthComplete={handleAuthComplete} />
        </div>
        <SideIcons 
          currentView={currentView} 
          onViewChange={changeView} 
          isAuthenticated={isAuthenticated} 
        />
      </div>
    );
  }

  // Profile view
  if (currentView === 'profile') {
    return (
      <div className="flex h-full">
        <div className="flex-1 flex flex-col h-full max-w-[calc(100%-5px)]">
          <Profile 
            user={user}
            onSignOut={handleSignOut}
            onUpdate={handleUpdateProfile}
            error={authError}
          />
        </div>
        <SideIcons 
          currentView={currentView} 
          onViewChange={changeView} 
          isAuthenticated={isAuthenticated} 
        />
      </div>
    );
  }

  // History view
  if (currentView === 'history') {
    return (
      <div className="flex h-full">
        <div className="flex-1 flex flex-col h-full max-w-[calc(100%-5px)]">
          <HistoryView 
            onSelectChat={handleSelectChat}
          />
        </div>
        <SideIcons 
          currentView={currentView} 
          onViewChange={changeView} 
          isAuthenticated={isAuthenticated} 
        />
      </div>
    );
  }

  // Main chat interface
  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col h-full max-w-[calc(100%-30px)]">
        <TopNavigation 
          onNewConversation={handleNewConversation} 
          isAuthenticated={isAuthenticated}
          username={user?.username}
          onAuthClick={() => isAuthenticated ? setCurrentView('profile') : setCurrentView('auth')}
        />
        
        {showSuggestions && messages.length === 0 ? (
          <SuggestedPrompts onPromptClick={handlePromptClick} />
        ) : (
          <ChatArea 
            messages={messages} 
            isLoading={isMessageLoading} 
            messagesEndRef={messagesEndRef} 
            onMessageUpdate={handleMessageUpdate}
          />
        )}
        
        <InputArea 
          input={input} 
          setInput={setInput} 
          handleSubmit={(e) => {
            e.preventDefault();
            handleSubmit(input);
            setInput('');
          }} 
          isLoading={isMessageLoading} 
        />
      </div>
      <SideIcons 
        currentView={currentView} 
        onViewChange={changeView} 
        isAuthenticated={isAuthenticated} 
      />
    </div>
  );
};

export default App;