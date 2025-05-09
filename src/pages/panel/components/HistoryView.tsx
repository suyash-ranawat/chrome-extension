import React, { useState, useEffect } from 'react';
import { getChatHistory as apiGetChatHistory } from '@/services/auth';

interface HistoryViewProps {
  onSelectChat: (chatId: string) => void;
}

interface ChatHistoryItem {
  id: string;
  name: string;
  first_message: string;
  message_count: number;
  created_at: string;
  updated_at: string;
  last_updated: number;
}

const HistoryView: React.FC<HistoryViewProps> = ({ onSelectChat }) => {
  const [chatHistory, setChatHistory] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  // Fetch chat history when component mounts
  useEffect(() => {
    const fetchChatHistory = async () => {
      setIsLoading(true);
      try {
        const history = await apiGetChatHistory();

        // Set the grouped chat history data dynamically
        if (history && Object.keys(history).length > 0) {
          setChatHistory(history);
        } else {
          throw new Error('No valid chat history data received');
        }
      } catch (err) {
        console.error('Failed to fetch chat history:', err);
        setError('Failed to load chat history. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatHistory();
  }, []);

  // Handle chat selection
  const handleChatSelect = (chatId: string) => {
    setSelectedChatId(chatId);
    onSelectChat(chatId);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          Retry
        </button>
      </div>
    );
  }

  // Empty state when no chat data is available
  if (Object.keys(chatHistory).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-gray-500">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-16 w-16 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <h3 className="text-lg font-medium mb-2">No Chat History</h3>
        <p className="text-center mb-4">
          You don't have any chat history yet. Start a conversation to see it here.
        </p>
      </div>
    );
  }

  // Function to truncate text after a certain length
  const truncateText = (text: string, maxLength: number) => {
    if (text.length > maxLength) {
      return text.slice(0, maxLength) + '...';
    }
    return text;
  };

  // Render history dynamically for each category (Today, Yesterday, Previous 7 Days, etc.)
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold">Chat History</h2>
        <p className="text-sm text-gray-500">Select a chat to continue the conversation</p>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {Object.keys(chatHistory).map((category) => (
          chatHistory[category] && chatHistory[category].length > 0 && (
            <div className="mt-4" key={category}>
              <h3 className="text-lg font-semibold text-gray-700">{category}</h3>
              {chatHistory[category].map((chat: ChatHistoryItem) => (
                <div
                  key={chat.id}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${selectedChatId === chat.id ? 'bg-gray-100' : ''}`}
                  onClick={() => handleChatSelect(chat.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium truncate">{truncateText(chat.name, 30)}</h3>
                      <p className="text-sm text-gray-500 truncate">{truncateText(chat.first_message, 30)}</p>
                    </div>
                    <div className="text-xs text-gray-400 whitespace-nowrap ml-4">
                      {new Date(chat.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ))}
      </div>
    </div>
  );
};

export default HistoryView;
