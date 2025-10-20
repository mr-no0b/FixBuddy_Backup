'use client';

import { useState } from 'react';
import VoteButton from './VoteButton';
import Link from 'next/link';

interface Author {
  _id?: string;
  username: string;
  reputation: number;
  avatar?: string;
}

interface AnswerCardProps {
  answer: {
    _id: string;
    content: string;
    author: Author | null;
    votes: number;
    isAccepted: boolean;
    createdAt: string;
    updatedAt?: string;
  };
  questionAuthorId?: string;
  currentUserId?: string;
  onAccept?: (answerId: string) => void;
  onVote?: (answerId: string, voteType: 'upvote' | 'downvote') => void;
  showAcceptButton?: boolean;
}

export default function AnswerCard({
  answer,
  questionAuthorId,
  currentUserId,
  onAccept,
  onVote,
  showAcceptButton = true
}: AnswerCardProps) {
  const [isAccepting, setIsAccepting] = useState(false);

  // Check if current user is the question author
  const isQuestionAuthor = currentUserId && currentUserId === questionAuthorId;

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  // Handle accept answer
  const handleAccept = async () => {
    if (!onAccept || isAccepting) return;
    
    setIsAccepting(true);
    try {
      await onAccept(answer._id);
    } finally {
      setIsAccepting(false);
    }
  };

  return (
    <div
      className={`flex gap-4 p-6 bg-white rounded-lg border transition ${
        answer.isAccepted
          ? 'border-green-300 bg-green-50'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      {/* Vote Section */}
      <div className="flex flex-col items-center gap-2">
        <VoteButton
          itemId={answer._id}
          itemType="answer"
          initialVotes={answer.votes}
          onVoteChange={(newVotes) => {
            if (onVote) {
              // This is just for display update - the actual voting is handled by the parent
            }
          }}
          size="large"
        />

        {/* Accept Button */}
        {showAcceptButton && !answer.isAccepted && isQuestionAuthor && (
          <button
            onClick={handleAccept}
            disabled={isAccepting}
            className="p-2 rounded-full border-2 border-gray-300 hover:border-green-500 hover:bg-green-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            title="Accept this answer"
          >
            <svg
              className="w-6 h-6 text-gray-400 hover:text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </button>
        )}

        {/* Accepted Badge */}
        {answer.isAccepted && (
          <div className="flex items-center justify-center w-10 h-10 bg-green-500 rounded-full" title="Accepted Answer">
            <svg
              className="w-6 h-6 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex-1 min-w-0">
        {/* Accepted Banner */}
        {answer.isAccepted && (
          <div className="flex items-center gap-2 mb-3 text-green-700 font-medium">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
            <span>Accepted Answer</span>
          </div>
        )}

        {/* Answer Content */}
        <div className="prose prose-sm max-w-none mb-4">
          <div
            className="text-gray-800 whitespace-pre-wrap break-words"
            dangerouslySetInnerHTML={{
              __html: answer.content
                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.+?)\*/g, '<em>$1</em>')
                .replace(/`(.+?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>')
                .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-4 mb-2">$1</h2>')
                .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold mt-3 mb-2">$1</h3>')
                .replace(/^- (.+)$/gm, '<li class="ml-4">• $1</li>')
                .replace(/^\d+\. (.+)$/gm, '<li class="ml-4">$1</li>')
                .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-700">$1</blockquote>')
                .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-blue-600 hover:underline">$1</a>')
                .replace(/\n/g, '<br />')
            }}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          {/* Author Info */}
          <div className="flex items-center gap-3">
            {answer.author ? (
              <>
                <Link
                  href={`/users/${answer.author._id}`}
                  className="flex items-center gap-2 group"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                    {answer.author.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                      {answer.author.username}
                    </p>
                    <p className="text-xs text-gray-500">
                      {answer.author.reputation.toLocaleString()} reputation
                    </p>
                  </div>
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold text-sm">
                  ?
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Anonymous</p>
                  <p className="text-xs text-gray-400">Deleted user</p>
                </div>
              </div>
            )}
          </div>

          {/* Date */}
          <div className="text-xs text-gray-500">
            answered {formatDate(answer.createdAt)}
            {answer.updatedAt && answer.updatedAt !== answer.createdAt && (
              <span className="ml-2">(edited {formatDate(answer.updatedAt)})</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
