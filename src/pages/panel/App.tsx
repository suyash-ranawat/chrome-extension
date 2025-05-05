import React, { useState, useEffect, useRef } from 'react';
import { sendChatMessage } from '@/services/api';
import TopNavigation from './components/TopNavigation';
import SideIcons from './components/SideIcons';
import ChatArea from './components/ChatArea';
import InputArea from './components/InputArea';
import SuggestedPrompts from './components/SuggestedPrompts';
import Profile from './components/auth/Profile';
import SignIn from './components/auth/SignIn';
import SignUp from './components/auth/SignUp';
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
    signIn, 
    signUp, 
    signOut, 
    updateProfile,
    socialLogin,
    phoneLogin
  } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isMessageLoading, setIsMessageLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | undefined>(undefined);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [currentView, setCurrentView] = useState<'chat' | 'search' | 'write' | 'image' | 'file' | 'auth'>('chat');
  const [authView, setAuthView] = useState<'signin' | 'signup'>('signin');
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
    // Switch back to chat view if on auth view
    if (currentView === 'auth') {
      setCurrentView('chat');
    }
  };

  const changeView = (view: 'chat' | 'search' | 'write' | 'image' | 'file' | 'auth') => {
    setCurrentView(view);
  };

  // Handle authentication actions
  const handleSignIn = async (email: string, password: string) => {
    try {
      await signIn(email, password);
      // After successful sign-in, switch back to chat view
      setCurrentView('chat');
      return true;
    } catch (error) {
      console.error('Sign in failed:', error);
      return false;
    }
  };

  const handleSignUp = async (username: string, email: string, password: string) => {
    try {
      await signUp(username, email, password);
      // After successful sign-up, switch back to chat view
      setCurrentView('chat');
      return true;
    } catch (error) {
      console.error('Sign up failed:', error);
      return false;
    }
  };

  const handleUpdateProfile = async (userData: any) => {
    try {
      await updateProfile(userData);
      // After profile update, switch back to chat view
      setCurrentView('chat');
      return true;
    } catch (error) {
      console.error('Profile update failed:', error);
      return false;
    }
  };

  // Render auth view (sign in/sign up/profile)
  const renderAuthView = () => {
    if (isLoading) {
      return (
        <div className="flex h-full items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        </div>
      );
    }

    if (isAuthenticated) {
      return (
        <Profile 
          user={user}
          onSignOut={() => {
            signOut();
            setCurrentView('chat');
          }} 
          onUpdate={handleUpdateProfile}
        />
      );
    }
    
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {authView === 'signin' ? 'Sign In' : 'Sign Up'}
            </h2>
            <button 
              onClick={() => setCurrentView('chat')}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto">
          {authView === 'signin' ? (
            <SignIn
              onSignIn={handleSignIn}
              onSwitchToSignUp={() => setAuthView('signup')}
              onSocialLogin={socialLogin}
              onPhoneLogin={() => {}} // Implement if needed
            />
          ) : (
            <SignUp
              onSignUp={handleSignUp}
              onSwitchToSignIn={() => setAuthView('signin')}
              onSocialLogin={socialLogin}
              onPhoneLogin={() => {}} // Implement if needed
            />
          )}
        </div>
      </div>
    );
  };

  // Render chat interface
  const renderChatInterface = () => (
    <div className="flex-1 flex flex-col h-full">
      <TopNavigation 
        onNewConversation={handleNewConversation} 
        isAuthenticated={isAuthenticated}
        username={user?.username}
        onAuthClick={() => setCurrentView('auth')}
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
  );

  return (
    <div className="flex h-full">
      {currentView === 'auth' ? renderAuthView() : renderChatInterface()}
      <SideIcons 
        currentView={currentView} 
        onViewChange={changeView} 
        isAuthenticated={isAuthenticated} 
      />
    </div>
  );
};

export default App;