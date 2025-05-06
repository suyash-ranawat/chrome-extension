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
  currentView: 'chat' | 'search' | 'write' | 'image' | 'file' | 'auth' | 'profile';
  onViewChange: (view: 'chat' | 'search' | 'write' | 'image' | 'file' | 'auth' | 'profile') => void;
  isAuthenticated: boolean;
}

const SideIcons: React.FC<SideIconsProps> = ({ currentView, onViewChange, isAuthenticated }) => {
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
        
        {/* Auth/Profile button - shows Sign In or Profile based on auth state */}
        <div className="flex flex-col items-center">
          <button 
            className={iconClasses(isAuthenticated ? 'profile' : 'auth')} 
            title={isAuthenticated ? "Profile" : "Sign In"}
            onClick={() => onViewChange(isAuthenticated ? 'profile' : 'auth')}
          >
            <UserCircleIcon className="w-6 h-6" />
          </button>
          <span className="text-xs mt-1">{isAuthenticated ? "Profile" : "Sign In"}</span>
        </div>
        
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