'use client';

import Link from 'next/link';
import UserAvatar from './UserAvatar';

interface UserProfileCardProps {
  user: {
    _id: string;
    username: string;
    email?: string;
    reputation: number;
    avatar?: string;
    bio?: string;
    location?: string;
    website?: string;
    createdAt: string;
  };
  stats?: {
    questions: number;
    answers: number;
    acceptedAnswers: number;
    comments: number;
  };
  showEmail?: boolean;
  showActions?: boolean;
  onEdit?: () => void;
}

export default function UserProfileCard({
  user,
  stats,
  showEmail = false,
  showActions = false,
  onEdit
}: UserProfileCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      {/* Header with gradient background */}
      <div className="h-20 bg-gradient-to-r from-blue-500 to-purple-600"></div>

      {/* Profile Content */}
      <div className="px-6 pb-6">
        {/* Avatar - overlapping header */}
        <div className="flex justify-between items-start -mt-12 mb-4">
          <UserAvatar user={user} size="xl" showBadge={true} clickable={false} />
          
          {showActions && onEdit && (
            <button
              onClick={onEdit}
              className="mt-12 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition"
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* User Info */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">{user.username}</h2>
          
          {showEmail && user.email && (
            <p className="text-sm text-gray-600 mb-2">{user.email}</p>
          )}

          {user.bio && (
            <p className="text-sm text-gray-700 mt-2">{user.bio}</p>
          )}

          {/* Additional Info */}
          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">
            {user.location && (
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{user.location}</span>
              </div>
            )}

            {user.website && (
              <a
                href={user.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-blue-600 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span>Website</span>
              </a>
            )}

            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Joined {formatDate(user.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.questions}</div>
              <div className="text-xs text-gray-600">Questions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.answers}</div>
              <div className="text-xs text-gray-600">Answers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.acceptedAnswers}</div>
              <div className="text-xs text-gray-600">Accepted</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{user.reputation.toLocaleString()}</div>
              <div className="text-xs text-gray-600">Reputation</div>
            </div>
          </div>
        )}

        {/* Badges/Achievements */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Achievements</h3>
          <div className="flex flex-wrap gap-2">
            {user.reputation >= 1000 && (
              <span className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                🏆 Expert
              </span>
            )}
            {user.reputation >= 500 && (
              <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                ⭐ Advanced
              </span>
            )}
            {user.reputation >= 100 && (
              <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                🔰 Intermediate
              </span>
            )}
            {stats && stats.acceptedAnswers >= 10 && (
              <span className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                ✓ Solution Master
              </span>
            )}
            {stats && stats.answers >= 50 && (
              <span className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full">
                💬 Active Helper
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
