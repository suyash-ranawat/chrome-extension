import React, { useState } from 'react';

interface InputAreaProps {
  input: string;
  setInput: (input: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({ input, setInput, handleSubmit, isLoading }) => {
  const [webAccessEnabled, setWebAccessEnabled] = useState(false);

  return (
    <div className="p-4 border-t">
      <form onSubmit={handleSubmit} className="w-full">
        <div className="flex items-center relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            className="flex-1 p-3 rounded-full border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-400 pr-14"
            disabled={isLoading}
          />
          <div className="absolute right-0 flex items-center mr-2">
            <button 
              type="submit"
              disabled={isLoading}
              className="p-1 hover:bg-gray-100 rounded-full mr-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </div>
        </div>
        {/* For future use */}
        {/* <div className="flex items-center justify-between mt-2 px-2">
          <div className="flex items-center">
            <button 
              type="button" 
              className="flex items-center text-sm text-gray-500 hover:text-gray-700"
              onClick={() => setWebAccessEnabled(!webAccessEnabled)}
            >
              <span className="mr-1">@</span>
              <div className="h-4 w-8 bg-gray-200 rounded-full ml-1 relative">
                <div 
                  className={`h-4 w-4 bg-gray-100 rounded-full absolute transition-all ${
                    webAccessEnabled ? 'left-4' : 'left-0'
                  }`}
                ></div>
              </div>
            </button>
          </div>
          <div>
            <button 
              type="submit"
              disabled={isLoading}
              className="p-1 rounded hover:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div> */}
      </form>
      {/* For future use */}
      {/* <div className="mt-2 text-center">
        <span className="text-xs text-green-500 cursor-pointer hover:underline">
          Make a Review & Earn Credit ❤️
        </span>
      </div> */}
    </div>
  );
};

export default InputArea;