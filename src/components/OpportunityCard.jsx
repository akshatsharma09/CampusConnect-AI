const OpportunityCard = ({ opportunity, reason }) => {
  // Format deadline if it's a Firestore Timestamp
  const formatDeadline = (deadline) => {
    if (deadline && typeof deadline === 'object' && deadline.seconds) {
      return new Date(deadline.seconds * 1000).toLocaleDateString();
    }
    return deadline || 'N/A';
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-6">
        <h4 className="text-lg font-medium text-gray-900">{opportunity.title || 'Untitled'}</h4>
        <p className="text-sm text-gray-500 mt-1">{opportunity.type || 'N/A'} - {opportunity.domain || 'N/A'}</p>
        <p className="text-sm text-gray-600 mt-2">{opportunity.description || 'No description available'}</p>
        <p className="text-xs text-gray-500 mt-2">Deadline: {formatDeadline(opportunity.deadline)}</p>
        <p className="text-sm text-blue-600 mt-2">Reason: {reason || 'N/A'}</p>
        <a
          href={opportunity.link || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
        >
          Learn More
        </a>
      </div>
    </div>
  );
};

export default OpportunityCard;