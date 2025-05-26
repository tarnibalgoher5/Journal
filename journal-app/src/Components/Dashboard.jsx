import React, { useState, useEffect } from 'react';
import { collection, getDocs } from "firebase/firestore";
import { db } from '../../firebase';

const Dashboard = () => {
  const [entries, setEntries] = useState([]);

  const fetchEntries = async () => {
    const querySnapshot = await getDocs(collection(db, 'entries'));
    const entriesData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    setEntries(entriesData);
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  return (
    <div className="dashboard">
      <h2>Journal Analytics</h2>

      <div className="entries-list">
        <h3>Recent Entries</h3>
        {entries.length > 0 ? (
          entries.map(entry => (
            <div key={entry.id} className="entry-card">
              <p className="entry-text">{entry.text}</p>
            </div>
          ))
        ) : (
          <p>No entries available</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
