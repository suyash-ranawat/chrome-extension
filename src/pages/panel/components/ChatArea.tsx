import React from 'react';
import ReactMarkdown from 'react-markdown';
import classNames from 'classnames';
import { Message } from '../App';

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

const ChatArea: React.FC<ChatAreaProps> = ({ messages, isLoading, messagesEndRef }) => {
  return (
    <div className="flex-1 overflow-auto p-4 space-y-4">
      {messages.map((message, index) => (
        <div
          key={index}
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
              <div
                className="prose"
                dangerouslySetInnerHTML={{ __html: message.content }}
              />
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