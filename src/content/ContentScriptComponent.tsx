// src/content/ContentScriptComponent.tsx
import React, { useState, useEffect } from 'react';
import { inBrowerContent } from '@/services/api';
import { GoogleHomeAISearch } from './GoogleHomeAISearch';

export const ContentScriptComponent = () => {
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  
  const url = window.location.href;
  const searchParams = new URLSearchParams(window.location.search);
  const qParam = searchParams.get('q');
  
  // Check if this is Google's homepage (no search query)
  const isHomePage = (url === 'https://www.google.com/' || 
                     url === 'https://google.com/' || 
                     url === 'https://www.google.com' || 
                     url === 'https://google.com') && !qParam;
  
  // Check if this is a search results page (has search query)
  const isSearchPage = qParam !== null;

  useEffect(() => {
    // Log for debugging
    console.log('Current URL:', url);
    console.log('Is Home Page:', isHomePage);
    console.log('Is Search Page:', isSearchPage);
    console.log('Search Query:', qParam);
    
    // Check if component should be hidden
    checkVisibilitySettings();
  }, []);
  
  // Check if the component should be visible based on user preferences
  const checkVisibilitySettings = () => {
    // Check if disabled globally
    if (localStorage.getItem('searchgpt_disabled_globally') === 'true') {
      setIsVisible(false);
      return;
    }
    
    // Check if hidden for current session
    if (sessionStorage.getItem('searchgpt_hidden') === 'true') {
      setIsVisible(false);
      return;
    }
    
    // Check if disabled for this specific site
    const hostname = window.location.hostname;
    const disabledSites = JSON.parse(localStorage.getItem('searchgpt_disabled_sites') || '[]');
    if (disabledSites.includes(hostname)) {
      setIsVisible(false);
      return;
    }
    
    // If none of the conditions are met, show the component
    setIsVisible(true);
  };

  const getExtensionUrl = (path: string): string => {
    // Check if chrome.runtime is available
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
      return chrome.runtime.getURL(path);
    }
    
    // Fallback for development environment
    return `/${path}`;
  };

  // Add conversation to chat history in localStorage
  const addConversationToChatHistory = (userMessage: string, aiResponse: string) => {
    // Get existing chat history
    let chatHistory = [];
    try {
      const savedHistory = localStorage.getItem('chatHistory');
      if (savedHistory) {
        chatHistory = JSON.parse(savedHistory);
      }
    } catch (error) {
      console.error('Error parsing chat history:', error);
      chatHistory = [];
    }
    
    // Add new conversation
    chatHistory.push(
      { message: userMessage, type: 'user' },
      { message: aiResponse, type: 'assistant' }
    );
    
    // Save back to localStorage
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    
    return chatHistory;
  };

  // Handle continue to chat action
  const handleContinueToChat = () => {
    // Save the current conversation to chat history
    if (currentPrompt && analysisResult) {
      addConversationToChatHistory(currentPrompt, analysisResult);
      
      // Open the extension side panel
      chrome.runtime.sendMessage({
        type: 'OPEN_SIDE_PANEL',
        data: { fromContentScript: true }
      });
    }
  };

  // Handle close button click
  const handleClose = () => {
    setIsVisible(false);
    // This hides the component until the page is refreshed
    sessionStorage.setItem('searchgpt_hidden', 'true');
  };

  const handleAskClick = async (customPrompt?: string) => {
    setLoading(true);
    try {
      // Use customPrompt if provided, otherwise use just the 'q' parameter value
      const prompt = customPrompt || (qParam ? qParam : '');
      if (!prompt) return;

      // Store the current prompt for later use
      setCurrentPrompt(prompt);

      console.log('Sending prompt to API:', prompt);
      const { chatId, response } = await inBrowerContent(prompt);
      setAnalysisResult(response);
      setChatId(chatId);
    } catch (error) {
      console.error('AI content fetch failed:', error);
      setAnalysisResult('Failed to load content.');
      setChatId(null);
    } finally {
      setLoading(false);
    }
  };

  // If the component should not be visible, don't render anything
  if (!isVisible) {
    return null;
  }

  // UI to show when on home page
  if (isHomePage) {
    return (
      <GoogleHomeAISearch
        onSubmit={handleAskClick}
        analysisResult={analysisResult}
        loading={loading}
        chatId={chatId}
        currentPrompt={currentPrompt}
        onContinueToChat={handleContinueToChat}
        onClose={handleClose}
      />
    );
  }

  // UI to show for search result page
  if (isSearchPage) {
    return (
      <div style={{
        position: 'fixed',
        top: '100px',
        right: '20px',
        backgroundColor: 'white',
        borderRadius: '8px', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        width: '400px',
        fontFamily: 'Arial, sans-serif',
        border: '1px solid #e0e0e0',
        zIndex: 9999
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: analysisResult ? '1px solid #e0e0e0' : 'none'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img 
              src={getExtensionUrl("icons/icon128.png")} 
              width="24" 
              height="24" 
              alt="Search.com Logo" 
              style={{ borderRadius: '50%' }}
            />
            <span style={{ fontWeight: 500, color: '#333', fontSize: '14px' }}><em>SearchGPT Sidebar</em></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Options dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => {
                  const menu = document.getElementById('searchgpt-options-menu');
                  if (menu) {
                    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
                  }
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M19 13C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11C18.4477 11 18 11.4477 18 12C18 12.5523 18.4477 13 19 13Z" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M5 13C5.55228 13 6 12.5523 6 12C6 11.4477 5.55228 11 5 11C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13Z" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              
              {/* Options menu */}
              <div
                id="searchgpt-options-menu"
                style={{
                  display: 'none',
                  position: 'absolute',
                  top: '30px',
                  right: '0',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                  width: '180px',
                  zIndex: 10000,
                }}
              >
                <div
                  style={{
                    padding: '10px 12px',
                    fontSize: '14px',
                    borderBottom: '1px solid #f0f0f0',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    sessionStorage.setItem('searchgpt_hidden', 'true');
                    setIsVisible(false);
                  }}
                >
                  Hide until next visit
                </div>
                <div
                  style={{
                    padding: '10px 12px',
                    fontSize: '14px',
                    borderBottom: '1px solid #f0f0f0',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    const hostname = window.location.hostname;
                    const disabledSites = JSON.parse(localStorage.getItem('searchgpt_disabled_sites') || '[]');
                    if (!disabledSites.includes(hostname)) {
                      disabledSites.push(hostname);
                      localStorage.setItem('searchgpt_disabled_sites', JSON.stringify(disabledSites));
                    }
                    setIsVisible(false);
                  }}
                >
                  Disable for this site
                </div>
                <div
                  style={{
                    padding: '10px 12px',
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    localStorage.setItem('searchgpt_disabled_globally', 'true');
                    setIsVisible(false);
                  }}
                >
                  Disable globally
                </div>
              </div>
            </div>
            
            {/* Close button */}
            <button
              onClick={handleClose}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 6L18 18" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            <button
              onClick={() => handleAskClick()}
              style={{
                backgroundColor: 'white',
                color: '#333',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
              disabled={loading}
            >
              {loading ? 'Thinking...' : 'Ask SearchGPT'}
            </button>
          </div>
        </div>
  
        {analysisResult && (
          <>
            <div
              style={{
                padding: '12px 16px',
                fontSize: '14px',
                lineHeight: '1.5',
                color: '#333',
                maxHeight: '500px',
                overflowY: 'auto',
              }}
              dangerouslySetInnerHTML={{ __html: analysisResult }}
            />
  
            <div style={{ padding: '8px 16px', textAlign: 'center', borderTop: '1px solid #e0e0e0' }}>
              <button  
                onClick={handleContinueToChat}
                style={{
                  display: 'inline-block',
                  fontSize: '14px',
                  color: '#10A37F',
                  textDecoration: 'none',
                  fontWeight: 500,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                  Continue in Chat
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return null;
};