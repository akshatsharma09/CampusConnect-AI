const OpportunityCard = ({ opportunity, reason, rankingDetails }) => {
  // Format deadline if it's a Firestore Timestamp
  const formatDeadline = (deadline) => {
    if (deadline && typeof deadline === 'object' && deadline.seconds) {
      return new Date(deadline.seconds * 1000).toLocaleDateString();
    }
    return deadline || 'N/A';
  };

  // Calculate days until deadline
  const getDaysUntilDeadline = () => {
    try {
      let deadline;
      if (opportunity.deadline && typeof opportunity.deadline === 'object' && opportunity.deadline.seconds) {
        deadline = new Date(opportunity.deadline.seconds * 1000);
      } else if (opportunity.deadline && typeof opportunity.deadline === 'string') {
        deadline = new Date(opportunity.deadline);
      }
      
      if (!deadline) return null;
      
      const today = new Date();
      const diff = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
      return diff > 0 ? diff : null;
    } catch (e) {
      return null;
    }
  };

  const daysUntil = getDaysUntilDeadline();
  const isUrgent = daysUntil && daysUntil <= 14 && daysUntil > 0;

  return (
    <div className="bg-white/95 overflow-hidden shadow-lg rounded-lg backdrop-blur-sm hover:shadow-xl transition-all border border-white/20 hover:border-indigo-300">
      <div className="p-6">
        {/* Header with type badge and badges */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="text-lg font-bold text-indigo-600">{opportunity.title || 'Untitled'}</h4>
            <p className="text-sm text-gray-600 mt-1 font-medium">{opportunity.type || 'N/A'} - {opportunity.domain || 'N/A'}</p>
          </div>
          <div className="flex flex-col gap-2">
            {opportunity.campusVerified && (
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                🏛️ Campus Verified
              </span>
            )}
            {isUrgent && (
              <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                ⏰ Urgent Deadline
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-700 mt-3">{opportunity.description || 'No description available'}</p>

        {/* Eligibility & Deadline Info */}
        <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-gray-600">
          <div>
            <span className="font-semibold">Eligible:</span> {opportunity.eligibleYear || 'All Years'}
          </div>
          <div className="text-right">
            <span className="font-semibold">Deadline:</span> {formatDeadline(opportunity.deadline)}
          </div>
        </div>



        {/* AI Match Score - Prominent Display */}
        {rankingDetails?.score !== undefined && (
          <div className="mt-4 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-lg px-4 py-3 text-center">
            <p className="text-lg font-bold">AI Match Score</p>
            <p className="text-2xl font-extrabold">{rankingDetails.score}/100</p>
          </div>
        )}

        {/* Ranking Reason - Main Feature */}
        {reason && (
          <div className="mt-4 bg-indigo-50 border-l-4 border-indigo-600 rounded px-3 py-3">
            <p className="text-sm font-semibold text-indigo-900">Why recommended:</p>
            <p className="text-sm text-indigo-800 mt-1">{reason}</p>
          </div>
        )}

        {/* Ranking Details (if available) */}
        {rankingDetails?.factors && rankingDetails.factors.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {rankingDetails.factors.map((factor, idx) => (
              <span
                key={idx}
                className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium"
              >
                {factor}
              </span>
            ))}
          </div>
        )}

        {/* Action Button */}
        <a
          href={opportunity.link || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block w-full text-center bg-gradient-to-r from-indigo-600 to-blue-600 hover:shadow-lg text-white px-4 py-2 rounded-lg text-sm font-medium transition-all hover:from-indigo-700 hover:to-blue-700"
        >
          Apply Now
        </a>
      </div>
    </div>
  );
};

export default OpportunityCard;
