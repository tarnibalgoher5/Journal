// src/components/JournalEntry.js
import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from '../firebase';
import EmotionDisplay from './EmotionDisplay';
import ActivityRecommendations from './ActivityRecommendations';
import WritingPrompts from './WritingPrompts';

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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text, 
          userId: auth.currentUser?.uid || 'anonymous' 
        }),
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
    <div>
      <h2>My Journal</h2>
      
      {showPrompts && !analysisResult && (
        <WritingPrompts onSelectPrompt={(prompt) => setText(prompt)} />
      )}
      
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="How are you feeling today?"
        rows={10}
        className="journal-textarea"
      />

      <button 
        onClick={analyzeEmotion} 
        disabled={isAnalyzing || !text.trim()}
        className="analyze-button"
      >
        {isAnalyzing ? 'Analyzing...' : 'Save Entry'}
      </button>
      
      {analysisResult && (
        <div>
          <EmotionDisplay emotions={analysisResult.emotions} />
          <ActivityRecommendations 
            activities={analysisResult.activities} 
            emotion={analysisResult.top_emotion} 
          />
          <button onClick={handleNewEntry} className="new-entry-button">
            Write New Entry
          </button>
        </div>
      )}
    </div>
  );
};

export default JournalEntry;
