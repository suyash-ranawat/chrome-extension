import React from 'react';
import { 
  ChatBubbleLeftIcon,
  PencilSquareIcon, 
  MagnifyingGlassIcon, 
  PhotoIcon, 
  PaperClipIcon, 
  ArrowsPointingOutIcon, 
  UserCircleIcon 
} from '@heroicons/react/24/outline';

interface SideIconsProps {
  currentView: 'chat' | 'search' | 'write' | 'image' | 'file';
  onViewChange: (view: 'chat' | 'search' | 'write' | 'image' | 'file') => void;
}

const SideIcons: React.FC<SideIconsProps> = ({ currentView, onViewChange }) => {
  const iconClasses = (view: string) => 
    `p-2 rounded ${currentView === view ? 'bg-gray-100' : 'hover:bg-gray-100'}`;

  return (
    <div className="flex flex-col items-center py-4 bg-white border-l border-gray-200">
      <div className="flex flex-col gap-6 mt-4">
        <div className="flex flex-col items-center">
          <button 
            className={iconClasses('chat')} 
            title="Chat"
            onClick={() => onViewChange('chat')}
          >
            <ChatBubbleLeftIcon className="w-6 h-6" />
          </button>
          <span className="text-xs mt-1">Chat</span>
        </div>
        {/* For future use */}
        {/* <div className="flex flex-col items-center">
          <button 
            className={iconClasses('ask')} 
            title="Ask"
            onClick={() => onViewChange('chat')} // Also uses chat view
          >
            <UserCircleIcon className="w-6 h-6" />
          </button>
          <span className="text-xs mt-1">Ask</span>
        </div>
        <div className="flex flex-col items-center">
          <button 
            className={iconClasses('search')} 
            title="Search"
            onClick={() => onViewChange('search')}
          >
            <MagnifyingGlassIcon className="w-6 h-6" />
          </button>
          <span className="text-xs mt-1">Search</span>
        </div>
        <div className="flex flex-col items-center">
          <button 
            className={iconClasses('write')} 
            title="Write"
            onClick={() => onViewChange('write')}
          >
            <PencilSquareIcon className="w-6 h-6" />
          </button>
          <span className="text-xs mt-1">Write</span>
        </div>
        <div className="flex flex-col items-center">
          <button 
            className={iconClasses('image')} 
            title="Image"
            onClick={() => onViewChange('image')}
          >
            <PhotoIcon className="w-6 h-6" />
          </button>
          <span className="text-xs mt-1">Image</span>
        </div>
        <div className="flex flex-col items-center">
          <button 
            className={iconClasses('file')} 
            title="ChatFile"
            onClick={() => onViewChange('file')}
          >
            <PaperClipIcon className="w-6 h-6" />
          </button>
          <span className="text-xs mt-1">ChatFile</span>
        </div> */}
        <div className="flex flex-col items-center">
          <button 
            className="p-2 hover:bg-gray-100 rounded" 
            title="Full Page"
            onClick={() => {
              // Implement full page functionality - could open in new tab or expand UI
              window.open(window.location.href, '_blank');
            }}
          >
            <ArrowsPointingOutIcon className="w-6 h-6" />
          </button>
          <span className="text-xs mt-1">Full Page</span>
        </div>
      </div>
    </div>
  );
};

export default SideIcons;