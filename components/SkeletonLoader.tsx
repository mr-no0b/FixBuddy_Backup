'use client';

interface SkeletonLoaderProps {
  type?: 'text' | 'title' | 'avatar' | 'card' | 'list' | 'profile' | 'question';
  count?: number;
  className?: string;
}

export default function SkeletonLoader({ type = 'text', count = 1, className = '' }: SkeletonLoaderProps) {
  const baseClass = 'animate-pulse bg-gray-200 rounded';

  const renderSkeleton = () => {
    switch (type) {
      case 'text':
        return <div className={`${baseClass} h-4 w-full ${className}`} />;

      case 'title':
        return <div className={`${baseClass} h-8 w-3/4 ${className}`} />;

      case 'avatar':
        return <div className={`${baseClass} w-10 h-10 rounded-full ${className}`} />;

      case 'card':
        return (
          <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-3/4" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
              </div>
              <div className="flex gap-2">
                <div className="h-6 bg-gray-200 rounded w-16" />
                <div className="h-6 bg-gray-200 rounded w-20" />
                <div className="h-6 bg-gray-200 rounded w-16" />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-1" />
                  <div className="h-3 bg-gray-200 rounded w-32" />
                </div>
              </div>
            </div>
          </div>
        );

      case 'list':
        return (
          <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="animate-pulse space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-2/3" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-4/5" />
                  <div className="flex gap-2 pt-2">
                    <div className="w-6 h-6 bg-gray-200 rounded-full" />
                    <div className="h-4 bg-gray-200 rounded w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'profile':
        return (
          <div className={`bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden ${className}`}>
            <div className="h-20 bg-gray-300" />
            <div className="px-6 pb-6">
              <div className="animate-pulse">
                <div className="w-24 h-24 bg-gray-200 rounded-full -mt-12 mb-4 border-4 border-white" />
                <div className="h-8 bg-gray-200 rounded w-48 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-64 mb-4" />
                <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="text-center">
                      <div className="h-8 bg-gray-200 rounded w-12 mx-auto mb-2" />
                      <div className="h-3 bg-gray-200 rounded w-16 mx-auto" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'question':
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="flex gap-4">
                {/* Vote section */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 bg-gray-200 rounded" />
                  <div className="w-8 h-6 bg-gray-200 rounded" />
                  <div className="w-10 h-10 bg-gray-200 rounded" />
                </div>

                {/* Content */}
                <div className="flex-1 space-y-4">
                  <div className="h-8 bg-gray-200 rounded w-3/4" />
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded" />
                    <div className="h-4 bg-gray-200 rounded w-11/12" />
                    <div className="h-4 bg-gray-200 rounded w-4/5" />
                  </div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-gray-200 rounded w-20" />
                    <div className="h-6 bg-gray-200 rounded w-24" />
                    <div className="h-6 bg-gray-200 rounded w-16" />
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <div className="w-10 h-10 bg-gray-200 rounded-full" />
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-24 mb-1" />
                      <div className="h-3 bg-gray-200 rounded w-32" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <div className={`${baseClass} h-4 w-full ${className}`} />;
    }
  };

  if (type === 'list' || type === 'card' || type === 'profile' || type === 'question') {
    return <>{renderSkeleton()}</>;
  }

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="mb-2">
          {renderSkeleton()}
        </div>
      ))}
    </>
  );
}
