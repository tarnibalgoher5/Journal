const EmotionDisplay = ({ emotions }) => {
  const topEmotions = emotions.slice(0, 3);
  const emotionColors = {
    joy: '#FFD700',
    sadness: '#4682B4',
    anger: '#FF6347',
    fear: '#800080',
    love: '#FF69B4',
    surprise: '#00CED1'
  };
  return (
    <div className="emotion-list">
      {topEmotions.map((emotion, idx) => (
        <span
          key={idx}
          className="emotion-badge"
          style={{ background: emotionColors[emotion.name] || '#7e57c2' }}
        >
          {emotion.name}: {Math.round(emotion.score * 100)}%
        </span>
      ))}
    </div>
  );
};

export default EmotionDisplay;
