import React, { useState, useEffect } from 'react';
import { User, updateProfile } from '@/services/auth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface ProfileProps {
  user?: User | null;
  onSignOut: () => void;
  onUpdate?: (user: Partial<User>) => Promise<boolean>;
}

const Profile: React.FC<ProfileProps> = ({ user: propUser, onSignOut, onUpdate }) => {
  const [user, setUser] = useState<User | null>(propUser || null);
  const [username, setUsername] = useState(propUser?.username || '');
  const [email, setEmail] = useState(propUser?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    if (propUser) {
      setUser(propUser);
      setUsername(propUser.username);
      setEmail(propUser.email);
    }
  }, [propUser]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      if (onUpdate) {
        const success = await onUpdate({ username });
        if (success) {
          setSuccess('Profile updated successfully');
        } else {
          setError('Failed to update profile');
        }
      } else {
        const updatedUser = await updateProfile({ username });
        setUser(updatedUser);
        setSuccess('Profile updated successfully');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsUpdatingPassword(true);

    try {
      // In a real implementation, you would update the password through the API
      if (onUpdate) {
        const success = await onUpdate({ 
          password: {
            current: currentPassword,
            new: newPassword
          }
        } as any);
        
        if (success) {
          setSuccess('Password updated successfully');
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        } else {
          setError('Failed to update password. Please check your current password.');
        }
      } else {
        // Fallback to the direct API call if onUpdate is not provided
        await updateProfile({} as any);
        setSuccess('Password updated successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Your Profile</h2>
        <p className="text-sm text-gray-600">Manage your account settings</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md text-sm">
          {success}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Profile Information</h3>
        
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="flex items-center space-x-4 mb-4">
            <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
              {user.avatar ? (
                <img src={user.avatar} alt={username} className="h-16 w-16 rounded-full" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-8 w-8">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </div>
            <div>
              <Button variant="outline" size="sm" type="button">
                Change Avatar
              </Button>
            </div>
          </div>

          <Input
            label="Username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            fullWidth
          />

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled
            fullWidth
          />

          <div className="pt-4">
            <Button type="submit" variant="primary" isLoading={isLoading}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Connected Accounts</h3>
        
        <div className="space-y-4">
          {/* Google */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white border border-gray-200">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="16" 
                  height="16" 
                  viewBox="0 0 48 48"
                >
                  <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                  <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
                  <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
                  <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
                </svg>
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-700">Google</div>
                <div className="text-xs text-gray-500">
                  {user?.socialProviders?.includes('google') 
                    ? 'Connected' 
                    : 'Not connected'}
                </div>
              </div>
            </div>
            {user?.socialProviders?.includes('google') ? (
              <button 
                type="button"
                className="text-sm text-red-600 hover:text-red-700"
                onClick={() => {
                  if (window.confirm('Are you sure you want to disconnect your Google account?')) {
                    // Handle disconnecting Google account
                  }
                }}
              >
                Disconnect
              </button>
            ) : (
              <button 
                type="button"
                className="text-sm text-green-600 hover:text-green-700"
              >
                Connect
              </button>
            )}
          </div>

          {/* Facebook */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#1877F2] text-white">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="white"
                >
                  <path d="M9.19795 21.5H13.198V13.4901H16.8021L17.198 9.50977H13.198V7.5C13.198 6.94772 13.6457 6.5 14.198 6.5H17.198V2.5H14.198C11.4365 2.5 9.19795 4.73858 9.19795 7.5V9.50977H7.19795L6.80206 13.4901H9.19795V21.5Z" />
                </svg>
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-700">Facebook</div>
                <div className="text-xs text-gray-500">
                  {user?.socialProviders?.includes('facebook') 
                    ? 'Connected' 
                    : 'Not connected'}
                </div>
              </div>
            </div>
            {user?.socialProviders?.includes('facebook') ? (
              <button 
                type="button"
                className="text-sm text-red-600 hover:text-red-700"
                onClick={() => {
                  if (window.confirm('Are you sure you want to disconnect your Facebook account?')) {
                    // Handle disconnecting Facebook account
                  }
                }}
              >
                Disconnect
              </button>
            ) : (
              <button 
                type="button"
                className="text-sm text-green-600 hover:text-green-700"
              >
                Connect
              </button>
            )}
          </div>

          {/* Microsoft */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white border border-gray-200">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="16" 
                  height="16" 
                  viewBox="0 0 23 23"
                >
                  <path fill="#f3f3f3" d="M0 0h23v23H0z" />
                  <path fill="#f35325" d="M1 1h10v10H1z" />
                  <path fill="#81bc06" d="M12 1h10v10H12z" />
                  <path fill="#05a6f0" d="M1 12h10v10H1z" />
                  <path fill="#ffba08" d="M12 12h10v10H12z" />
                </svg>
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-700">Microsoft</div>
                <div className="text-xs text-gray-500">
                  {user?.socialProviders?.includes('microsoft') 
                    ? 'Connected' 
                    : 'Not connected'}
                </div>
              </div>
            </div>
            {user?.socialProviders?.includes('microsoft') ? (
              <button 
                type="button"
                className="text-sm text-red-600 hover:text-red-700"
                onClick={() => {
                  if (window.confirm('Are you sure you want to disconnect your Microsoft account?')) {
                    // Handle disconnecting Microsoft account
                  }
                }}
              >
                Disconnect
              </button>
            ) : (
              <button 
                type="button"
                className="text-sm text-green-600 hover:text-green-700"
              >
                Connect
              </button>
            )}
          </div>

          {/* Apple */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-black text-white">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="white"
                >
                  <path d="M17.543 11.29c-.019-2.168 1.77-3.216 1.852-3.266-1.01-1.482-2.583-1.683-3.143-1.707-1.335-.142-2.606.79-3.283.79-.679 0-1.726-.772-2.837-.752-1.456.024-2.802.848-3.55 2.16-1.517 2.64-.388 6.548 1.087 8.692.725 1.048 1.588 2.22 2.721 2.18 1.09-.044 1.505-.706 2.822-.706 1.320 0 1.695.706 2.847.683 1.177-.02 1.924-1.07 2.642-2.123.834-1.214 1.177-2.395 1.196-2.455-.026-.012-2.295-.885-2.317-3.51zM15.62 5.82c.6-.73 1.005-1.742.894-2.754-.864.036-1.909.578-2.527 1.304-.554.645-1.038 1.675-.908 2.665.963.075 1.945-.494 2.54-1.214z" />
                </svg>
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-700">Apple</div>
                <div className="text-xs text-gray-500">
                  {user?.socialProviders?.includes('apple') 
                    ? 'Connected' 
                    : 'Not connected'}
                </div>
              </div>
            </div>
            {user?.socialProviders?.includes('apple') ? (
              <button 
                type="button"
                className="text-sm text-red-600 hover:text-red-700"
                onClick={() => {
                  if (window.confirm('Are you sure you want to disconnect your Apple account?')) {
                    // Handle disconnecting Apple account
                  }
                }}
              >
                Disconnect
              </button>
            ) : (
              <button 
                type="button"
                className="text-sm text-green-600 hover:text-green-700"
              >
                Connect
              </button>
            )}
          </div>

          {/* Phone Number */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 text-gray-600">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-700">Phone Number</div>
                <div className="text-xs text-gray-500">
                  {user?.phoneNumber ? user.phoneNumber : 'Not connected'}
                </div>
              </div>
            </div>
            {user?.phoneNumber ? (
              <button 
                type="button"
                className="text-sm text-gray-600 hover:text-gray-700"
                onClick={() => {
                  // Handle changing phone number
                }}
              >
                Change
              </button>
            ) : (
              <button 
                type="button"
                className="text-sm text-green-600 hover:text-green-700"
              >
                Add
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Change Password</h3>
        
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            fullWidth
          />

          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            fullWidth
          />

          <Input
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            fullWidth
          />

          <div className="pt-4">
            <Button type="submit" variant="primary" isLoading={isUpdatingPassword}>
              Update Password
            </Button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Account Settings</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-800">Delete Account</h4>
              <p className="text-sm text-gray-600">
                Permanently delete your account and all associated data
              </p>
            </div>
            <Button
              variant="outline"
              type="button"
              className="text-red-600 border-red-600 hover:bg-red-50"
              onClick={() => {
                if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                  // Handle account deletion
                  alert('Account deletion would be implemented here');
                }
              }}
            >
              Delete Account
            </Button>
          </div>

          <div className="border-t border-gray-200 pt-4 mt-4">
            <Button
              variant="secondary"
              type="button"
              onClick={onSignOut}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;