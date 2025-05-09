import React from 'react';

interface TopNavigationProps {
  onNewConversation: () => void;
  isAuthenticated: boolean;
  username?: string;
  onAuthClick: () => void;
}

const TopNavigation: React.FC<TopNavigationProps> = ({ 
  onNewConversation, 
  isAuthenticated,
  username,
  onAuthClick
}) => {
  return (
    <div className="border-b border-gray-200 bg-white">
      {/* Main navigation row */}
      <div className="flex items-center justify-between p-2">
        <div className="flex items-center">
        <img 
    src={chrome.runtime.getURL("icons/icon128.png")} 
    className="h-8 w-8 rounded-full mr-2" 
    alt="Chat Logo" 
  />
          <span className="font-semibold text-lg">Chat</span>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            className="flex items-center px-2 py-1 hover:bg-gray-100 rounded"
            onClick={onNewConversation}
          >
            <span className="font-medium mr-1">+</span>
            <span>New Conversation</span>
          </button>
          
        </div>
      </div>
      
      {/* Sign In/Profile button in a separate row, right-aligned */}
      <div className="flex items-center justify-between p-2">
      
        {/* User info displayed in subtle style */}
          {isAuthenticated ? (
            <div 
              className="flex items-center text-xs text-gray-700 bg-gray-50 px-2 py-1 rounded cursor-pointer hover:bg-gray-100"
              onClick={onAuthClick}
            >
              <div className="h-5 w-5 rounded-full bg-green-500 text-white flex items-center justify-center mr-1.5 text-[10px] font-semibold">
                {username ? username.charAt(0).toUpperCase() : 'U'}
              </div>
              <span>{username || 'User'}</span>
            </div>
          ) : (
            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">
              Guest Mode
            </span>
          )}
	  
        <button
          onClick={onAuthClick}
          className="text-blue-600 font-medium text-sm bg-white py-1 px-5 rounded-md border border-gray-200 hover:bg-blue-50"
        >
          {isAuthenticated ? 'Profile' : 'Sign In'}
        </button>
      </div>
    </div>
  );
};

export default TopNavigation;