// src/content/GoogleHomeAISearch.tsx
import React, { useState, useRef, useEffect } from 'react';

interface GoogleHomeAISearchProps {
  onSubmit: (prompt: string) => Promise<void>;
  analysisResult: string | null;
  loading: boolean;
  chatId: string | null;
}

export const GoogleHomeAISearch: React.FC<GoogleHomeAISearchProps> = ({
  onSubmit,
  analysisResult,
  loading,
  chatId,
}) => {
  const [prompt, setPrompt] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSubmit(prompt.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsExpanded(false);
    }
  };

  const handleCopyResult = () => {
    if (analysisResult) {
      const plainText = analysisResult.replace(/<[^>]*>/g, '');
      navigator.clipboard.writeText(plainText);
    }
  };

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    top: '100px',
    right: '20px',
    width: isExpanded ? '584px' : '350px',
    maxWidth: '90vw',
    backgroundColor: 'white',
    borderRadius: '24px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.15)',
    transition: 'all 0.3s ease',
    zIndex: 1000,
    overflow: 'hidden',
    fontFamily: 'Arial, sans-serif',
  };
  

  const headerStyle = {
    display: 'flex' as const,
    alignItems: 'center' as const,
    padding: '12px 16px',
    borderBottom: '1px solid rgba(0,0,0,0.08)',
  };

  const logoContainerStyle = {
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: '10px',
  };

  const logoCircleStyle = {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#10A37F',
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  };

  const modelSelectorStyle = {
    marginLeft: 'auto',
    padding: '4px 8px',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: '8px',
    fontSize: '12px',
    color: '#666',
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: '4px',
  };

  const inputContainerStyle = {
    display: 'flex' as const,
    padding: isExpanded ? '16px' : '12px 16px',
    position: 'relative' as const,
    borderBottom: analysisResult ? '1px solid rgba(0,0,0,0.08)' : 'none',
  };

  const inputStyle = {
    flex: 1,
    padding: isExpanded ? '12px 16px' : '8px 12px',
    fontSize: isExpanded ? '15px' : '14px',
    border: isInputFocused ? '1px solid #10A37F' : '1px solid rgba(0,0,0,0.1)',
    borderRadius: '12px',
    outline: 'none',
    backgroundColor: isExpanded ? 'white' : 'rgba(0,0,0,0.03)',
    transition: 'all 0.2s ease',
  };

  const buttonStyle = {
    position: 'absolute' as const,
    right: isExpanded ? '24px' : '20px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: loading ? '#E5E5E5' : '#10A37F',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: isExpanded ? '8px 16px' : '6px 12px',
    fontSize: isExpanded ? '14px' : '13px',
    cursor: loading ? 'default' : 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: '4px',
  };

  const resultsContainerStyle = {
    padding: '16px 20px',
    maxHeight: '400px',
    overflowY: 'auto' as const,
  };

  const resultContentStyle = {
    fontSize: '14px',
    lineHeight: '1.5',
    color: '#333',
  };

  const actionsStyle = {
    marginTop: '16px',
    display: 'flex' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingTop: '12px',
    borderTop: '1px solid rgba(0,0,0,0.08)',
  };

  const linkStyle = {
    color: '#10A37F',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 500,
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: '4px',
  };

  const copyButtonStyle = {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#666',
    fontSize: '14px',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '4px',
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: '4px',
  };

  const examplesContainerStyle = {
    padding: '8px 16px 20px',
  };

  const exampleStyle = {
    padding: '10px 14px',
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: '8px',
    fontSize: '13px',
    cursor: 'pointer',
    color: '#333',
    transition: 'background-color 0.2s ease',
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div style={logoContainerStyle}>
          <div style={logoCircleStyle}>
            <svg width="16" height="16" viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg">
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
          </div>
          <span style={{ fontWeight: 600, fontSize: '16px', color: '#111' }}>
            AI Assistant
          </span>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div style={inputContainerStyle}>
          <input
            ref={inputRef}
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onFocus={() => {
              setIsExpanded(true);
              setIsInputFocused(true);
            }}
            onBlur={() => setIsInputFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder={isExpanded ? "Ask me anything..." : "Ask AI Assistant"}
            style={inputStyle}
          />
          
          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            style={buttonStyle}
          >
            {loading ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="loading-spinner">
                  <circle cx="12" cy="12" r="10" stroke="#666" strokeWidth="4" strokeLinecap="round" strokeDasharray="30 30" strokeDashoffset="0">
                    <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
                  </circle>
                </svg>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Ask</span>
              </>
            )}
          </button>
        </div>
      </form>
      
      {analysisResult && (
        <div style={resultsContainerStyle}>
          <div 
            className="results-container"
            style={resultContentStyle}
            dangerouslySetInnerHTML={{ __html: analysisResult }}
          />
          
          {chatId && (
            <div style={actionsStyle}>
              <a
                href={`https://search.com/chat/${chatId}`}
                target="_blank"
                rel="noopener noreferrer"
                style={linkStyle}
              >
                <span>Continue in chat</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 17L17 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 7H17V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
              <button
                onClick={handleCopyResult}
                style={copyButtonStyle}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 3H4C3.44772 3 3 3.44772 3 4V16C3 16.5523 3.44772 17 4 17H16C16.5523 17 17 16.5523 17 16V4C17 3.44772 16.5523 3 16 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M17 13H20C20.5523 13 21 12.5523 21 12V4C21 3.44772 20.5523 3 20 3H12C11.4477 3 11 3.44772 11 4V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Copy</span>
              </button>
            </div>
          )}
        </div>
      )}
      
      {isExpanded && !analysisResult && !loading && (
        <div style={examplesContainerStyle}>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>
            Try asking:
          </p>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            {["What's the weather like in New York?", "Explain quantum computing", "Write a poem about technology"].map((example, index) => (
              <div
                key={index}
                onClick={() => {
                  setPrompt(example);
                  if (inputRef.current) inputRef.current.focus();
                }}
                style={exampleStyle}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.03)')}
              >
                {example}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};