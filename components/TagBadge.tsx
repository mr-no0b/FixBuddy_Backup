'use client';

import Link from 'next/link';

interface TagBadgeProps {
  tag: {
    _id?: string;
    name: string;
    slug: string;
    icon?: string;
    usageCount?: number;
  };
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning';
  showCount?: boolean;
  clickable?: boolean;
  onRemove?: () => void;
}

export default function TagBadge({
  tag,
  size = 'md',
  variant = 'default',
  showCount = false,
  clickable = true,
  onRemove
}: TagBadgeProps) {
  const sizeClasses = {
    xs: 'px-2 py-0.5 text-xs',
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const variantClasses = {
    default: 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200',
    primary: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
    secondary: 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200',
    success: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200'
  };

  const content = (
    <span
      className={`
        inline-flex items-center gap-1 
        ${sizeClasses[size]} 
        ${variantClasses[variant]}
        rounded-full font-medium border transition-colors
        ${onRemove ? 'pr-1' : ''}
      `}
    >
      {/* Icon */}
      {tag.icon && <span className="flex-shrink-0">{tag.icon}</span>}

      {/* Tag Name */}
      <span className="flex-shrink-0">{tag.name}</span>

      {/* Usage Count */}
      {showCount && tag.usageCount !== undefined && (
        <span className="flex-shrink-0 opacity-75">× {tag.usageCount}</span>
      )}

      {/* Remove Button */}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove();
          }}
          className="flex-shrink-0 ml-1 p-0.5 rounded-full hover:bg-black hover:bg-opacity-10 transition"
          aria-label="Remove tag"
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </span>
  );

  if (clickable && !onRemove) {
    return (
      <Link href={`/tags/${tag.slug}`} className="inline-block">
        {content}
      </Link>
    );
  }

  return content;
}
