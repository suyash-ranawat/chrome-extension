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
            <svg width="24" height="24" viewBox="0 0 41 41" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20.5" cy="20.5" r="20.5" fill="#10A37F"/>
              <path d="M12.6364 20.7649C12.6364 16.7281 15.9155 13.449 19.9523 13.449C23.9891 13.449 27.2682 16.7281 27.2682 20.7649C27.2682 24.8017 23.9891 28.0808 19.9523 28.0808C15.9155 28.0808 12.6364 24.8017 12.6364 20.7649Z" stroke="white" strokeWidth="2.5"/>
              <path d="M20.4523 13.449V10" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M27.4523 20.5L30.9045 20.5" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M20.4523 31.5V28.0808" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M13.4523 20.5L10 20.5" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M25.5001 15.4019L28.0001 13" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M25.5001 26.098L28.0001 28.5" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M15.5001 26.098L13.0001 28.5" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M15.5001 15.4019L13.0001 13" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
            <span style={{ fontWeight: 500, color: '#333', fontSize: '14px' }}>Search.com Sidebar</span>
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
              {loading ? 'Thinking...' : 'Ask AI'}
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
                maxHeight: '300px',
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