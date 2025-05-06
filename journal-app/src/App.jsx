import { useState } from 'react';
import './App.css';

function App() {
  const [journalText, setJournalText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const userId = 'user123'; // Can be dynamically set later

  const handleAnalyze = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('http://localhost:8000/analyze_emotion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: journalText,
          userId: userId
        })
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
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: journalText,
          userId: userId
        })
      });

      const data = await response.json();
      alert('Journal entry saved successfully!');
      console.log(data);
    } catch (error) {
      console.error('Error saving entry:', error);
      alert('Failed to save entry.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="app-container">
      <h1>Emotion Journal</h1>

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
  );
}

export default App;
