import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from '../firebase';
import EmotionDisplay from './EmotionDisplay';
import ActivityRecommendations from './ActivityRecommendations';
import WritingPrompts from './WritingPrompts';
import './Journal.css';
// import Navbar from '../Components/Navbar/Navbar';

const JournalEntry = () => {
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showPrompts, setShowPrompts] = useState(true);

  const analyzeEmotion = async () => {
    if (!text.trim()) return;
    setIsAnalyzing(true);
    try {
      const response = await fetch('http://localhost:8000/analyze_emotion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, userId: auth.currentUser?.uid || 'anonymous' }),
      });
      const result = await response.json();
      setAnalysisResult(result);
      setShowPrompts(false);
      // Save to Firebase
      await addDoc(collection(db, "journal_entries"), {
        text,
        userId: auth.currentUser?.uid || 'anonymous',
        emotions: result.emotions,
        topEmotion: result.top_emotion,
        timestamp: serverTimestamp()
      });
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
      {/* <Navbar /> */}
      <h2 className="journal-title">New Journal Entry</h2>
      <textarea
        className="journal-textarea"
        placeholder="Write your thoughts..."
        value={text}
        onChange={e => setText(e.target.value)}
        disabled={isAnalyzing}
      />
      <div>
        <button
          className="journal-button"
          onClick={analyzeEmotion}
          disabled={isAnalyzing || !text.trim()}
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze Emotion'}
        </button>
        {analysisResult && (
          <button className="journal-button" onClick={handleNewEntry} style={{ marginLeft: '1rem' }}>
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
            emotion={analysisResult.top_emotion}
          />
        </>
      )}
    </div>
  );
};

export default JournalEntry;
