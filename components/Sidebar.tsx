'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Tag {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
  usageCount: number;
}

interface User {
  _id: string;
  username: string;
  avatar?: string;
  reputation: number;
}

interface Stats {
  questions: number;
  answers: number;
  users: number;
  tags: number;
}

export default function Sidebar() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats>({ questions: 0, answers: 0, users: 0, tags: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch popular tags
        const tagsResponse = await fetch('/api/tags?sort=popular&limit=10');
        const tagsData = await tagsResponse.json();
        if (tagsData.success) {
          setTags(tagsData.tags);
        }

        // Fetch top contributors
        const usersResponse = await fetch('/api/users?sort=reputation&limit=5');
        const usersData = await usersResponse.json();
        if (usersData.success) {
          setUsers(usersData.users);
        }

        // Fetch community stats
        const statsResponse = await fetch('/api/stats');
        const statsData = await statsResponse.json();
        if (statsData.success) {
          setStats(statsData.stats);
        }
      } catch (error) {
        console.error('Error loading sidebar data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <aside className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
      {/* Popular Tags Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">🏷️ Popular Tags</h3>
          <Link
            href="/tags"
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            View all
          </Link>
        </div>

        <div className="space-y-2">
          {tags.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No tags yet</p>
          ) : (
            tags.map((tag) => (
              <Link
                key={tag._id}
                href={`/tags/${tag.slug}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition border border-gray-200 hover:border-blue-300"
              >
                <div className="flex items-center space-x-2">
                  {tag.icon && <span className="text-lg">{tag.icon}</span>}
                  <span className="text-sm font-medium text-gray-700">
                    {tag.name}
                  </span>
                </div>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {tag.usageCount}
                </span>
              </Link>
            ))
          )}
        </div>

        {tags.length > 0 && (
          <Link
            href="/tags"
            className="block mt-3 text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Browse all tags →
          </Link>
        )}
      </div>

      {/* Top Contributors Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">👑 Top Contributors</h3>
          <Link
            href="/users"
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            Leaderboard
          </Link>
        </div>

        <div className="space-y-3">
          {users.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No users yet</p>
          ) : (
            users.map((user, index) => (
              <Link
                key={user._id}
                href={`/users/${user._id}`}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition border border-gray-200 hover:border-blue-300"
              >
                {/* Rank Badge */}
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0
                      ? 'bg-yellow-100 text-yellow-700'
                      : index === 1
                      ? 'bg-gray-100 text-gray-700'
                      : index === 2
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-blue-50 text-blue-700'
                  }`}
                >
                  {index + 1}
                </div>

                {/* Avatar */}
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.username}
                  </p>
                  <p className="text-xs text-gray-500">
                    ⭐ {user.reputation.toLocaleString()} rep
                  </p>
                </div>

                {/* Trophy for top 3 */}
                {index < 3 && (
                  <span className="text-lg">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                  </span>
                )}
              </Link>
            ))
          )}
        </div>

        {users.length > 0 && (
          <Link
            href="/users"
            className="block mt-3 text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            View full leaderboard →
          </Link>
        )}
      </div>

      {/* Help Card */}
      <div className="mt-8 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
        <h4 className="font-bold text-gray-900 mb-2">💡 Need Help?</h4>
        <p className="text-sm text-gray-700 mb-3">
          Get answers to your appliance repair questions from our community of experts.
        </p>
        <Link
          href="/ask"
          className="block w-full text-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
        >
          Ask a Question
        </Link>
      </div>

      {/* Statistics Card */}
      <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h4 className="font-bold text-gray-900 mb-3 text-sm">📊 Community Stats</h4>
        <div className="space-y-2 text-xs text-gray-600">
          <div className="flex justify-between">
            <span>Questions:</span>
            <span className="font-semibold text-gray-900">{stats.questions.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Answers:</span>
            <span className="font-semibold text-gray-900">{stats.answers.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Users:</span>
            <span className="font-semibold text-gray-900">{stats.users.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Tags:</span>
            <span className="font-semibold text-gray-900">{stats.tags.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
