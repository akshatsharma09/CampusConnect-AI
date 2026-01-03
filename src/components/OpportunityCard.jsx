const OpportunityCard = ({ opportunity, reason }) => {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-6">
        <h4 className="text-lg font-medium text-gray-900">{opportunity.title}</h4>
        <p className="text-sm text-gray-500 mt-1">{opportunity.type} - {opportunity.domain}</p>
        <p className="text-sm text-gray-600 mt-2">{opportunity.description}</p>
        <p className="text-xs text-gray-500 mt-2">Deadline: {opportunity.deadline}</p>
        <p className="text-sm text-blue-600 mt-2">Reason: {reason}</p>
        <a
          href={opportunity.link}
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