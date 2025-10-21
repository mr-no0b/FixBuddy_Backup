'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Navbar,
  LoadingSpinner,
  ErrorBoundary,
  VoteButton,
  TagBadge,
  UserAvatar,
  AnswerCard,
  CommentSection,
  SimpleTextArea
} from '@/components';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface User {
  _id: string;
  username: string;
  reputation: number;
  avatar?: string;
}

interface Comment {
  _id: string;
  content: string;
  author: User;
  createdAt: string;
  votes: number;
}

interface Answer {
  _id: string;
  content: string;
  author: User;
  votes: number;
  isAccepted: boolean;
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
  userVote?: 'up' | 'down';
}

interface Question {
  _id: string;
  title: string;
  content: string;
  author: User;
  tags: Array<{ _id: string; name: string; slug: string }>;
  votes: number;
  views: number;
  answerCount: number;
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
  answers: Answer[];
  userVote?: 'up' | 'down';
}

export default function QuestionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const questionId = params?.id as string;

  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [answerContent, setAnswerContent] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [answerError, setAnswerError] = useState('');

  // Fetch question details
  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/questions/${questionId}`);
        const data = await response.json();

        if (data.success) {
          setQuestion(data.question);
        } else {
          setError(data.message || 'Failed to load question');
        }
      } catch (err) {
        setError('Failed to load question');
        console.error('Error fetching question:', err);
      } finally {
        setLoading(false);
      }
    };

    if (questionId) {
      fetchQuestion();
    }
  }, [questionId]);

  // Handle answer submission
  const handleAnswerSubmit = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!answerContent.trim()) {
      setAnswerError('Please provide an answer');
      return;
    }

    try {
      setSubmittingAnswer(true);
      setAnswerError('');

      const response = await fetch(`/api/questions/${questionId}/answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: answerContent })
      });

      const data = await response.json();

      if (data.success) {
        // Refresh question to get new answer
        const refreshResponse = await fetch(`/api/questions/${questionId}`);
        const refreshData = await refreshResponse.json();
        if (refreshData.success) {
          setQuestion(refreshData.question);
          setAnswerContent('');
        }
      } else {
        setAnswerError(data.message || 'Failed to post answer');
      }
    } catch (err) {
      setAnswerError('Failed to post answer');
      console.error('Error posting answer:', err);
    } finally {
      setSubmittingAnswer(false);
    }
  };

  // Handle answer accepted
  const handleAnswerAccepted = async (answerId: string) => {
    if (!question) return;
    
    try {
      const response = await fetch(`/api/answers/${answerId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (data.success) {
        // Update local state with the accepted answer
        setQuestion({
          ...question,
          answers: question.answers.map(answer => ({
            ...answer,
            isAccepted: answer._id === answerId
          }))
        });
      } else {
        console.error('Failed to accept answer:', data.message);
        alert(data.message || 'Failed to accept answer');
      }
    } catch (error) {
      console.error('Error accepting answer:', error);
      alert('Failed to accept answer');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" text="Loading question..." />
        </div>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-5xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-red-800 mb-2">
              Question Not Found
            </h2>
            <p className="text-red-600 mb-4">
              {error || 'The question you are looking for does not exist.'}
            </p>
            <Link
              href="/"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isAuthor = user?._id === question.author._id;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="max-w-5xl mx-auto p-6">
          {/* Breadcrumb */}
          <nav className="mb-6 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">
              Home
            </Link>
            {' '}/{' '}
            <Link href="/" className="hover:text-blue-600">
              Questions
            </Link>
            {' '}/{' '}
            <span className="text-gray-900 font-medium">
              {question.title.slice(0, 50)}...
            </span>
          </nav>

          {/* Question Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            {/* Title and Actions */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex-1">
                {question.title}
              </h1>
              {isAuthor && (
                <Link
                  href={`/questions/${questionId}/edit`}
                  className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 font-medium border border-blue-300 rounded-lg hover:bg-blue-50 transition"
                >
                  Edit
                </Link>
              )}
            </div>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
              <span>
                Asked{' '}
                <time dateTime={question.createdAt}>
                  {new Date(question.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </time>
              </span>
              {question.updatedAt !== question.createdAt && (
                <span>
                  Modified{' '}
                  <time dateTime={question.updatedAt}>
                    {new Date(question.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </time>
                </span>
              )}
              <span>{question.views} views</span>
            </div>

            {/* Question Content with Votes */}
            <div className="flex gap-6">
              {/* Vote Section */}
              <div className="flex flex-col items-center gap-2">
                <VoteButton
                  itemId={questionId}
                  itemType="question"
                  initialVotes={question.votes}
                  initialUserVote={
                    question.userVote === 'up' ? 'upvote' : 
                    question.userVote === 'down' ? 'downvote' : 
                    null
                  }
                  onVoteChange={(newVotes) => {
                    setQuestion({ ...question, votes: newVotes });
                  }}
                  size="large"
                />
              </div>

              {/* Content */}
              <div className="flex-1">
                <div
                  className="prose prose-sm sm:prose max-w-none mb-6"
                  style={{ color: '#000000' }}
                  dangerouslySetInnerHTML={{ __html: question.content }}
                />

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {question.tags.map((tag) => (
                    <TagBadge key={tag._id} tag={tag} />
                  ))}
                </div>

                {/* Author Info */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-3">
                    <UserAvatar user={question.author} size="md" />
                    <div>
                      <Link
                        href={`/users/${question.author._id}`}
                        className="font-medium text-blue-600 hover:text-blue-800"
                      >
                        {question.author.username}
                      </Link>
                      <p className="text-sm text-gray-600">
                        {question.author.reputation} reputation
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Question Comments */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <CommentSection
              itemId={questionId}
              itemType="question"
              currentUserId={user?._id}
            />
          </div>

          {/* Answers Section */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {question.answerCount} {question.answerCount === 1 ? 'Answer' : 'Answers'}
            </h2>

            <div className="space-y-6">
              {question.answers
                .sort((a, b) => {
                  // Accepted answer first
                  if (a.isAccepted && !b.isAccepted) return -1;
                  if (!a.isAccepted && b.isAccepted) return 1;
                  // Then by votes
                  return b.votes - a.votes;
                })
                .map((answer) => (
                  <AnswerCard
                    key={answer._id}
                    answer={answer}
                    questionAuthorId={question.author._id}
                    currentUserId={user?._id}
                    onAccept={handleAnswerAccepted}
                    showAcceptButton={isAuthor}
                  />
                ))}
            </div>
          </div>

          {/* Your Answer Section */}
          {user ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Your Answer
              </h2>

              {answerError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{answerError}</p>
                </div>
              )}

              <SimpleTextArea
                value={answerContent}
                onChange={setAnswerContent}
                placeholder="Write your answer here... Provide detailed steps and explanations to help solve the problem."
                rows={8}
                disabled={submittingAnswer}
              />

              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Please provide a detailed and helpful answer
                </p>
                <button
                  onClick={handleAnswerSubmit}
                  disabled={submittingAnswer || !answerContent.trim()}
                  className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                >
                  {submittingAnswer ? (
                    <span className="flex items-center gap-2">
                      <LoadingSpinner size="sm" />
                      Posting...
                    </span>
                  ) : (
                    'Post Your Answer'
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
              <p className="text-gray-700 mb-4">
                You must be logged in to post an answer
              </p>
              <Link
                href="/login"
                className="inline-flex items-center px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
              >
                Login to Answer
              </Link>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}
