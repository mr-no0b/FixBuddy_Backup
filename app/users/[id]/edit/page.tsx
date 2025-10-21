'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar, LoadingSpinner, ErrorBoundary, UserAvatar } from '@/components';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  reputation: number;
}

export default function EditProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form fields
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');

  const userId = params?.id as string;

  // Check authorization and load user data
  useEffect(() => {
    const loadUserData = async () => {
      // Check if user is logged in
      if (!currentUser) {
        router.push('/login');
        return;
      }

      // Check if user is editing their own profile
      if (currentUser._id !== userId) {
        setError('You can only edit your own profile');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/users/${userId}`);
        const data = await response.json();

        if (data.success) {
          setUsername(data.user.username || '');
          setBio(data.user.bio || '');
          setAvatar(data.user.avatar || '');
        } else {
          setError(data.message || 'Failed to load profile');
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [currentUser, userId, router]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    if (username.trim().length > 30) {
      setError('Username cannot exceed 30 characters');
      return;
    }

    if (bio.trim().length > 500) {
      setError('Bio cannot exceed 500 characters');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/users/${userId}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          bio: bio.trim(),
          avatar: avatar.trim() || undefined
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Profile updated successfully!');
        // Refresh user data in auth context
        await refreshUser();
        // Redirect after 1.5 seconds
        setTimeout(() => {
          router.push(`/users/${userId}`);
        }, 1500);
      } else {
        setError(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    router.push(`/users/${userId}`);
  };

  if (loading) {
    return (
      <ErrorBoundary>
        <Navbar />
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner size="lg" />
        </div>
      </ErrorBoundary>
    );
  }

  if (error && !currentUser) {
    return (
      <ErrorBoundary>
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold text-red-800 mb-2">Unauthorized</h2>
            <p className="text-red-700 mb-4">You must be logged in to edit your profile.</p>
            <Link
              href="/login"
              className="inline-block px-6 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  if (error && currentUser?._id !== userId) {
    return (
      <ErrorBoundary>
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold text-red-800 mb-2">Access Denied</h2>
            <p className="text-red-700 mb-4">You can only edit your own profile.</p>
            <Link
              href={currentUser ? `/users/${currentUser._id}` : '/'}
              className="inline-block px-6 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition"
            >
              Go to My Profile
            </Link>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Profile</h1>
          <p className="text-gray-600">Update your personal information and preferences</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
            {success}
          </div>
        )}

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md border border-gray-200 p-6 space-y-6">
          {/* Avatar Preview */}
          <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
            <UserAvatar
              user={{
                _id: userId,
                username: username,
                avatar: avatar,
                reputation: currentUser?.reputation || 0
              }}
              size="lg"
              showBadge={false}
              clickable={false}
            />
            <div>
              <h3 className="font-semibold text-gray-900">Profile Picture</h3>
              <p className="text-sm text-gray-600">Update your avatar URL below</p>
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Username *
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
              disabled={saving}
              required
              minLength={3}
              maxLength={30}
            />
            <p className="mt-2 text-sm text-gray-500">
              Your unique username (3-30 characters)
              <span className="float-right">{username.length}/30</span>
            </p>
          </div>

          {/* Email (Read-only) */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Email
            </label>
            <input
              type="email"
              value={currentUser?.email || ''}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
              disabled
              readOnly
            />
            <p className="mt-2 text-sm text-gray-500">
              Email cannot be changed
            </p>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself, your expertise, or what you're working on..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical text-gray-900 placeholder:text-gray-400"
              rows={4}
              disabled={saving}
              maxLength={500}
            />
            <p className="mt-2 text-sm text-gray-500">
              A brief description about yourself
              <span className="float-right">{bio.length}/500</span>
            </p>
          </div>

          {/* Avatar URL */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Avatar URL
            </label>
            <input
              type="url"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
              disabled={saving}
            />
            <p className="mt-2 text-sm text-gray-500">
              URL to your profile picture (optional)
            </p>
          </div>

          {/* Profile Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-bold text-blue-900 mb-2">💡 Profile Tips</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Choose a unique username that represents you</li>
              <li>• Add a bio to tell others about your expertise</li>
              <li>• Use a clear profile picture to build trust</li>
              <li>• Keep your profile updated and professional</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 sm:flex-none px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {saving ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                'Save Changes'
              )}
            </button>

            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="flex-1 sm:flex-none px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </ErrorBoundary>
  );
}
