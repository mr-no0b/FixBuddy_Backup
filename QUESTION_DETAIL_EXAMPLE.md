# Example: Question Detail Page with New Components

This is a complete example of how to use the new AnswerCard, CommentSection, and RichTextEditor components together in a question detail page.

## File: `app/questions/[id]/page.tsx`

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar, AnswerCard, CommentSection, RichTextEditor, VoteButton } from '@/components';
import Link from 'next/link';

export default function QuestionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const questionId = params.id as string;

  // State
  const [question, setQuestion] = useState<any>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [answerContent, setAnswerContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch data on mount
  useEffect(() => {
    fetchCurrentUser();
    fetchQuestion();
    fetchAnswers();
  }, [questionId]);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  };

  const fetchQuestion = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/questions/${questionId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch question');
      }

      setQuestion(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load question');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnswers = async () => {
    try {
      const response = await fetch(`/api/questions/${questionId}/answers`);
      const data = await response.json();

      if (response.ok) {
        setAnswers(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch answers:', error);
    }
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      router.push('/auth-test');
      return;
    }

    if (!answerContent.trim() || answerContent.length < 30) {
      setError('Answer must be at least 30 characters');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const response = await fetch(`/api/questions/${questionId}/answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: answerContent })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to post answer');
      }

      // Add new answer to list
      setAnswers([...answers, data.data]);
      setAnswerContent('');
      
      // Scroll to answers section
      document.getElementById('answers')?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post answer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptAnswer = async (answerId: string) => {
    try {
      const response = await fetch(`/api/answers/${answerId}/accept`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to accept answer');
      }

      // Refresh answers
      fetchAnswers();
    } catch (error) {
      console.error('Failed to accept answer:', error);
      alert('Failed to accept answer. Please try again.');
    }
  };

  const handleVoteAnswer = async (answerId: string, voteType: 'upvote' | 'downvote') => {
    try {
      const response = await fetch(`/api/answers/${answerId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType })
      });

      if (!response.ok) {
        throw new Error('Failed to vote');
      }

      // Refresh answers to get updated vote count
      fetchAnswers();
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  const handleVoteQuestion = async (questionId: string, voteType: 'upvote' | 'downvote') => {
    try {
      const response = await fetch(`/api/questions/${questionId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType })
      });

      if (!response.ok) {
        throw new Error('Failed to vote');
      }

      // Refresh question
      fetchQuestion();
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-5xl mx-auto p-6">
          <div className="text-center py-12">Loading question...</div>
        </div>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-5xl mx-auto p-6">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error || 'Question not found'}</p>
            <Link href="/" className="text-blue-600 hover:underline">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-5xl mx-auto p-6">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          {' '}/{' '}
          <Link href="/" className="hover:text-blue-600">Questions</Link>
          {' '}/{' '}
          <span className="text-gray-900">{question.title}</span>
        </nav>

        {/* Question Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {question.title}
          </h1>

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-6 pb-4 border-b border-gray-200">
            <span>Asked {new Date(question.createdAt).toLocaleDateString()}</span>
            <span>•</span>
            <span>👁️ {question.views.toLocaleString()} views</span>
            <span>•</span>
            <span>💬 {answers.length} {answers.length === 1 ? 'answer' : 'answers'}</span>
          </div>

          {/* Question Content with Vote */}
          <div className="flex gap-4">
            {/* Vote Button */}
            <div>
              <VoteButton
                itemId={question._id}
                itemType="question"
                initialVotes={question.votes}
                size="large"
              />
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="prose prose-sm max-w-none mb-6">
                <div
                  className="text-gray-800 whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{
                    __html: question.content
                      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\*(.+?)\*/g, '<em>$1</em>')
                      .replace(/`(.+?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded">$1</code>')
                      .replace(/\n/g, '<br />')
                  }}
                />
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {question.tags.map((tag: any) => (
                  <Link
                    key={tag._id}
                    href={`/tags/${tag.slug}`}
                    className="inline-flex items-center px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 text-sm rounded-full transition"
                  >
                    {tag.icon && <span className="mr-1">{tag.icon}</span>}
                    {tag.name}
                  </Link>
                ))}
              </div>

              {/* Author */}
              {question.author && (
                <div className="flex items-center gap-3">
                  <Link
                    href={`/users/${question.author._id}`}
                    className="flex items-center gap-2 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                      {question.author.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                        {question.author.username}
                      </p>
                      <p className="text-xs text-gray-500">
                        {question.author.reputation.toLocaleString()} reputation
                      </p>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Question Comments */}
          <CommentSection
            itemId={question._id}
            itemType="question"
            currentUserId={currentUser?._id}
          />
        </div>

        {/* Answers Section */}
        <div id="answers" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
          </h2>

          <div className="space-y-6">
            {answers.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <p className="text-gray-600 mb-4">No answers yet</p>
                <p className="text-sm text-gray-500">Be the first to answer this question!</p>
              </div>
            ) : (
              answers.map((answer) => (
                <div key={answer._id}>
                  <AnswerCard
                    answer={answer}
                    questionAuthorId={question.author?._id}
                    currentUserId={currentUser?._id}
                    onAccept={handleAcceptAnswer}
                    onVote={handleVoteAnswer}
                  />
                  
                  {/* Answer Comments */}
                  <div className="ml-16 mt-2">
                    <CommentSection
                      itemId={answer._id}
                      itemType="answer"
                      currentUserId={currentUser?._id}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Answer Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Your Answer</h3>

          {currentUser ? (
            <form onSubmit={handleSubmitAnswer}>
              <RichTextEditor
                value={answerContent}
                onChange={setAnswerContent}
                placeholder="Write your answer here... (minimum 30 characters)"
                minHeight="300px"
                disabled={submitting}
              />

              {error && (
                <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
                  {error}
                </div>
              )}

              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {answerContent.length} characters
                  {answerContent.length < 30 && (
                    <span className="text-red-600 ml-2">
                      (minimum 30 required)
                    </span>
                  )}
                </p>
                <button
                  type="submit"
                  disabled={submitting || answerContent.length < 30}
                  className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                >
                  {submitting ? 'Posting...' : 'Post Your Answer'}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-600 mb-4">You must be logged in to answer this question</p>
              <Link
                href="/auth-test"
                className="inline-block px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
              >
                Login to Answer
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

## Visual Preview

```
┌──────────────────────────────────────────────────────────┐
│  🔧 FixBuddy    [Search]    [@john ▼]                   │ ← Navbar
├──────────────────────────────────────────────────────────┤
│  Home / Questions / My dishwasher is not draining        │ ← Breadcrumb
│                                                           │
│  ┌────────────────────────────────────────────────────┐ │
│  │ My dishwasher is not draining properly            │ │ ← Question Card
│  │                                                     │ │
│  │ Asked 2 days ago • 👁️ 145 views • 💬 3 answers    │ │
│  │ ────────────────────────────────────────────────── │ │
│  │ ⬆  The water stays at the bottom after every      │ │
│  │ 12 cycle. What could be the problem?              │ │
│  │ ⬇                                                  │ │
│  │    [🔧 dishwasher] [💧 drainage] [🔨 repair]       │ │
│  │                                                     │ │
│  │    👤 john_repairman (850 rep)                     │ │
│  │                                                     │ │
│  │    ─── 2 Comments ───                              │ │ ← CommentSection
│  │    💬 sarah: Did you check the filter?             │ │
│  │    💬 mike: Could be the drain pump                │ │
│  │    [Add a comment]                                 │ │
│  └────────────────────────────────────────────────────┘ │
│                                                           │
│  3 Answers                                                │
│                                                           │
│  ┌────────────────────────────────────────────────────┐ │
│  │ ✓ Accepted Answer                                  │ │ ← AnswerCard (Accepted)
│  │                                                     │ │
│  │ ⬆  Check the drain filter first. It's usually...  │ │
│  │ 15 Steps to clean:                                 │ │
│  │ ✓  1. Turn off the dishwasher                      │ │
│  │ ⬇  2. Remove the lower rack                        │ │
│  │    3. Locate the cylindrical filter                │ │
│  │                                                     │ │
│  │    👤 sarah_techie (620 rep) • 1 day ago           │ │
│  │                                                     │ │
│  │    ─── 1 Comment ───                               │ │
│  │    💬 john: This worked! Thank you!                │ │
│  └────────────────────────────────────────────────────┘ │
│                                                           │
│  ┌────────────────────────────────────────────────────┐ │
│  │ ⬆  Another possibility is the drain pump...       │ │ ← AnswerCard (Regular)
│  │ 8                                                   │ │
│  │ ⬇  Check if there's a humming sound...            │ │
│  │    [✓ Accept]                                      │ │
│  │    👤 mike_fixer (450 rep) • 5 hours ago           │ │
│  └────────────────────────────────────────────────────┘ │
│                                                           │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Your Answer                                         │ │ ← Answer Form
│  │                                                     │ │
│  │ [B] [I] [H] | [• List] [1. List] | [</>] [```]   │ │ ← RichTextEditor Toolbar
│  │                                                     │ │
│  │ ┌────────────────────────────────────────────────┐│ │
│  │ │ Write your answer here...                      ││ │
│  │ │                                                 ││ │
│  │ │                                                 ││ │
│  │ │                                                 ││ │
│  │ └────────────────────────────────────────────────┘│ │
│  │                                                     │ │
│  │ 0 characters (minimum 30 required)                 │ │
│  │                            [Post Your Answer]      │ │
│  └────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

## Features Demonstrated

✅ **Question display** with vote button
✅ **Question comments** using CommentSection
✅ **Multiple answers** with AnswerCard
✅ **Accepted answer** highlighted in green
✅ **Accept button** (only for question author)
✅ **Answer comments** for each answer
✅ **Rich text editor** for writing answers
✅ **Login check** - prompts to login if not authenticated
✅ **Real-time updates** after voting/accepting
✅ **Responsive layout** for all screen sizes

## To Use This Example

1. Create the file at `app/questions/[id]/page.tsx`
2. Copy the code above
3. Visit `http://localhost:3000/questions/[some-question-id]`
4. You'll see the complete question detail page with all features!

**All components work together seamlessly! 🎉**
