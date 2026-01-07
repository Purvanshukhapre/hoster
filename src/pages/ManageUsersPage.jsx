import React, { useState } from 'react';
import { authAPI } from '../services/api';

const ManageUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [editingUser, setEditingUser] = useState(null);
  const [editUserData, setEditUserData] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [initialLoad, setInitialLoad] = useState(true);

  // Load users from API initially
  React.useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      // Use the correct API endpoint for getting all users
      const response = await authAPI.getAllUsers();
      console.log('API Response:', response); // Debug log
      
      // The /api/users endpoint returns { success: boolean, data: [] }
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        // Array of users returned in the data property
        console.log('Setting users with array:', response.data.data); // Debug log
        setUsers(response.data.data);
      } else {
        // Fallback to empty array
        console.log('Setting users with empty array'); // Debug log
        setUsers([]);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      
      // Check if it's a 404 error (endpoint doesn't exist)
      if (error.status === 404 || error.code === 'ERR_BAD_REQUEST') {
        setMessage('User management API not available');
        setUsers([]);
      } else {
        setMessage('Error loading users: ' + error.message);
        setUsers([]);
      }
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Call the register API to add the user
      const response = await authAPI.registerUser({
        name: newUser.name,
        email: newUser.email,
        password: newUser.password
      });
      
      // The register API might not return role information, so we'll add it with a default role
      const newUserWithRole = {
        ...response.data,
        role: response.data.role || 'employee' // default to 'employee' if not provided
      };
      
      setUsers(prev => [...prev, newUserWithRole]);
      setNewUser({ name: '', email: '', password: '' });
      setShowAddUserForm(false);
      setMessage('User added successfully!');
    } catch (error) {
      // Handle API error for add user
      if (error.status === 404 || error.code === 'ERR_BAD_REQUEST') {
        setMessage('User add API not available, adding to local data');
        
        // Add locally
        const newLocalUser = {
          id: Date.now(), // generate a temporary ID
          name: newUser.name,
          email: newUser.email,
          username: newUser.name.toLowerCase().replace(' ', ''),
          role: 'employee',
          lastLogin: null
        };
        setUsers(prev => [...prev, newLocalUser]);
        setNewUser({ name: '', email: '', password: '' });
        setShowAddUserForm(false);
      } else {
        setMessage('Error adding user: ' + error.message);
      }
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Call the API to update the user
      const response = await authAPI.updateUser(editingUser._id || editingUser.id, editUserData);
      // Handle response based on format
      const updatedUser = response.data && response.data.data ? response.data.data : response.data;
      setUsers(prev => prev.map(user => 
        (user._id === editingUser._id || user.id === editingUser.id) ? updatedUser : user
      ));
      
      setEditingUser(null);
      setEditUserData({});
      setMessage('User updated successfully!');
    } catch (error) {
      // Handle API error for update
      if (error.status === 404 || error.code === 'ERR_BAD_REQUEST') {
        setMessage('User update API not available, updating local data');
        
        // Update locally
        setUsers(prev => prev.map(user => 
          (user._id === editingUser._id || user.id === editingUser.id) ? { ...user, ...editUserData } : user
        ));
        setEditingUser(null);
        setEditUserData({});
      } else {
        setMessage('Error updating user: ' + error.message);
      }
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setLoading(true);
      
      try {
        // Call the API to delete the user
        await authAPI.deleteUser(userId);
        // Remove the user from the local state
        setUsers(prev => prev.filter(user => (user._id || user.id) !== userId));
        setMessage('User deleted successfully!');
      } catch (error) {
        // Handle API error for delete
        if (error.status === 404 || error.code === 'ERR_BAD_REQUEST') {
          setMessage('User delete API not available, removing from local data');
          
          // Delete locally
          setUsers(prev => prev.filter(user => (user._id || user.id) !== userId));
        } else {
          setMessage('Error deleting user: ' + error.message);
        }
      } finally {
        setLoading(false);
        setTimeout(() => setMessage(''), 3000);
      }
    }
  };

  const startEditing = (user) => {
    setEditingUser(user);
    setEditUserData({
      name: user.name,
      email: user.email,
      username: user.username || user.email.split('@')[0] || user.name.toLowerCase().replace(' ', ''), // generate username from email or name if not provided
      role: user.role
    });
  };

  const cancelEditing = () => {
    setEditingUser(null);
    setEditUserData({});
  };

  if (initialLoad) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Manage Users</h1>
            <button
              onClick={() => setShowAddUserForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add New User
            </button>
          </div>

          {loading && (
            <div className="flex justify-center items-center p-4 mb-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          )}
          {message && (
            <div className={`p-4 mb-6 rounded ${message.includes('deleted') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {message}
            </div>
          )}

          {/* Add User Form */}
          {showAddUserForm && (
            <div className="mb-8 p-6 bg-gray-50 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Add New User</h2>
              <form onSubmit={handleAddUser}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={newUser.name}
                      onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                      type="password"
                      name="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {loading ? 'Adding...' : 'Add User'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddUserForm(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Edit User Form */}
          {editingUser && (
            <div className="mb-8 p-6 bg-blue-50 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Edit User</h2>
              <form onSubmit={handleUpdateUser}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={editUserData.name || ''}
                      onChange={(e) => setEditUserData({...editUserData, name: e.target.value})}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={editUserData.email || ''}
                      onChange={(e) => setEditUserData({...editUserData, email: e.target.value})}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <input
                      type="text"
                      name="username"
                      value={editUserData.username || ''}
                      onChange={(e) => setEditUserData({...editUserData, username: e.target.value})}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select
                      name="role"
                      value={editUserData.role || 'user'}
                      onChange={(e) => setEditUserData({...editUserData, role: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="admin">Admin</option>
                      <option value="employee">Employee</option>
                      <option value="user">User</option>
                    </select>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {loading ? 'Updating...' : 'Update User'}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users && users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user._id || user.id} className={(editingUser?._id || editingUser?.id) === (user._id || user.id) ? 'bg-blue-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-gray-600">
                              {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.username}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => startEditing(user)}
                          disabled={loading}
                          className={`text-blue-600 hover:text-blue-900 mr-3 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          Edit
                        </button>
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => handleDeleteUser(user._id || user.id)}
                            disabled={loading}
                            className={`text-red-600 hover:text-red-900 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                          {loading ? 'Deleting...' : 'Delete'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                      {message.includes('Error') ? 'Failed to load users' : 'No users found (only current user profile available)'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageUsersPage;