'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Author {
  _id?: string;
  username: string;
  reputation: number;
  avatar?: string;
}

interface Comment {
  _id: string;
  content: string;
  author: Author | null;
  createdAt: string;
  updatedAt?: string;
}

interface CommentSectionProps {
  itemId: string;
  itemType: 'question' | 'answer';
  currentUserId?: string;
}

export default function CommentSection({
  itemId,
  itemType,
  currentUserId
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch comments
  useEffect(() => {
    fetchComments();
  }, [itemId, itemType]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      setError(null);

      const endpoint =
        itemType === 'question'
          ? `/api/questions/${itemId}/comments`
          : `/api/answers/${itemId}/comments`;

      const response = await fetch(endpoint);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch comments');
      }

      setComments(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  // Submit comment
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    if (newComment.length < 5) {
      setError('Comment must be at least 5 characters');
      return;
    }

    if (newComment.length > 500) {
      setError('Comment must be less than 500 characters');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const endpoint =
        itemType === 'question'
          ? `/api/questions/${itemId}/comments`
          : `/api/answers/${itemId}/comments`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to post comment');
      }

      // Add new comment to list
      setComments([...comments, data.data]);
      setNewComment('');
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="mt-4 border-t border-gray-200 pt-4">
      {/* Comments Header */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-700">
          {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
        </h4>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-sm text-gray-500 py-2">Loading comments...</div>
      )}

      {/* Error State */}
      {error && !submitting && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2 mb-3">
          {error}
        </div>
      )}

      {/* Comments List */}
      {!loading && comments.length > 0 && (
        <div className="space-y-3 mb-3">
          {comments.map((comment) => (
            <div
              key={comment._id}
              className="flex gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              {/* Avatar */}
              <div className="flex-shrink-0">
                {comment.author ? (
                  <Link href={`/users/${comment.author._id}`}>
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white font-bold text-xs">
                      {comment.author.username.charAt(0).toUpperCase()}
                    </div>
                  </Link>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold text-xs">
                    ?
                  </div>
                )}
              </div>

              {/* Comment Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1">
                  {comment.author ? (
                    <Link
                      href={`/users/${comment.author._id}`}
                      className="text-sm font-medium text-gray-900 hover:text-blue-600"
                    >
                      {comment.author.username}
                    </Link>
                  ) : (
                    <span className="text-sm font-medium text-gray-500">
                      [deleted]
                    </span>
                  )}
                  {comment.author && (
                    <span className="text-xs text-gray-500">
                      {comment.author.reputation.toLocaleString()}
                    </span>
                  )}
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">
                    {formatDate(comment.createdAt)}
                  </span>
                  {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                    <span className="text-xs text-gray-400">(edited)</span>
                  )}
                </div>
                <p className="text-sm text-gray-700 break-words">
                  {comment.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && comments.length === 0 && (
        <p className="text-sm text-gray-500 py-2">
          No comments yet. Be the first to comment!
        </p>
      )}

      {/* Add Comment Button/Form */}
      {currentUserId ? (
        showForm ? (
          <form onSubmit={handleSubmit} className="mt-3">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment... (5-500 characters)"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              maxLength={500}
              disabled={submitting}
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500">
                {newComment.length}/500 characters
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setNewComment('');
                    setError(null);
                  }}
                  disabled={submitting}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || newComment.length < 5}
                  className="px-4 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                >
                  {submitting ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Add a comment
          </button>
        )
      ) : (
        <p className="text-sm text-gray-500">
          <Link href="/auth-test" className="text-blue-600 hover:underline">
            Login
          </Link>{' '}
          to add a comment
        </p>
      )}
    </div>
  );
}
