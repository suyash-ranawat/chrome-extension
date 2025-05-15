import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import classNames from 'classnames';
import { Message } from '../App';
import MessageActions from './MessageActions';

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  onMessageUpdate: (index: number, newContent: string) => void;
}

const ChatArea: React.FC<ChatAreaProps> = ({ 
  messages, 
  isLoading, 
  messagesEndRef,
  onMessageUpdate
}) => {
  // Use useMemo to deduplicate messages only when the messages array changes
  const displayMessages = useMemo(() => {
    // Create a map to detect duplicates - we'll consider a message duplicate if:
    // 1. Same role and content
    // 2. Adjacent in the array (back-to-back)
    const uniqueMessages: Message[] = [];
    
    messages.forEach((message, index) => {
      // Check if this message is the same as the previous one
      const prevMessage = uniqueMessages[uniqueMessages.length - 1];
      const isDuplicate = prevMessage && 
                          prevMessage.role === message.role && 
                          prevMessage.content === message.content;
      
      // Only add if it's not a duplicate
      if (!isDuplicate) {
        uniqueMessages.push(message);
      }
    });
    
    return uniqueMessages;
  }, [messages]);
  
  return (
    <div className="flex-1 overflow-auto p-4 space-y-4">
      {displayMessages.map((message, index) => (
        <div
          key={`message-${index}-${message.role}`}
          className={classNames(
            'flex',
            message.role === 'user' ? 'justify-end' : 'justify-start'
          )}
        >
          <div
            className={classNames(
              'max-w-[80%] rounded-lg p-3',
              message.role === 'user'
                ? 'bg-gray-100 text-gray-800'
                : ''
            )}
          >
            {message.role === 'assistant' ? (
              <>
                <div
                  className="prose"
                  dangerouslySetInnerHTML={{ __html: message.content }}
                />
                <MessageActions 
                  content={message.content.replace(/<[^>]*>/g, '')} // Strip HTML tags for clean text
                  onRewriteSuccess={(newContent) => {
                    // Find the correct index in the original array
                    const originalIndex = messages.findIndex(
                      (msg, i) => i >= index && msg.role === message.role && msg.content === message.content
                    );
                    onMessageUpdate(originalIndex !== -1 ? originalIndex : index, newContent);
                  }}
                />
              </>
            ) : (
              <ReactMarkdown className="prose">
                {message.content}
              </ReactMarkdown>
            )}
          </div>
        </div>
      ))}
      
      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-gray-100 rounded-lg p-3 text-gray-800">
            <div className="flex items-center">
              <div className="animate-pulse flex space-x-2">
                <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
              </div>
              <span className="ml-2">Thinking...</span>
            </div>
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatArea;