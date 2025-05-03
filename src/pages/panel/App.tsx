import React, { useState, useEffect, useRef } from 'react';
import { sendChatMessage } from '@/services/api';
import TopNavigation from './components/TopNavigation';
import SideIcons from './components/SideIcons';
import ChatArea from './components/ChatArea';
import InputArea from './components/InputArea';
import SuggestedPrompts from './components/SuggestedPrompts';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | undefined>(undefined);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [currentView, setCurrentView] = useState<'chat' | 'search' | 'write' | 'image' | 'file'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Retrieve current chat ID from localStorage on component mount
  useEffect(() => {
    const savedChatId = localStorage.getItem('currentChatId');
    if (savedChatId) {
      setCurrentChatId(savedChatId);
      // You might want to load messages for this chat ID here
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (userInput: string) => {
    if (!userInput.trim() || isLoading) return;

    // Add user message to UI
    setMessages(prev => [...prev, { role: 'user', content: userInput }]);
    setIsLoading(true);
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
      setIsLoading(false);
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
  };

  const changeView = (view: 'chat' | 'search' | 'write' | 'image' | 'file') => {
    setCurrentView(view);
    // In a real app, you might want to perform different actions based on the selected view
  };

  return (
    <div className="flex h-screen bg-white">
      <div className="flex-1 flex flex-col h-full">
        <TopNavigation onNewConversation={handleNewConversation} />
        
        {showSuggestions && messages.length === 0 ? (
          <SuggestedPrompts onPromptClick={handlePromptClick} />
        ) : (
          <ChatArea 
            messages={messages} 
            isLoading={isLoading} 
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
          isLoading={isLoading} 
        />
      </div>
      <SideIcons currentView={currentView} onViewChange={changeView} />
    </div>
  );
};

export default App;