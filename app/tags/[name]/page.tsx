'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Navbar, QuestionCard, LoadingSpinner, ErrorBoundary, TagBadge } from '@/components';
import Link from 'next/link';

interface Tag {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  usageCount: number;
}

interface Question {
  _id: string;
  title: string;
  content: string;
  author: any;
  tags: any[];
  votes: number;
  views: number;
  answerCount: number;
  status: 'open' | 'closed' | 'solved';
  createdAt: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalQuestions: number;
  limit: number;
  hasMore: boolean;
}

type SortType = 'newest' | 'oldest' | 'popular' | 'unanswered';

export default function TagDetailPage() {
  const params = useParams();
  const tagSlug = params?.name as string;

  const [tag, setTag] = useState<Tag | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState<SortType>('newest');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch tag and questions
  useEffect(() => {
    const fetchTagQuestions = async () => {
      if (!tagSlug) return;

      try {
        setLoading(true);
        setError('');

        const response = await fetch(
          `/api/tags/${tagSlug}?page=${currentPage}&sort=${sortBy}&limit=20`
        );
        const data = await response.json();

        if (data.success) {
          setTag(data.tag);
          setQuestions(data.questions);
          setPagination(data.pagination);
        } else {
          setError(data.message || 'Failed to load tag');
        }
      } catch (error) {
        console.error('Error fetching tag:', error);
        setError('Failed to load tag');
      } finally {
        setLoading(false);
      }
    };

    fetchTagQuestions();
  }, [tagSlug, sortBy, currentPage]);

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

  if (error || !tag) {
    return (
      <ErrorBoundary>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold text-red-800 mb-2">Tag Not Found</h2>
            <p className="text-red-700 mb-4">
              {error || 'The tag you are looking for does not exist.'}
            </p>
            <Link
              href="/tags"
              className="inline-block px-6 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition"
            >
              Browse All Tags
            </Link>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Tag Header */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
              <div className="flex items-start gap-4">
                {tag.icon && (
                  <span className="text-5xl flex-shrink-0">{tag.icon}</span>
                )}
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {tag.name}
                  </h1>
                  {tag.description && (
                    <p className="text-gray-600 mb-4">{tag.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <span>
                      <strong className="text-gray-900">{tag.usageCount}</strong>{' '}
                      {tag.usageCount === 1 ? 'question' : 'questions'}
                    </span>
                    <Link
                      href="/questions/ask"
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Ask a question about {tag.name} →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h2 className="text-lg font-bold text-gray-900">
                  {pagination?.totalQuestions || 0} Questions
                </h2>

                {/* Sort Options */}
                <div className="flex gap-2">
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
                  <button
                    onClick={() => handleSortChange('popular')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                      sortBy === 'popular'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Popular
                  </button>
                  <button
                    onClick={() => handleSortChange('unanswered')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                      sortBy === 'unanswered'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Unanswered
                  </button>
                </div>
              </div>
            </div>

            {/* Questions List */}
            {questions.length > 0 ? (
              <>
                <div className="space-y-4">
                  {questions.map((question) => (
                    <QuestionCard key={question._id} question={question} />
                  ))}
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
                      Page {currentPage} of {pagination.totalPages} ({pagination.totalQuestions}{' '}
                      total questions)
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12 text-center">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Questions Yet</h3>
                <p className="text-gray-600 mb-4">
                  {sortBy === 'unanswered'
                    ? `All questions tagged with "${tag.name}" have been answered!`
                    : `Be the first to ask a question about ${tag.name}.`}
                </p>
                <Link
                  href="/questions/ask"
                  className="inline-block px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
                >
                  Ask a Question
                </Link>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Related Tags */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6 sticky top-8">
              <h3 className="font-bold text-gray-900 mb-4">About This Tag</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    Questions tagged with <strong>{tag.name}</strong> relate to issues,
                    repairs, maintenance, and troubleshooting.
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-bold text-gray-900 mb-2">Usage Guidelines</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Be specific in your question title</li>
                    <li>• Include model numbers if applicable</li>
                    <li>• Describe what you've already tried</li>
                    <li>• Add photos if relevant</li>
                  </ul>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <Link
                    href="/tags"
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Browse all tags →
                  </Link>
                </div>
              </div>
            </div>

            {/* Ask Question CTA */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
              <h3 className="font-bold text-gray-900 mb-2">Have a Question?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Get help from our community of appliance repair experts.
              </p>
              <Link
                href="/questions/ask"
                className="block w-full px-4 py-2 bg-blue-600 text-white text-center font-medium rounded-lg hover:bg-blue-700 transition"
              >
                Ask a Question
              </Link>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
