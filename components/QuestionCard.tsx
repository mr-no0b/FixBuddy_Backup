'use client';

import Link from 'next/link';
import VoteButton from './VoteButton';

interface Tag {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
}

interface Author {
  _id?: string;
  username: string;
  reputation: number;
  avatar?: string;
}

interface QuestionCardProps {
  question: {
    _id: string;
    title: string;
    content: string;
    author: Author | null;
    tags: Tag[];
    votes: number;
    views: number;
    answerCount: number;
    status: 'open' | 'closed' | 'solved';
    createdAt: string;
    updatedAt?: string;
  };
  showVoting?: boolean;
  showExcerpt?: boolean;
  compact?: boolean;
}

export default function QuestionCard({
  question,
  showVoting = true,
  showExcerpt = true,
  compact = false
}: QuestionCardProps) {
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

  // Create excerpt from content (strip HTML tags)
  const getExcerpt = (text: string, maxLength: number = 150) => {
    // Strip HTML tags
    const stripped = text.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
    if (stripped.length <= maxLength) return stripped;
    return stripped.substring(0, maxLength).trim() + '...';
  };

  // Status badge styling
  const getStatusBadge = () => {
    const badges = {
      solved: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-300',
        icon: '✓',
        label: 'Solved'
      },
      closed: {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        border: 'border-gray-300',
        icon: '🔒',
        label: 'Closed'
      },
      open: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        border: 'border-blue-300',
        icon: '❓',
        label: 'Open'
      }
    };

    const badge = badges[question.status];
    return (
      <span className={`
        inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border
        ${badge.bg} ${badge.text} ${badge.border}
      `}>
        <span className="mr-1">{badge.icon}</span>
        {badge.label}
      </span>
    );
  };

  return (
    <div className={`
      bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow
      ${compact ? 'p-4' : 'p-6'}
    `}>
      <div className="flex gap-4">
        {/* Voting Section */}
        {showVoting && (
          <div className="flex-shrink-0">
            <VoteButton
              itemId={question._id}
              itemType="question"
              initialVotes={question.votes}
              size={compact ? 'small' : 'medium'}
            />
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <Link 
            href={`/questions/${question._id}`}
            className="block group"
          >
            <h3 className={`
              font-semibold text-gray-900 group-hover:text-blue-600 transition
              ${compact ? 'text-base' : 'text-lg'}
              line-clamp-2
            `}>
              {question.title}
            </h3>
          </Link>

          {/* Excerpt */}
          {showExcerpt && !compact && question.content && (
            <p className="mt-2 text-sm text-gray-800 line-clamp-2 leading-relaxed">
              {getExcerpt(question.content)}
            </p>
          )}

          {/* Tags */}
          <div className={`flex flex-wrap gap-2 ${compact ? 'mt-2' : 'mt-3'}`}>
            {question.tags.slice(0, compact ? 2 : 5).map((tag) => (
              <Link
                key={tag._id}
                href={`/tags/${tag.slug}`}
                className="inline-flex items-center px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded-md transition"
              >
                {tag.icon && <span className="mr-1">{tag.icon}</span>}
                {tag.name}
              </Link>
            ))}
            {question.tags.length > (compact ? 2 : 5) && (
              <span className="text-xs text-gray-500 self-center">
                +{question.tags.length - (compact ? 2 : 5)} more
              </span>
            )}
          </div>

          {/* Meta Info */}
          <div className={`
            flex flex-wrap items-center gap-3 text-sm text-gray-500
            ${compact ? 'mt-2' : 'mt-4'}
          `}>
            {/* Author */}
            {question.author ? (
              <Link
                href={`/users/${question.author._id}`}
                className="flex items-center space-x-1 hover:text-blue-600 transition"
              >
                {question.author.avatar ? (
                  <img
                    src={question.author.avatar}
                    alt={question.author.username}
                    className="w-5 h-5 rounded-full"
                  />
                ) : (
                  <div className="w-5 h-5 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {question.author.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <span className="font-medium">{question.author.username}</span>
                <span className="text-gray-400">({question.author.reputation})</span>
              </Link>
            ) : (
              <span className="text-gray-400 italic">Unknown user</span>
            )}

            {/* Separator */}
            <span className="text-gray-300">•</span>

            {/* Date */}
            <span>{formatDate(question.createdAt)}</span>

            {/* Separator */}
            <span className="text-gray-300">•</span>

            {/* Stats */}
            <div className="flex items-center gap-3">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                {question.views}
              </span>

              <span className={`
                flex items-center font-medium
                ${question.answerCount > 0 ? 'text-green-600' : 'text-gray-500'}
              `}>
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                {question.answerCount} {question.answerCount === 1 ? 'answer' : 'answers'}
              </span>
            </div>

            {/* Status Badge */}
            {question.status !== 'open' && (
              <>
                <span className="text-gray-300">•</span>
                {getStatusBadge()}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
