
const ActivityRecommendations = ({ activities, emotion }) => {
  return (
    <div className="activity-list">
      <div style={{ fontWeight: 500, marginBottom: '0.5rem' }}>
        Based on your <span style={{ color: '#7e57c2' }}>{emotion}</span> emotion, you might try:
      </div>
      <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
        {activities && activities.length > 0 ? (
          activities.map((activity, idx) => (
            <li key={idx} style={{ marginBottom: '0.2rem' }}>{activity}</li>
          ))
        ) : (
          <li>No recommendations available.</li>
        )}
      </ul>
    </div>
  );
};

export default ActivityRecommendations;
