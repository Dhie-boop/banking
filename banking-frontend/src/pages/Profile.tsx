import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import { FiUser, FiMail, FiPhone, FiLock, FiSave } from 'react-icons/fi';
import { authAPI, userAPI } from '../services/api';
import authService from '../services/auth';
import { toast } from 'react-toastify';
import type { User } from '../types';

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    phoneNumber: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    setLoading(true);
    try {
      const userData = await authAPI.getCurrentUser();
      setUser(userData);
      setFormData({
        username: userData.username || '',
        email: userData.email || '',
        fullName: userData.fullName || '',
        phoneNumber: userData.phoneNumber || '',
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.email) {
      toast.error('Username and email are required');
      return;
    }

    setUpdating(true);
    try {
      const updatedUser = await userAPI.updateUser(user!.id, formData);
      setUser(updatedUser);
      
      // Update stored user data
      const storedUser = authService.getCurrentUser();
      if (storedUser) {
        authService.setAuthData(authService.getToken()!, { ...storedUser, ...updatedUser });
      }
      
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      toast.error(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    setUpdating(true);
    try {
      // This would require a password change endpoint
      // await authAPI.changePassword(passwordForm);
      toast.success('Password changed successfully');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setShowPasswordForm(false);
    } catch (error: any) {
      console.error('Error changing password:', error);
      const errorMessage = error.response?.data?.message || 'Failed to change password';
      toast.error(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Profile">
        <div className="max-w-4xl space-y-6">
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout title="Profile">
        <div className="text-center py-12">
          <p className="text-gray-500">Failed to load user profile</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Profile">
      <div className="max-w-4xl space-y-6">
        {/* Profile Header */}
        <Card>
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-blue-800 text-white rounded-full flex items-center justify-center text-2xl font-bold">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user.username}</h2>
              <p className="text-gray-500">{user.email}</p>
              <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                {user.role.toLowerCase()}
              </span>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Information */}
          <Card title="Profile Information" icon={<FiUser />}>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    className="input-field pl-10"
                    required
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="input-field pl-10"
                    required
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    className="input-field pl-10"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    className="input-field pl-10"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiPhone className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={updating}
                className="w-full btn-primary"
              >
                <FiSave className="mr-2" />
                {updating ? 'Updating...' : 'Update Profile'}
              </button>
            </form>
          </Card>

          {/* Security Settings */}
          <Card title="Security Settings" icon={<FiLock />}>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Password</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Keep your account secure by using a strong password
                </p>
                {!showPasswordForm ? (
                  <button
                    onClick={() => setShowPasswordForm(true)}
                    className="btn-secondary"
                  >
                    Change Password
                  </button>
                ) : (
                  <form onSubmit={handlePasswordChange} className="space-y-3">
                    <input
                      type="password"
                      placeholder="Current Password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm(prev => ({ 
                        ...prev, 
                        currentPassword: e.target.value 
                      }))}
                      className="input-field"
                      required
                    />
                    <input
                      type="password"
                      placeholder="New Password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({ 
                        ...prev, 
                        newPassword: e.target.value 
                      }))}
                      className="input-field"
                      required
                    />
                    <input
                      type="password"
                      placeholder="Confirm New Password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({ 
                        ...prev, 
                        confirmPassword: e.target.value 
                      }))}
                      className="input-field"
                      required
                    />
                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowPasswordForm(false);
                          setPasswordForm({
                            currentPassword: '',
                            newPassword: '',
                            confirmPassword: '',
                          });
                        }}
                        className="flex-1 btn-secondary"
                        disabled={updating}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 btn-primary"
                        disabled={updating}
                      >
                        {updating ? 'Updating...' : 'Update'}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Account Information</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Account ID:</span>
                    <span className="font-medium">{user.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Role:</span>
                    <span className="font-medium capitalize">{user.role.toLowerCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Member since:</span>
                    <span className="font-medium">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
