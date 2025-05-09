// src/content/ContentScriptComponent.tsx
import React, { useState, useEffect } from 'react';
import { inBrowerContent } from '@/services/api';
import { GoogleHomeAISearch } from './GoogleHomeAISearch';

export const ContentScriptComponent = () => {
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
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
  }, []);


  const getExtensionUrl = (path: string): string => {
    // Check if chrome.runtime is available
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
      return chrome.runtime.getURL(path);
    }
    
    // Fallback for development environment
    return `/${path}`;
  };

  const handleAskClick = async (customPrompt?: string) => {
    setLoading(true);
    try {
      // Use customPrompt if provided, otherwise use just the 'q' parameter value
      const prompt = customPrompt || (qParam ? qParam : '');
      if (!prompt) return;

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

  // UI to show when on home page
  if (isHomePage) {
    return (
      <GoogleHomeAISearch
        onSubmit={handleAskClick}
        analysisResult={analysisResult}
        loading={loading}
        chatId={chatId}
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
        width: '350px',
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
  
          {chatId && (
              <div style={{ padding: '8px 16px', textAlign: 'center', borderTop: '1px solid #e0e0e0' }}>
                <a  
                  href={`https://search.com/chat/${chatId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    fontSize: '14px',
                    color: '#10A37F',
                    textDecoration: 'none',
                    fontWeight: 500
                  }}
                >
                  Continue in Chat
                </a>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  return null;
};