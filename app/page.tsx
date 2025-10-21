'use client';

import { useState } from 'react';
import { Navbar, Sidebar, QuestionList, LoadingSpinner, ErrorBoundary } from '@/components';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const [selectedSort, setSelectedSort] = useState<'newest' | 'active' | 'popular' | 'unanswered' | 'oldest' | 'views'>('newest');
  const [selectedTag, setSelectedTag] = useState<string | undefined>(undefined);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading FixBuddy..." />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation Bar */}
        <Navbar />

        {/* Main Layout */}
        <div className="flex max-w-[1600px] mx-auto">
          {/* Main Content Area */}
          <main className="flex-1 p-4 sm:p-6">
            {/* Header Section */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    {selectedTag ? (
                      <span>
                        Questions tagged with{' '}
                        <span className="text-blue-600">{selectedTag}</span>
                      </span>
                    ) : (
                      'All Questions'
                    )}
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600">
                    {selectedTag
                      ? `Browse questions about ${selectedTag}`
                      : 'Get expert help with your home appliance repairs'}
                  </p>
                </div>
                {user && (
                  <Link
                    href="/ask"
                    className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-sm"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Ask Question
                  </Link>
                )}
              </div>

              {/* Filter Tags */}
              {selectedTag && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <span className="text-sm text-blue-800">
                    <strong>Active filter:</strong> {selectedTag}
                  </span>
                  <button
                    onClick={() => setSelectedTag(undefined)}
                    className="ml-auto px-3 py-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Clear filter ×
                  </button>
                </div>
              )}

              {/* Stats Bar with Sort Dropdown */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>Questions</span>
                  </div>
                  
                  {/* Sort Dropdown */}
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"
                      />
                    </svg>
                    <span>Sort by:</span>
                    <select
                      value={selectedSort}
                      onChange={(e) => setSelectedSort(e.target.value as any)}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-900 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="newest">Newest</option>
                      <option value="active">Recently Active</option>
                      <option value="popular">Most Popular</option>
                      <option value="unanswered">Unanswered</option>
                      <option value="oldest">Oldest</option>
                      <option value="views">Most Viewed</option>
                    </select>
                  </div>
                </div>
                
                {!user && (
                  <div className="sm:ml-auto">
                    <Link
                      href="/login"
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      Login to ask questions →
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Question List with Filters */}
            <QuestionList
              key={`${selectedSort}-${selectedTag || 'all'}`}
              initialSort={selectedSort}
              limit={20}
              tag={selectedTag}
            />
          </main>

          {/* Sidebar - Hidden on mobile, visible on tablet+ */}
          <aside className="hidden lg:block">
            <Sidebar />
          </aside>
        </div>

        {/* Mobile Sidebar - Show at bottom on mobile */}
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <div className="max-w-[1600px] mx-auto p-4">
            <Sidebar />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
