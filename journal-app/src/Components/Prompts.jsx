import React, { useState, useEffect } from 'react';
import { collection, getDocs } from "firebase/firestore";
import { db } from '../firebase';
// import './Journal.css';


const WritingPrompts = ({ onSelectPrompt }) => {
  const [prompts, setPrompts] = useState([
    "How are you feeling today?",
    "What's on your mind right now?",
    "Describe something you're grateful for today."
  ]);

  useEffect(() => {
   
    const fetchPrompts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "writing_prompts"));
        const promptsData = querySnapshot.docs.map(doc => doc.data().text);
        if (promptsData.length > 0) {
          setPrompts(promptsData);
        }
      } catch (error) {
        console.error("Error fetching prompts:", error);
      }
    };
    fetchPrompts();
  }, []);

  return (
    <div>
      <div style={{ fontWeight: 500, marginBottom: '0.5rem' }}>Need inspiration?</div>
      <div>
        {prompts.map((prompt, idx) => (
          <button
            key={idx}
            className="prompt-item"
            onClick={() => onSelectPrompt(prompt)}
            type="button"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
};

export default WritingPrompts;
