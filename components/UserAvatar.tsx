'use client';

import Link from 'next/link';

interface UserAvatarProps {
  user: {
    _id?: string;
    username: string;
    reputation: number;
    avatar?: string;
  } | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showReputation?: boolean;
  showBadge?: boolean;
  clickable?: boolean;
}

export default function UserAvatar({
  user,
  size = 'md',
  showReputation = false,
  showBadge = true,
  clickable = true
}: UserAvatarProps) {
  // Size configurations
  const sizeClasses = {
    xs: {
      avatar: 'w-6 h-6 text-xs',
      badge: 'w-3 h-3 text-[8px]',
      badgeOffset: '-right-0.5 -bottom-0.5',
      text: 'text-xs'
    },
    sm: {
      avatar: 'w-8 h-8 text-sm',
      badge: 'w-4 h-4 text-[10px]',
      badgeOffset: '-right-1 -bottom-1',
      text: 'text-sm'
    },
    md: {
      avatar: 'w-10 h-10 text-base',
      badge: 'w-5 h-5 text-xs',
      badgeOffset: '-right-1 -bottom-1',
      text: 'text-sm'
    },
    lg: {
      avatar: 'w-16 h-16 text-xl',
      badge: 'w-6 h-6 text-sm',
      badgeOffset: '-right-1.5 -bottom-1.5',
      text: 'text-base'
    },
    xl: {
      avatar: 'w-24 h-24 text-3xl',
      badge: 'w-8 h-8 text-base',
      badgeOffset: '-right-2 -bottom-2',
      text: 'text-lg'
    }
  };

  const classes = sizeClasses[size];

  // Get reputation badge
  const getReputationBadge = (reputation: number) => {
    if (reputation >= 1000) {
      return { emoji: '🏆', color: 'bg-yellow-500', title: 'Expert' };
    } else if (reputation >= 500) {
      return { emoji: '⭐', color: 'bg-blue-500', title: 'Advanced' };
    } else if (reputation >= 100) {
      return { emoji: '🔰', color: 'bg-green-500', title: 'Intermediate' };
    } else {
      return { emoji: '🌱', color: 'bg-gray-400', title: 'Beginner' };
    }
  };

  // If user is null (deleted)
  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <div className={`${classes.avatar} rounded-full bg-gray-300 flex items-center justify-center text-white font-bold`}>
          ?
        </div>
        {showReputation && (
          <div>
            <p className={`${classes.text} font-medium text-gray-500`}>[deleted]</p>
          </div>
        )}
      </div>
    );
  }

  const badge = getReputationBadge(user.reputation);
  const initial = user.username.charAt(0).toUpperCase();

  const avatarContent = (
    <div className="relative inline-block">
      {/* Avatar */}
      {user.avatar ? (
        <img
          src={user.avatar}
          alt={user.username}
          className={`${classes.avatar} rounded-full object-cover border-2 border-white shadow-sm`}
        />
      ) : (
        <div
          className={`${classes.avatar} rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold shadow-sm`}
        >
          {initial}
        </div>
      )}

      {/* Reputation Badge */}
      {showBadge && (
        <div
          className={`absolute ${classes.badgeOffset} ${classes.badge} ${badge.color} rounded-full flex items-center justify-center shadow-md border-2 border-white`}
          title={`${badge.title} - ${user.reputation} reputation`}
        >
          <span className="leading-none">{badge.emoji}</span>
        </div>
      )}
    </div>
  );

  const content = (
    <div className="flex items-center gap-2">
      {avatarContent}
      {showReputation && (
        <div>
          <p className={`${classes.text} font-medium text-gray-900 ${clickable ? 'hover:text-blue-600' : ''}`}>
            {user.username}
          </p>
          <p className={`text-xs text-gray-500`}>
            {user.reputation.toLocaleString()} reputation
          </p>
        </div>
      )}
    </div>
  );

  if (clickable && user._id) {
    return (
      <Link href={`/users/${user._id}`} className="inline-block">
        {content}
      </Link>
    );
  }

  return content;
}
