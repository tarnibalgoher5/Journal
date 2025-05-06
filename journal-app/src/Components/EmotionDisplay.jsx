const EmotionDisplay = ({ emotions }) => {
    // Get top 3 emotions
    const topEmotions = emotions.slice(0, 3);
  
    // Emotion color mapping
    const emotionColors = {
      joy: '#FFD700',
      sadness: '#4682B4',
      anger: '#FF6347',
      fear: '#800080',
      love: '#FF69B4',
      surprise: '#00CED1'
    };
  
    return (
      <div>
        <h3>Detected Emotions</h3>
        <div>
          {topEmotions.map((emotion, index) => (
            <div
              key={emotion.label || index}
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '8px'
              }}
            >
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  backgroundColor: emotionColors[emotion.label] || '#ccc',
                  marginRight: 8
                }}
              ></div>
              <div style={{ marginRight: 8, fontWeight: 'bold' }}>
                {emotion.label}
              </div>
              <div>
                {Math.round(emotion.score * 100)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  export default EmotionDisplay;
  