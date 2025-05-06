import React, { useState, useEffect, useRef } from 'react';
import { sendChatMessage } from '@/services/api';
import TopNavigation from './components/TopNavigation';
import SideIcons from './components/SideIcons';
import ChatArea from './components/ChatArea';
import InputArea from './components/InputArea';
import SuggestedPrompts from './components/SuggestedPrompts';
import Auth from './components/auth/Auth';
import Profile from './components/auth/Profile';
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
    error: authError
  } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isMessageLoading, setIsMessageLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | undefined>(undefined);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [currentView, setCurrentView] = useState<'chat' | 'search' | 'write' | 'image' | 'file' | 'auth' | 'profile'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const handleSubmit = async (userInput: string) => {
    if (!userInput.trim() || isMessageLoading) return;

    // Add user message to UI
    setMessages(prev => [...prev, { role: 'user', content: userInput }]);
    setIsMessageLoading(true);
    setShowSuggestions(false);

    try {
      const { chatId, response } = await sendChatMessage(userInput, currentChatId);
      
      // Update chat ID if this is a new conversation
      if (chatId && !currentChatId) {
        setCurrentChatId(chatId);
        localStorage.setItem('currentChatId', chatId);
      }

      // Add assistant response to UI
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
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

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      // After sign out, return to chat view
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

  // Switch between different views
  const changeView = (view: 'chat' | 'search' | 'write' | 'image' | 'file' | 'auth' | 'profile') => {
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
        <div className="flex-1">
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
        <div className="flex-1">
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

  // Main chat interface
  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col h-full">
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