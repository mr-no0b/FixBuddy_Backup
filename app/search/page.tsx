'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Navbar, Sidebar, QuestionCard, LoadingSpinner, ErrorBoundary, UserAvatar, TagBadge } from '@/components';
import Link from 'next/link';

interface SearchResults {
  questions?: any[];
  users?: any[];
  tags?: any[];
}

type SearchType = 'all' | 'questions' | 'users' | 'tags';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams?.get('q') || searchParams?.get('query') || '';
  const initialType = (searchParams?.get('type') as SearchType) || 'all';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchType, setSearchType] = useState<SearchType>(initialType);
  const [results, setResults] = useState<SearchResults>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [totalResults, setTotalResults] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);

  // Perform search
  const performSearch = async (query: string, type: SearchType) => {
    if (!query.trim() || query.length < 2) {
      setError('Please enter at least 2 characters to search');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setHasSearched(true);

      const response = await fetch(
        `/api/search?q=${encodeURIComponent(query)}&type=${type}&limit=20`
      );
      const data = await response.json();

      if (data.success) {
        setResults(data.results);
        setTotalResults(data.totalResults);
      } else {
        setError(data.message || 'Search failed');
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('Failed to perform search');
    } finally {
      setLoading(false);
    }
  };

  // Search on mount if query exists
  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery, initialType);
    }
  }, []);

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Update URL
      router.push(`/search?q=${encodeURIComponent(searchQuery)}&type=${searchType}`);
      performSearch(searchQuery, searchType);
    }
  };

  // Handle type change
  const handleTypeChange = (newType: SearchType) => {
    setSearchType(newType);
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}&type=${newType}`);
      performSearch(searchQuery, newType);
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        {/* Main Layout */}
        <div className="flex max-w-[1600px] mx-auto">
          {/* Main Content Area */}
          <main className="flex-1 p-4 sm:p-6">
            {/* Search Header */}
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Search</h1>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions, users, or tags..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                autoFocus
              />
              <button
                type="submit"
                disabled={loading || !searchQuery.trim()}
                className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleTypeChange('all')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                searchType === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Results
              {hasSearched && searchType === 'all' && ` (${totalResults})`}
            </button>
            <button
              onClick={() => handleTypeChange('questions')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                searchType === 'questions'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Questions
              {hasSearched && results.questions && ` (${results.questions.length})`}
            </button>
            <button
              onClick={() => handleTypeChange('users')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                searchType === 'users'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Users
              {hasSearched && results.users && ` (${results.users.length})`}
            </button>
            <button
              onClick={() => handleTypeChange('tags')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                searchType === 'tags'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tags
              {hasSearched && results.tags && ` (${results.tags.length})`}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {/* Search Results */}
        {!loading && hasSearched && (
          <>
            {totalResults === 0 ? (
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Results Found</h3>
                <p className="text-gray-600 mb-4">
                  We couldn't find anything matching "{searchQuery}". Try different keywords or
                  browse by tags.
                </p>
                <div className="flex gap-4 justify-center">
                  <Link
                    href="/tags"
                    className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
                  >
                    Browse Tags
                  </Link>
                  <Link
                    href="/questions/ask"
                    className="px-6 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition"
                  >
                    Ask a Question
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Questions Results */}
                {(searchType === 'all' || searchType === 'questions') &&
                  results.questions &&
                  results.questions.length > 0 && (
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-4">
                        Questions ({results.questions.length})
                      </h2>
                      <div className="space-y-4">
                        {results.questions.map((question) => (
                          <QuestionCard key={question._id} question={question} />
                        ))}
                      </div>
                    </div>
                  )}

                {/* Users Results */}
                {(searchType === 'all' || searchType === 'users') &&
                  results.users &&
                  results.users.length > 0 && (
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-4">
                        Users ({results.users.length})
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {results.users.map((user) => (
                          <Link
                            key={user._id}
                            href={`/users/${user._id}`}
                            className="bg-white rounded-lg shadow-md border border-gray-200 p-4 hover:shadow-lg hover:border-blue-300 transition"
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <UserAvatar
                                user={user}
                                size="md"
                                showBadge={false}
                                clickable={false}
                              />
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-gray-900 truncate">
                                  {user.username}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {user.reputation} reputation
                                </p>
                              </div>
                            </div>
                            {user.bio && (
                              <p className="text-sm text-gray-600 line-clamp-2">{user.bio}</p>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Tags Results */}
                {(searchType === 'all' || searchType === 'tags') &&
                  results.tags &&
                  results.tags.length > 0 && (
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-4">
                        Tags ({results.tags.length})
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {results.tags.map((tag) => (
                          <Link
                            key={tag._id}
                            href={`/tags/${tag.slug}`}
                            className="bg-white rounded-lg shadow-md border border-gray-200 p-4 hover:shadow-lg hover:border-blue-300 transition"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              {tag.icon && <span className="text-2xl">{tag.icon}</span>}
                              <h3 className="font-bold text-gray-900">{tag.name}</h3>
                            </div>
                            {tag.description && (
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                {tag.description}
                              </p>
                            )}
                            <p className="text-sm text-gray-500">
                              {tag.usageCount} {tag.usageCount === 1 ? 'question' : 'questions'}
                            </p>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            )}
          </>
        )}

        {/* Initial State - No Search Yet */}
        {!loading && !hasSearched && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Search FixBuddy</h3>
            <p className="text-gray-600 mb-6">
              Find questions, users, and tags to help with your appliance repairs.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="text-left">
                <h4 className="font-bold text-gray-900 mb-2">💬 Questions</h4>
                <p className="text-sm text-gray-600">
                  Search through thousands of repair questions and solutions
                </p>
              </div>
              <div className="text-left">
                <h4 className="font-bold text-gray-900 mb-2">👥 Users</h4>
                <p className="text-sm text-gray-600">
                  Find experts and community members by username
                </p>
              </div>
              <div className="text-left">
                <h4 className="font-bold text-gray-900 mb-2">🏷️ Tags</h4>
                <p className="text-sm text-gray-600">
                  Browse by appliance types and problem categories
                </p>
              </div>
            </div>

            <div className="mt-8">
              <Link
                href="/tags"
                className="inline-block px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
              >
                Browse All Tags
              </Link>
            </div>
          </div>
        )}
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
