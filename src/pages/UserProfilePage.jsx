import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { authAPI } from '../services/api';

const UserProfilePage = () => {
  const { user, logout, setUser } = useAuth();
  const [profile, setProfile] = useState({ ...user });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setProfile({ ...user });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage('');
    try {
      // Call the API to update the user profile
      const response = await authAPI.updateCurrentUser(profile);
      
      // Update the user in the context
      setUser(response.data);
      // Update the context
      localStorage.setItem('user', JSON.stringify(response.data));
      
      setMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      setMessage('Error updating profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setProfile({ ...user });
    setIsEditing(false);
    setMessage('');
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">User Profile</h1>
          
          {message && (
            <div className={`p-4 mb-6 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {message}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={profile.name || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{profile.name || 'N/A'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={profile.email || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{profile.email || 'N/A'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <p className="text-gray-900">{profile.username || 'N/A'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <p className="text-gray-900 capitalize">{profile.role || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="w-32 h-32 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-4">
                  <span className="text-4xl text-gray-600">
                    {profile.name ? profile.name.charAt(0).toUpperCase() : '?'}
                  </span>
                </div>
                <p className="text-gray-600">Profile Picture</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex space-x-4">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              </>
            )}
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;