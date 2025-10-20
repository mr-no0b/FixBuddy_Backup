'use client';

import { useState } from 'react';

interface VoteButtonProps {
  itemId: string;
  itemType: 'question' | 'answer';
  initialVotes: number;
  initialUserVote?: 'upvote' | 'downvote' | null;
  onVoteChange?: (newVotes: number) => void;
  size?: 'small' | 'medium' | 'large';
}

export default function VoteButton({
  itemId,
  itemType,
  initialVotes,
  initialUserVote = null,
  onVoteChange,
  size = 'medium'
}: VoteButtonProps) {
  const [votes, setVotes] = useState(initialVotes);
  const [userVote, setUserVote] = useState<'upvote' | 'downvote' | null>(initialUserVote);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Size variants
  const sizeClasses = {
    small: {
      container: 'space-y-1',
      button: 'w-6 h-6',
      icon: 'w-3 h-3',
      text: 'text-xs'
    },
    medium: {
      container: 'space-y-1',
      button: 'w-8 h-8',
      icon: 'w-4 h-4',
      text: 'text-sm'
    },
    large: {
      container: 'space-y-2',
      button: 'w-10 h-10',
      icon: 'w-5 h-5',
      text: 'text-base'
    }
  };

  const classes = sizeClasses[size];

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    // If clicking same vote type, remove vote
    const finalVoteType = userVote === voteType ? 'remove' : voteType;
    
    setIsLoading(true);
    setError('');

    try {
      const endpoint = itemType === 'question' 
        ? `/api/questions/${itemId}/vote`
        : `/api/answers/${itemId}/vote`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType: finalVoteType })
      });

      const data = await response.json();

      if (data.success) {
        const newVotes = data[itemType].votes;
        setVotes(newVotes);
        setUserVote(finalVoteType === 'remove' ? null : finalVoteType);
        
        if (onVoteChange) {
          onVoteChange(newVotes);
        }
      } else {
        setError(data.message || 'Failed to vote');
        // Reset to previous state after 3 seconds
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      setError('You must be logged in to vote');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex flex-col items-center ${classes.container}`}>
      {/* Upvote Button */}
      <button
        onClick={() => handleVote('upvote')}
        disabled={isLoading}
        className={`
          ${classes.button}
          flex items-center justify-center
          rounded-lg border-2 transition-all
          ${userVote === 'upvote'
            ? 'bg-green-500 border-green-600 text-white'
            : 'bg-white border-gray-300 text-gray-600 hover:border-green-500 hover:bg-green-50 hover:text-green-600'
          }
          ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
        title="Upvote"
        aria-label="Upvote"
      >
        <svg
          className={classes.icon}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Vote Count */}
      <span
        className={`
          ${classes.text}
          font-bold
          ${votes > 0 ? 'text-green-600' : votes < 0 ? 'text-red-600' : 'text-gray-700'}
          transition-colors
        `}
      >
        {votes > 0 ? `+${votes}` : votes}
      </span>

      {/* Downvote Button */}
      <button
        onClick={() => handleVote('downvote')}
        disabled={isLoading}
        className={`
          ${classes.button}
          flex items-center justify-center
          rounded-lg border-2 transition-all
          ${userVote === 'downvote'
            ? 'bg-red-500 border-red-600 text-white'
            : 'bg-white border-gray-300 text-gray-600 hover:border-red-500 hover:bg-red-50 hover:text-red-600'
          }
          ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
        title="Downvote"
        aria-label="Downvote"
      >
        <svg
          className={classes.icon}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Error Message */}
      {error && (
        <div className="absolute mt-28 px-3 py-1 bg-red-100 border border-red-300 text-red-700 text-xs rounded-md whitespace-nowrap">
          {error}
        </div>
      )}
    </div>
  );
}
