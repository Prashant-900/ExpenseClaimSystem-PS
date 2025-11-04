import { useState, useEffect } from 'react';
import { useAuthStore } from '../../authentication/authStore';
import { useUserRole } from '../../../shared/hooks/useUserRole';
import Layout from '../../../shared/layout/Layout';
import API from '../../../shared/services/axios';
import { SCHOOLS } from '../../../utils/schools';

const ProfilePage = () => {
  const { user, updateUser } = useAuthStore();
  const { role } = useUserRole();
  
  // Use role from backend, fallback to user from store
  const userRole = role || user?.role;
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department || '',
    bio: user?.bio || '',
    studentId: user?.studentId || ''
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(user?.profileImage || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [message, setMessage] = useState('');
  const [imageKey, setImageKey] = useState(Date.now());

  useEffect(() => {
    // Fetch full user data from backend
    const fetchUserData = async () => {
      try {
        setIsFetchingData(true);
        const response = await API.get('/auth/me');
        const userData = response.data;
        
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          department: userData.department || '',
          bio: userData.bio || '',
          studentId: userData.studentId || ''
        });
        
        if (userData.profileImage) {
          setImagePreview(`${userData.profileImage}?v=${Date.now()}`);
        }
        
        // Update store with complete user data
        updateUser(userData);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setIsFetchingData(false);
      }
    };
    
    fetchUserData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      // Update profile data
      const { data } = await API.patch('/auth/profile', formData);
      
      // Upload profile image separately if selected
      let updatedUser = data.user;
      if (profileImage) {
        const imageFormData = new FormData();
        imageFormData.append('profileImage', profileImage);
        
        await API.post('/auth/upload-profile-image', imageFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        // Get updated user data after image upload
        const userResponse = await API.get('/auth/me');
        updatedUser = userResponse.data;
        
        // Set preview with fresh URL and force re-render
        setImagePreview(`${updatedUser.profileImage}?v=${Date.now()}`);
        setImageKey(Date.now());
      }
      
      updateUser(updatedUser);
      setMessage('Profile updated successfully!');
      setProfileImage(null);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>
          
          {isFetchingData && (
            <div className="mb-4 p-3 rounded bg-blue-100 text-blue-700 flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-3"></div>
              Loading your profile information...
            </div>
          )}
          
          {message && (
            <div className={`mb-4 p-3 rounded ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className={`space-y-6 ${isFetchingData ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="flex flex-col items-center mb-6">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 mb-4">
                {imagePreview ? (
                  <img key={imageKey} src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={isFetchingData}
                className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:file:opacity-50 disabled:file:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isFetchingData}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={isFetchingData}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                disabled={isFetchingData}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                required={!isFetchingData}
              >
                <option value="">Select Department</option>
                {SCHOOLS.map(school => (
                  <option key={school.value} value={school.value}>{school.label}</option>
                ))}
              </select>
            </div>

            {userRole === 'Student' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student ID / Roll Number
                </label>
                <input
                  type="text"
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value.trim() })}
                  disabled={isFetchingData}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    !user?.studentId 
                      ? 'border-red-300 focus:ring-red-500 bg-yellow-50' 
                      : 'border-gray-300 focus:ring-blue-500'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  placeholder="Enter your Roll Number (e.g., B21001)"
                  required={!isFetchingData && userRole === 'Student'}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                disabled={isFetchingData}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Tell us about yourself..."
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || isFetchingData}
              className="w-full py-3 px-6 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;