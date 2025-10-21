'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar, UserProfileCard, QuestionCard, LoadingSpinner, ErrorBoundary } from '@/components';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  reputation: number;
  createdAt: string;
  lastActiveAt: string;
  stats: {
    questions: number;
    answers: number;
    acceptedAnswers: number;
  };
}

interface Activity {
  recentQuestions: any[];
  recentAnswers: any[];
}

type TabType = 'overview' | 'questions' | 'answers';

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const userId = params?.id as string;
  const isOwnProfile = currentUser?._id === userId;

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId || userId === 'undefined') {
        setError('Invalid user ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const response = await fetch(`/api/users/${userId}?activity=true`);
        const data = await response.json();

        if (data.success) {
          setUser(data.user);
          setActivity(data.activity);
        } else {
          setError(data.message || 'Failed to load user profile');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  // Handle edit profile
  const handleEditProfile = () => {
    if (!userId || userId === 'undefined') {
      console.error('Invalid user ID for editing');
      return;
    }
    router.push(`/users/${userId}/edit`);
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

  if (error || !user) {
    return (
      <ErrorBoundary>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold text-red-800 mb-2">User Not Found</h2>
            <p className="text-red-700 mb-4">{error || 'The user you are looking for does not exist.'}</p>
            <Link
              href="/"
              className="inline-block px-6 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition"
            >
              Go to Home
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Profile Card */}
          <div className="lg:col-span-1">
            <UserProfileCard
              user={{
                _id: user.id,
                username: user.username,
                email: user.email,
                reputation: user.reputation,
                avatar: user.avatar,
                bio: user.bio,
                createdAt: user.createdAt,
              }}
              stats={{
                ...user.stats,
                comments: 0 // TODO: Add comments count when available
              }}
              showEmail={isOwnProfile}
              showActions={isOwnProfile}
              onEdit={handleEditProfile}
            />
          </div>

          {/* Main Content - Activity */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-6">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition ${
                    activeTab === 'overview'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('questions')}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition ${
                    activeTab === 'questions'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Questions ({user.stats.questions})
                </button>
                <button
                  onClick={() => setActiveTab('answers')}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition ${
                    activeTab === 'answers'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Answers ({user.stats.answers})
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <>
                  {/* Stats Summary */}
                  <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Activity Summary</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-blue-600">{user.stats.questions}</div>
                        <div className="text-sm text-gray-600 mt-1">Questions Asked</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-green-600">{user.stats.answers}</div>
                        <div className="text-sm text-gray-600 mt-1">Answers Given</div>
                      </div>
                      <div className="bg-yellow-50 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-yellow-600">{user.stats.acceptedAnswers}</div>
                        <div className="text-sm text-gray-600 mt-1">Solutions</div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-purple-600">{user.reputation}</div>
                        <div className="text-sm text-gray-600 mt-1">Reputation</div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Questions */}
                  {activity?.recentQuestions && activity.recentQuestions.length > 0 && (
                    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Recent Questions</h3>
                        <Link
                          href={`/api/users/${userId}/questions`}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          View all →
                        </Link>
                      </div>
                      <div className="space-y-4">
                        {activity.recentQuestions.map((question) => (
                          <QuestionCard key={question._id} question={question} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent Answers */}
                  {activity?.recentAnswers && activity.recentAnswers.length > 0 && (
                    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Recent Answers</h3>
                        <Link
                          href={`/api/users/${userId}/answers`}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          View all →
                        </Link>
                      </div>
                      <div className="space-y-4">
                        {activity.recentAnswers.map((answer) => (
                          <div
                            key={answer._id}
                            className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <Link
                                href={`/questions/${answer.question._id}`}
                                className="text-blue-600 hover:text-blue-700 font-medium flex-1"
                              >
                                {answer.question.title}
                              </Link>
                              {answer.isAccepted && (
                                <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                                  ✓ Accepted
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <span className={answer.votes > 0 ? 'text-green-600' : answer.votes < 0 ? 'text-red-600' : ''}>
                                  {answer.votes > 0 ? '+' : ''}{answer.votes} votes
                                </span>
                              </span>
                              <span>
                                {new Date(answer.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Empty State */}
                  {(!activity?.recentQuestions || activity.recentQuestions.length === 0) &&
                   (!activity?.recentAnswers || activity.recentAnswers.length === 0) && (
                    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12 text-center">
                      <div className="text-6xl mb-4">📝</div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">No Activity Yet</h3>
                      <p className="text-gray-600 mb-4">
                        {isOwnProfile
                          ? "You haven't posted any questions or answers yet."
                          : `${user.username} hasn't posted any questions or answers yet.`}
                      </p>
                      {isOwnProfile && (
                        <Link
                          href="/questions/ask"
                          className="inline-block px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
                        >
                          Ask a Question
                        </Link>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Questions Tab */}
              {activeTab === 'questions' && (
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">All Questions</h3>
                  {activity?.recentQuestions && activity.recentQuestions.length > 0 ? (
                    <div className="space-y-4">
                      {activity.recentQuestions.map((question) => (
                        <QuestionCard key={question._id} question={question} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-4xl mb-2">❓</div>
                      <p className="text-gray-600">No questions yet</p>
                    </div>
                  )}
                </div>
              )}

              {/* Answers Tab */}
              {activeTab === 'answers' && (
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">All Answers</h3>
                  {activity?.recentAnswers && activity.recentAnswers.length > 0 ? (
                    <div className="space-y-4">
                      {activity.recentAnswers.map((answer) => (
                        <div
                          key={answer._id}
                          className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <Link
                              href={`/questions/${answer.question._id}`}
                              className="text-blue-600 hover:text-blue-700 font-medium flex-1"
                            >
                              {answer.question.title}
                            </Link>
                            {answer.isAccepted && (
                              <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                                ✓ Accepted
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-700 mb-2 line-clamp-2">
                            {answer.content}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <span className={answer.votes > 0 ? 'text-green-600' : answer.votes < 0 ? 'text-red-600' : ''}>
                                {answer.votes > 0 ? '+' : ''}{answer.votes} votes
                              </span>
                            </span>
                            <span>
                              {new Date(answer.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-4xl mb-2">💬</div>
                      <p className="text-gray-600">No answers yet</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
