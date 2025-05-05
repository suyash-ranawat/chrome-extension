import React, { useState, useRef, useEffect } from 'react';
import { User, getUser, signOut } from '@/services/auth';

interface UserMenuProps {
  onSignOut: () => void;
  onViewProfile: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ onSignOut, onViewProfile }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getUser();
      setUser(userData);
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
    onSignOut();
  };

  const handleProfileClick = () => {
    setIsOpen(false);
    onViewProfile();
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="flex items-center space-x-1 focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 overflow-hidden">
          {user.avatar ? (
            <img src={user.avatar} alt={user.username} className="h-full w-full object-cover" />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          )}
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 py-2 bg-white rounded-md shadow-lg z-10">
          <div className="px-4 py-2 border-b border-gray-100">
            <div className="font-medium text-gray-800">{user.username}</div>
            <div className="text-xs text-gray-500">{user.email}</div>
          </div>
          
          <button
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={handleProfileClick}
          >
            Profile Settings
          </button>
          
          <button
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={handleSignOut}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;