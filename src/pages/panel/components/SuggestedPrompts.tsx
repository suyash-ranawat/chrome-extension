import React from 'react';

interface SuggestedPromptsProps {
  onPromptClick: (promptText: string) => void;
}

// Define prompt data structure for reusability
interface PromptSuggestion {
  id: string;
  icon: React.ReactNode;
  iconColor: string;
  title: string;
  description: string;
  prompt: string;
}

const SuggestedPrompts: React.FC<SuggestedPromptsProps> = ({ onPromptClick }) => {
  // Prompt suggestions data
  const promptSuggestions: PromptSuggestion[] = [
    {
      id: 'explain',
      icon: '🧠',
      iconColor: 'text-orange-500',
      title: 'Explain a complex thing',
      description: 'Explain Artificial Intelligence so that I can explain it to my six-year-old child.',
      prompt: 'Explain Artificial Intelligence so that I can explain it to my six-year-old child.'
    },
    {
      id: 'suggestions',
      icon: '💡',
      iconColor: 'text-pink-500',
      title: 'Get suggestions and create new ideas',
      description: 'Please give me the best 10 travel ideas around the world',
      prompt: 'Please give me the best 10 travel ideas around the world'
    },
    {
      id: 'translate',
      icon: '🔤',
      iconColor: 'text-purple-300',
      title: 'Translate, summarize, fix grammar and more...',
      description: 'Translate "I love you" French',
      prompt: 'Translate "I love you" French'
    }
  ];

  return (
    <div className="px-4 py-3 overflow-auto">
      {promptSuggestions.map((suggestion) => (
        <div 
          key={suggestion.id}
          className="mb-4 bg-gray-100 rounded-lg p-4 hover:bg-gray-200 cursor-pointer"
          onClick={() => onPromptClick(suggestion.prompt)}
        >
          <div className="flex">
            <div className={`mr-2 mt-1 ${suggestion.iconColor} text-lg`}>{suggestion.icon}</div>
            <div className="flex-1">
              <div className="font-semibold">{suggestion.title}</div>
              <div className="text-sm text-gray-600">{suggestion.description}</div>
            </div>
            <div className="ml-2 text-gray-500">→</div>
          </div>
        </div>
      ))}

      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex">
          <div className="mr-2">
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <div className="font-semibold">GPT-4o Mini</div>
            <div className="text-sm text-gray-600">Hello, how can I help you today?</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuggestedPrompts;