import React, { useState, useEffect } from 'react';
import { collection, getDocs } from "firebase/firestore";
import { db } from '../firebase';
import './App.css';

function App() {
  const [journalText, setJournalText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [entries, setEntries] = useState([]);
  const userId = 'user123';

  const fetchEntries = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'entries'));
      const entriesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      entriesData.sort((a, b) => {
        if (a.timestamp && b.timestamp) {
          return b.timestamp.seconds - a.timestamp.seconds;
        }
        return 0;
      });
      setEntries(entriesData);
    } catch (error) {
      console.error('Error fetching entries:', error);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleAnalyze = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('https://journal-backend-sigma.vercel.app/analyze_emotion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: journalText, userId })
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error analyzing emotion:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEntry = async () => {
    if (!journalText.trim()) {
      alert('Please write something before saving.');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch('http://localhost:8000/save_journal_entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: journalText, userId })
      });

      await response.json();
      alert('Journal entry saved successfully!');
      setJournalText('');
      setResult(null);
      fetchEntries();
    } catch (error) {
      console.error('Error saving entry:', error);
      alert('Failed to save entry.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="app-container">
      <h1>ManoVaani Journal</h1>

      <div className="journal-section">
        <textarea 
          value={journalText}
          onChange={(e) => setJournalText(e.target.value)}
          placeholder="Write about your thoughts and feelings..."
          rows={6}
          className="journal-input"
        />

        <div className="button-group">
          <button onClick={handleAnalyze} disabled={loading}>
            {loading ? 'Analyzing...' : 'Analyze Emotion'}
          </button>

          <button onClick={handleSaveEntry} disabled={saving}>
            {saving ? 'Saving...' : 'Save Entry'}
          </button>
        </div>

        {result && (
          <div className="result">
            <h2>Detected Emotion: {result.top_emotion}</h2>
            <h3>Suggested Writing Prompt</h3>
            <p>{result.prompts[0]}</p>
            <h3>Recommended Activities</h3>
            <ul>
              {result.activities.map((activity, index) => (
                <li key={index}>{activity}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="recent-entries">
        <h3>Recent Entries</h3>
        {entries.length === 0 && <p>No entries yet.</p>}
        {entries.map(entry => (
          <div key={entry.id} className="entry-card">
            <p className="entry-text">{entry.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
