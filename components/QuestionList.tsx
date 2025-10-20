'use client';

import { useState, useEffect } from 'react';
import QuestionCard from './QuestionCard';

interface Question {
  _id: string;
  title: string;
  content: string;
  author: {
    _id?: string;
    username: string;
    reputation: number;
    avatar?: string;
  } | null;
  tags: Array<{
    _id: string;
    name: string;
    slug: string;
    icon?: string;
  }>;
  votes: number;
  views: number;
  answerCount: number;
  status: 'open' | 'closed' | 'solved';
  createdAt: string;
  updatedAt?: string;
}

interface QuestionListProps {
  initialSort?: 'newest' | 'oldest' | 'popular' | 'views' | 'unanswered' | 'active';
  tag?: string;
  search?: string;
  limit?: number;
}

export default function QuestionList({
  initialSort = 'newest',
  tag,
  search,
  limit = 20
}: QuestionListProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentSort, setCurrentSort] = useState(initialSort);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalQuestions: 0,
    limit: limit,
    hasMore: false
  });

  // Fetch questions
  const fetchQuestions = async (page: number = 1, sort: typeof currentSort = currentSort) => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        sort,
        page: page.toString(),
        limit: limit.toString()
      });

      if (tag) params.append('tag', tag);
      if (search) params.append('search', search);

      const response = await fetch(`/api/questions?${params}`);
      const data = await response.json();

      if (data.success) {
        setQuestions(data.questions);
        setPagination(data.pagination);
        setCurrentPage(page);
        setCurrentSort(sort);
      } else {
        setError(data.message || 'Failed to load questions');
      }
    } catch (err) {
      setError('Error loading questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load questions on mount and when filters change
  useEffect(() => {
    fetchQuestions(1, currentSort);
  }, [tag, search]);

  // Handle sort change
  const handleSortChange = (newSort: typeof currentSort) => {
    fetchQuestions(1, newSort);
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    fetchQuestions(newPage, currentSort);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sort options
  const sortOptions: Array<{ value: typeof currentSort; label: string; icon: string }> = [
    { value: 'newest', label: 'Newest', icon: '🕐' },
    { value: 'active', label: 'Active', icon: '🔥' },
    { value: 'popular', label: 'Popular', icon: '⬆️' },
    { value: 'unanswered', label: 'Unanswered', icon: '❓' },
    { value: 'views', label: 'Most Viewed', icon: '👁️' }
  ];

  return (
    <div className="w-full">
      {/* Header with Sort Options */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {tag ? `Questions tagged "${tag}"` : search ? `Search results for "${search}"` : 'All Questions'}
          {!loading && (
            <span className="ml-2 text-base font-normal text-gray-500">
              ({pagination.totalQuestions.toLocaleString()})
            </span>
          )}
        </h2>
      </div>

      {/* Sort Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
        {sortOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => handleSortChange(option.value)}
            disabled={loading}
            className={`
              flex items-center px-4 py-2 text-sm font-medium border-b-2 transition whitespace-nowrap
              ${currentSort === option.value
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }
              ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <span className="mr-2">{option.icon}</span>
            {option.label}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
              <div className="flex gap-4">
                <div className="w-8 h-20 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="flex gap-2">
                    <div className="h-6 w-16 bg-gray-200 rounded"></div>
                    <div className="h-6 w-16 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <svg
            className="w-12 h-12 text-red-400 mx-auto mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-red-800 font-medium mb-2">{error}</p>
          <button
            onClick={() => fetchQuestions(currentPage, currentSort)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && questions.length === 0 && (
        <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <svg
            className="w-16 h-16 text-gray-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Questions Found</h3>
          <p className="text-gray-600 mb-6">
            {search || tag
              ? 'Try adjusting your search or filter.'
              : 'Be the first to ask a question!'}
          </p>
          {!search && !tag && (
            <a
              href="/ask"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
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
              Ask a Question
            </a>
          )}
        </div>
      )}

      {/* Questions List */}
      {!loading && !error && questions.length > 0 && (
        <>
          <div className="space-y-4">
            {questions.map((question) => (
              <QuestionCard key={question._id} question={question} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">
                  {(pagination.currentPage - 1) * pagination.limit + 1}
                </span>
                {' '}-{' '}
                <span className="font-medium">
                  {Math.min(pagination.currentPage * pagination.limit, pagination.totalQuestions)}
                </span>
                {' '}of{' '}
                <span className="font-medium">{pagination.totalQuestions}</span>
                {' '}questions
              </div>

              <div className="flex items-center gap-2">
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  ← Previous
                </button>

                {/* Page Numbers */}
                <div className="hidden sm:flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
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
                        className={`
                          w-10 h-10 text-sm font-medium rounded-lg transition
                          ${currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                          }
                        `}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                {/* Current Page (Mobile) */}
                <span className="sm:hidden text-sm font-medium text-gray-700 px-4">
                  {currentPage} / {pagination.totalPages}
                </span>

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
