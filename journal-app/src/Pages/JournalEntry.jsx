import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from '../../firebase';
import EmotionDisplay from '../Components/EmotionDisplay';
import ActivityRecommendations from '../Components/ActivityRecommendations';
import WritingPrompts from '../Components/WritingPrompts';
import './Journal.css';

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
const JournalEntry = () => {
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showPrompts, setShowPrompts] = useState(true);
  const [previousEntries, setPreviousEntries] = useState([]);

  const fetchPreviousEntries = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'journal_entries'));
      const entriesData = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds);
      setPreviousEntries(entriesData);
    } catch (error) {
      console.error("Error fetching previous entries:", error);
    }
  };

  useEffect(() => {
    fetchPreviousEntries();
  }, []);

  const analyzeEmotion = async () => {
    if (!text.trim()) return;
    setIsAnalyzing(true);
    try {
      const response = await fetch('https://journal-backend-azure.vercel.app/analyze_emotion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, userId: auth.currentUser?.uid || 'anonymous' }),
      });
      const result = await response.json();
      setAnalysisResult(result);
      setShowPrompts(false);

      await addDoc(collection(db, "journal_entries"), {
        text,
        userId: auth.currentUser?.uid || 'anonymous',
        emotions: result.emotions,
        topEmotion: result.top_emotion,
        timestamp: serverTimestamp()
      });

      fetchPreviousEntries();
    } catch (error) {
      console.error("Error analyzing emotion:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNewEntry = () => {
    setText('');
    setAnalysisResult(null);
    setShowPrompts(true);
  };

  return (
    <div className="journal-container">
      <h2 className="journal-title">New Journal Entry</h2>
      <textarea
        className="journal-textarea"
        placeholder="Write your thoughts..."
        value={text}
        onChange={e => setText(e.target.value)}
        disabled={isAnalyzing}
      />
      <div className="button-group">
        <button
          className="journal-button"
          onClick={analyzeEmotion}
          disabled={isAnalyzing || !text.trim()} 
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze Emotion'}
        </button>
        {analysisResult && (
          <button
            className="journal-button secondary-button"
            onClick={handleNewEntry}
          >
            New Entry
          </button>
        )}
      </div>

      {showPrompts && (
        <div className="prompts-container">
          <WritingPrompts onSelectPrompt={prompt => setText(prompt)} />
        </div>
      )}

      {analysisResult && (
        <>
          <EmotionDisplay emotions={analysisResult.emotions} />
          <ActivityRecommendations
            activities={analysisResult.activities}
            // emotion={analysisResult.top_emotion}
          />
        </>
      )}

      <div className="previous-entries">
        <h3>Previous Entries</h3>
        {previousEntries.length === 0 ? (
          <p>No previous entries found.</p>
        ) : (
          previousEntries.map(entry => (
            <div key={entry.id} className="entry-card">
              <p className="entry-text">{entry.text}</p>
              <small>
                {entry.timestamp?.toDate
                  ? entry.timestamp.toDate().toLocaleString()
                  : 'Date unavailable'}
              </small>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default JournalEntry;

