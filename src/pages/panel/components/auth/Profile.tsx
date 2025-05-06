import React, { useState, useEffect } from 'react';
import { User } from '@/services/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface ProfileProps {
  user: User | null;
  onSignOut: () => Promise<void>;
  onUpdate?: (userData: Partial<User>) => Promise<boolean>;
  error?: string | null;
}

const Profile: React.FC<ProfileProps> = ({ 
  user, 
  onSignOut, 
  onUpdate,
  error 
}) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setEmail(user.email || '');
    }
  }, [user]);

  // Handle profile update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!onUpdate) return;
    
    setIsLoading(true);
    setSuccessMessage(null);
    
    try {
      const success = await onUpdate({ username });
      if (success) {
        setSuccessMessage('Profile updated successfully');
        setIsEditMode(false);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle logout
  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await onSignOut();
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // Show error if user data is missing
  if (!user) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600 mb-4">Error: User data not available</p>
        <Button variant="primary" onClick={handleSignOut}>
          Back to Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Your Profile</h2>
        <Button 
          variant="outline" 
          onClick={handleSignOut}
          className="text-red-600 border-red-600 hover:bg-red-50"
        >
          Log Out
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md text-sm">
          {successMessage}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center mb-6">
          <div className="h-16 w-16 bg-green-500 rounded-full flex items-center justify-center text-white text-xl font-semibold mr-4">
            {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h3 className="font-medium text-lg">{user.username || 'User'}</h3>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>

        {isEditMode ? (
          <form onSubmit={handleUpdateProfile}>
            <div className="mb-4">
              <Input
                label="Username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                fullWidth
              />
            </div>
            
            <div className="mb-4">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled
                fullWidth
              />
              <p className="text-xs text-gray-500 mt-1">
                Email cannot be changed
              </p>
            </div>

            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditMode(false);
                  if (user) {
                    setUsername(user.username || '');
                    setEmail(user.email || '');
                  }
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
              >
                Save Changes
              </Button>
            </div>
          </form>
        ) : (
          <div className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditMode(true)}
            >
              Edit Profile
            </Button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-medium mb-4">Account Information</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <div>
              <p className="text-sm font-medium">Account Type</p>
              <p className="text-sm text-gray-600">
                {user.isEmailVerified ? 'Verified User' : 'Standard User'}
              </p>
            </div>
          </div>
          
          {user.phoneNumber && (
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <div>
                <p className="text-sm font-medium">Phone Number</p>
                <p className="text-sm text-gray-600">{user.phoneNumber}</p>
              </div>
            </div>
          )}
          
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <div>
              <p className="text-sm font-medium">Member Since</p>
              <p className="text-sm text-gray-600">
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;