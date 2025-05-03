import React from 'react';

interface TopNavigationProps {
  onNewConversation: () => void;
}

const TopNavigation: React.FC<TopNavigationProps> = ({ onNewConversation }) => {
  return (
    <div className="flex items-center border-b border-gray-200 p-2 bg-white">
      <div className="flex items-center">
        <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center mr-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-5 h-5">
            <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
          </svg>
        </div>
        <span className="font-semibold text-lg">Chat</span>
      </div>
      <div className="ml-4 flex items-center">
        <button 
          className="flex items-center px-2 py-1 hover:bg-gray-100 rounded"
          onClick={onNewConversation}
        >
          <span className="font-medium mr-1">+</span>
          <span>New Conversation</span>
        </button>
      </div>
      <div className="ml-auto flex items-center">
        <button className="p-1 rounded-full hover:bg-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default TopNavigation;