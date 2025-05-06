import React, { useState, useEffect } from 'react';
import { collection, getDocs } from "firebase/firestore";
import { db } from '../firebase';

const WritingPrompts = ({ onSelectPrompt }) => {
  const [prompts, setPrompts] = useState([
    "How are you feeling today?",
    "What's on your mind right now?",
    "Describe something you're grateful for today."
  ]);

  useEffect(() => {
    // Optionally fetch custom prompts from Firebase
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
      <h3>Writing Prompts</h3>
      <div>
        {prompts.map((prompt, index) => (
          <div
            key={index}
            style={{ cursor: 'pointer', marginBottom: '8px' }}
            onClick={() => onSelectPrompt && onSelectPrompt(prompt)}
          >
            {prompt}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WritingPrompts;
