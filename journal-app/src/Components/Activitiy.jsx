const ActivityRecommendations = ({ activities, emotion }) => {
    return (
      <div>
        <h3>Recommended Activities</h3>
        <p>Based on your {emotion} emotion, you might try:</p>
        <ul>
          {activities.map((activity, index) => (
            <li key={index}>{activity}</li>
          ))}
        </ul>
      </div>
    );
  };
  
  export default ActivityRecommendations;
  