'use client';

import { useState, useEffect } from 'react';
import { Navbar, TagBadge, LoadingSpinner, ErrorBoundary } from '@/components';
import Link from 'next/link';

interface Tag {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  usageCount: number;
  createdAt: string;
}

type SortType = 'popular' | 'name' | 'newest';

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [filteredTags, setFilteredTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortType>('popular');

  // Fetch tags
  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(`/api/tags?sort=${sortBy}&limit=100`);
        const data = await response.json();

        if (data.success) {
          setTags(data.tags);
          setFilteredTags(data.tags);
        } else {
          setError(data.message || 'Failed to load tags');
        }
      } catch (error) {
        console.error('Error fetching tags:', error);
        setError('Failed to load tags');
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, [sortBy]);

  // Filter tags based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = tags.filter(tag =>
        tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tag.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTags(filtered);
    } else {
      setFilteredTags(tags);
    }
  }, [searchQuery, tags]);

  return (
    <ErrorBoundary>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Tags</h1>
          <p className="text-gray-600">
            A tag is a keyword or label that categorizes your question with other similar questions.
            Using the right tags makes it easier for others to find and answer your question.
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tags by name or description..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="sm:w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortType)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              >
                <option value="popular">Most Popular</option>
                <option value="name">Alphabetical</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-3 text-sm text-gray-600">
            Showing {filteredTags.length} of {tags.length} tags
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold text-red-800 mb-2">Error</h2>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Tags Grid */}
        {!loading && !error && (
          <>
            {filteredTags.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredTags.map((tag) => (
                  <Link
                    key={tag._id}
                    href={`/tags/${tag.slug}`}
                    className="bg-white rounded-lg shadow-md border border-gray-200 p-5 hover:shadow-lg hover:border-blue-300 transition group"
                  >
                    {/* Tag Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {tag.icon && (
                          <span className="text-2xl flex-shrink-0">{tag.icon}</span>
                        )}
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition">
                          {tag.name}
                        </h3>
                      </div>
                    </div>

                    {/* Tag Description */}
                    {tag.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {tag.description}
                      </p>
                    )}

                    {/* Tag Stats */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        {tag.usageCount} {tag.usageCount === 1 ? 'question' : 'questions'}
                      </span>
                      <span className="text-blue-600 group-hover:text-blue-700 font-medium">
                        View →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Tags Found</h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery
                    ? `No tags match "${searchQuery}". Try a different search term.`
                    : 'No tags are available yet.'}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {/* Popular Categories Section */}
        {!loading && !error && !searchQuery && tags.length > 0 && (
          <div className="mt-12 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-8 border border-blue-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Popular Categories</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {tags.slice(0, 6).map((tag) => (
                <div key={tag._id} className="flex items-center gap-3">
                  {tag.icon && <span className="text-3xl">{tag.icon}</span>}
                  <div>
                    <Link
                      href={`/tags/${tag.slug}`}
                      className="font-semibold text-gray-900 hover:text-blue-600 transition"
                    >
                      {tag.name}
                    </Link>
                    <p className="text-sm text-gray-600">
                      {tag.usageCount} questions
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-600">
              💡 <strong>Pro tip:</strong> Use specific tags to help others find your question quickly.
              For example, use "refrigerator" instead of just "appliance".
            </p>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-12 bg-white rounded-lg shadow-md border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Use Tags</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-gray-900 mb-2">📌 Be Specific</h3>
              <p className="text-sm text-gray-600">
                Use specific appliance types like "washing-machine", "refrigerator", or "dishwasher"
                rather than generic terms.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">🎯 Use Multiple Tags</h3>
              <p className="text-sm text-gray-600">
                Combine appliance tags with problem type tags like "leak", "noise", or "not-starting"
                for better categorization.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">✅ Follow Existing Tags</h3>
              <p className="text-sm text-gray-600">
                Before creating a new tag, check if a similar one already exists to keep the
                community organized.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">💬 Get Better Answers</h3>
              <p className="text-sm text-gray-600">
                Proper tagging helps experts in specific appliances find your question faster,
                leading to quicker and more accurate solutions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
