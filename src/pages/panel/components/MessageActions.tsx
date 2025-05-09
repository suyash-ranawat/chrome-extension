import React, { useState } from 'react';
import { sendChatMessage } from '@/services/api';

interface MessageActionsProps {
  content: string;
  onRewriteSuccess: (newContent: string) => void;
}

const MessageActions: React.FC<MessageActionsProps> = ({ content, onRewriteSuccess }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);

  // Handle copy functionality
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy text: ', err);
      // Fallback copy method
      fallbackCopy(content);
    }
  };

  // Fallback copy method for browsers that don't support clipboard API
  const fallbackCopy = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // Make the textarea out of viewport
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } else {
        console.error('Failed to copy with execCommand');
      }
    } catch (err) {
      console.error('Error in fallback copy: ', err);
    }
    
    document.body.removeChild(textArea);
  };

  // Handle rewrite functionality
  const handleRewrite = async () => {
    setIsRewriting(true);
    try {
      const originalText = `Please rewrite ${content}`;
      const currentChatId = localStorage.getItem('currentChatId');
      
      const { response } = await sendChatMessage(originalText, currentChatId);
      onRewriteSuccess(response);
    } catch (error) {
      console.error('Rewrite failed:', error);
    } finally {
      setIsRewriting(false);
    }
  };

  return (
    <div className="flex gap-2 mt-2 text-option-buttons">
      {/* Copy button */}
      <button
        onClick={handleCopy}
        disabled={isCopied}
        className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
      >
        {isCopied ? (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Copied</span>
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>Copy</span>
          </>
        )}
      </button>

      {/* Rewrite button */}
      <button
        onClick={handleRewrite}
        disabled={isRewriting}
        className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
      >
        {isRewriting ? (
          <>
            <svg className="animate-spin h-3 w-3 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Rewriting...</span>
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Rewrite</span>
          </>
        )}
      </button>
    </div>
  );
};

export default MessageActions;