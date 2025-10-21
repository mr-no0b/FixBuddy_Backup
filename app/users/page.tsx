'use client';

import { useState, useEffect } from 'react';
import { Navbar, UserAvatar, LoadingSpinner, ErrorBoundary } from '@/components';
import Link from 'next/link';

interface User {
  _id: string;
  username: string;
  avatar?: string;
  reputation: number;
  bio?: string;
  createdAt: string;
  lastActiveAt: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  limit: number;
  hasMore: boolean;
}

type SortType = 'reputation' | 'newest' | 'active';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState<SortType>('reputation');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(`/api/users?sort=${sortBy}&page=${currentPage}&limit=20`);
        const data = await response.json();

        if (data.success) {
          setUsers(data.users);
          setPagination(data.pagination);
        } else {
          setError(data.message || 'Failed to load users');
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [sortBy, currentPage]);

  // Handle sort change
  const handleSortChange = (newSort: SortType) => {
    setSortBy(newSort);
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Get rank badge
  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  // Get reputation tier
  const getReputationTier = (reputation: number) => {
    if (reputation >= 10000) return { label: 'Legend', color: 'text-purple-600', bg: 'bg-purple-100' };
    if (reputation >= 5000) return { label: 'Expert', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (reputation >= 1000) return { label: 'Advanced', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (reputation >= 500) return { label: 'Intermediate', color: 'text-green-600', bg: 'bg-green-100' };
    if (reputation >= 100) return { label: 'Contributor', color: 'text-gray-600', bg: 'bg-gray-100' };
    return { label: 'Beginner', color: 'text-gray-500', bg: 'bg-gray-50' };
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  // Calculate time since last active
  const getLastActiveText = (dateString: string) => {
    const now = new Date();
    const lastActive = new Date(dateString);
    const diffMs = now.getTime() - lastActive.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Active now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 30) return `${diffDays}d ago`;
    return formatDate(dateString);
  };

  return (
    <ErrorBoundary>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Community Leaderboard
          </h1>
          <p className="text-gray-600">
            Meet the top contributors helping fix appliances around the world
          </p>
        </div>

        {/* Sort Options */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-gray-900">
              {pagination?.totalUsers || 0} Community Members
            </h2>

            <div className="flex gap-2">
              <button
                onClick={() => handleSortChange('reputation')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                  sortBy === 'reputation'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Top Reputation
              </button>
              <button
                onClick={() => handleSortChange('active')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                  sortBy === 'active'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Most Active
              </button>
              <button
                onClick={() => handleSortChange('newest')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                  sortBy === 'newest'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Newest
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold text-red-800 mb-2">Error</h2>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Users Leaderboard */}
        {!loading && !error && (
          <>
            {users.length > 0 ? (
              <>
                {/* Desktop View - Table */}
                <div className="hidden md:block bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rank
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reputation
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Level
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Active
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Member Since
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user, index) => {
                        const rank = (currentPage - 1) * 20 + index + 1;
                        const tier = getReputationTier(user.reputation);
                        return (
                          <tr key={user._id} className="hover:bg-gray-50 transition">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-2xl font-bold text-gray-900">
                                {getRankBadge(rank)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Link
                                href={`/users/${user._id}`}
                                className="flex items-center gap-3 hover:opacity-80 transition"
                              >
                                <UserAvatar user={user} size="md" showBadge={false} clickable={false} />
                                <div>
                                  <div className="font-medium text-gray-900">{user.username}</div>
                                  {user.bio && (
                                    <div className="text-sm text-gray-500 line-clamp-1 max-w-xs">
                                      {user.bio}
                                    </div>
                                  )}
                                </div>
                              </Link>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-lg font-bold text-gray-900">
                                {user.reputation.toLocaleString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tier.bg} ${tier.color}`}>
                                {tier.label}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {getLastActiveText(user.lastActiveAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(user.createdAt)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View - Cards */}
                <div className="md:hidden space-y-4">
                  {users.map((user, index) => {
                    const rank = (currentPage - 1) * 20 + index + 1;
                    const tier = getReputationTier(user.reputation);
                    return (
                      <Link
                        key={user._id}
                        href={`/users/${user._id}`}
                        className="block bg-white rounded-lg shadow-md border border-gray-200 p-4 hover:shadow-lg hover:border-blue-300 transition"
                      >
                        <div className="flex items-start gap-4">
                          <div className="text-2xl font-bold text-gray-900 flex-shrink-0">
                            {getRankBadge(rank)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <UserAvatar user={user} size="md" showBadge={false} clickable={false} />
                              <div className="flex-1 min-w-0">
                                <div className="font-bold text-gray-900 truncate">
                                  {user.username}
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="font-medium text-gray-900">
                                    {user.reputation.toLocaleString()}
                                  </span>
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${tier.bg} ${tier.color}`}>
                                    {tier.label}
                                  </span>
                                </div>
                              </div>
                            </div>
                            {user.bio && (
                              <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                {user.bio}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>Active {getLastActiveText(user.lastActiveAt)}</span>
                              <span>•</span>
                              <span>Joined {formatDate(user.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="mt-8 bg-white rounded-lg shadow-md border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        ← Previous
                      </button>

                      <div className="flex items-center gap-2">
                        {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                          let pageNum;
                          if (pagination.totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= pagination.totalPages - 2) {
                            pageNum = pagination.totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`w-10 h-10 rounded-lg font-medium transition ${
                                currentPage === pageNum
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={!pagination.hasMore}
                        className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        Next →
                      </button>
                    </div>

                    <div className="mt-4 text-center text-sm text-gray-600">
                      Page {currentPage} of {pagination.totalPages} ({pagination.totalUsers}{' '}
                      total users)
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12 text-center">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Users Yet</h3>
                <p className="text-gray-600">Be the first to join the community!</p>
              </div>
            )}
          </>
        )}

        {/* Reputation Info */}
        <div className="mt-12 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How Reputation Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-gray-900 mb-2">📈 Earn Reputation</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Ask helpful questions (+5)</li>
                <li>• Provide quality answers (+10)</li>
                <li>• Get your answer accepted (+15)</li>
                <li>• Receive upvotes on posts (+5)</li>
                <li>• Help others solve problems</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">🏆 Reputation Tiers</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Beginner: 0-99</li>
                <li>• Contributor: 100-499</li>
                <li>• Intermediate: 500-999</li>
                <li>• Advanced: 1,000-4,999</li>
                <li>• Expert: 5,000-9,999</li>
                <li>• Legend: 10,000+</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
