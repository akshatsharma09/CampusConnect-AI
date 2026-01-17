const LoadingSkeleton = ({ count = 3 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white/95 overflow-hidden shadow-lg rounded-lg backdrop-blur-sm border border-white/20 animate-pulse">
          <div className="p-6">
            {/* Header skeleton */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-16"></div>
            </div>

            {/* Description skeleton */}
            <div className="space-y-2 mb-3">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>

            {/* Eligibility & Deadline skeleton */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="h-3 bg-gray-200 rounded w-20"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </div>

            {/* Ranking reason skeleton */}
            <div className="mb-4 bg-indigo-50 border-l-4 border-indigo-600 rounded px-3 py-3">
              <div className="h-4 bg-indigo-200 rounded w-32 mb-2"></div>
              <div className="h-4 bg-indigo-200 rounded w-full"></div>
            </div>

            {/* Action button skeleton */}
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      ))}
    </>
  );
};

export default LoadingSkeleton;
