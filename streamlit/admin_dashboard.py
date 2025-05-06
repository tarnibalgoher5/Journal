import streamlit as st
import firebase_admin
from firebase_admin import credentials, firestore
import pandas as pd
import plotly.express as px
from datetime import datetime, timedelta

# Initialize Firebase (only once) 
if not firebase_admin._apps:
    cred = credentials.Certificate("/serviceAccountKey.json")  # 🔄 Update with correct path
    firebase_admin.initialize_app(cred)
db = firestore.client()

st.title("Emotion Journal Analytics Dashboard")

# Sidebar filter
st.sidebar.header("Filters")
date_range = st.sidebar.selectbox(
    "Date Range",
    ["Last 7 days", "Last 30 days", "Last 90 days", "All time"]
)

# Date filtering
now = datetime.now()
if date_range == "Last 7 days":
    start_date = now - timedelta(days=7)
elif date_range == "Last 30 days":
    start_date = now - timedelta(days=30)
elif date_range == "Last 90 days":
    start_date = now - timedelta(days=90)
else:
    start_date = datetime(2000, 1, 1)  # all time

# Fetch data from correct collection
entries = db.collection("entries").get()
entries_data = []

for entry in entries:
    data = entry.to_dict()
    timestamp = data.get("timestamp")
    if timestamp and hasattr(timestamp, "to_pydatetime"):
        timestamp = timestamp.to_pydatetime()
        if timestamp >= start_date:
            data["timestamp"] = timestamp
            entries_data.append(data)

# Proceed if we have entries
if not entries_data:
    st.warning("No data available for the selected date range.")
else:
    df = pd.DataFrame(entries_data)

    # Emotion distribution
    st.header("Emotion Distribution")
    if 'top_emotion' in df.columns:
        emotion_counts = df['top_emotion'].value_counts().reset_index()
        emotion_counts.columns = ['Emotion', 'Count']

        fig = px.pie(emotion_counts, values='Count', names='Emotion',
                     title='Distribution of Primary Emotions',
                     color_discrete_sequence=px.colors.qualitative.Bold)
        st.plotly_chart(fig)
    else:
        st.info("No emotion data available.")

    # Mood score trend
    st.header("Mood Score Over Time")
    if 'timestamp' in df.columns and 'mood_score' in df.columns:
        df['date'] = pd.to_datetime(df['timestamp']).dt.date
        mood_trend = df.groupby('date')['mood_score'].mean().reset_index()

        fig = px.line(mood_trend, x='date', y='mood_score',
                      title='Average Mood Score Over Time',
                      markers=True)
        st.plotly_chart(fig)
    else:
        st.info("Mood score data not available.")

    # Emotion trend over time
    st.header("Emotion Trends")
    if 'timestamp' in df.columns and 'top_emotion' in df.columns:
        df['date'] = pd.to_datetime(df['timestamp']).dt.date
        emotion_by_date = df.groupby(['date', 'top_emotion']).size().reset_index(name='count')

        fig = px.line(emotion_by_date, x='date', y='count', color='top_emotion',
                      title='Emotion Trends Over Time')
        st.plotly_chart(fig)
    else:
        st.info("Not enough data for emotion trends.")

    # Recent entries
    st.header("Recent Journal Entries")
    if 'timestamp' in df.columns:
        recent_df = df.sort_values('timestamp', ascending=False).head(10)
        for _, row in recent_df.iterrows():
            with st.expander(f"Entry from {row['timestamp'].strftime('%Y-%m-%d %H:%M')}"):
                st.write(row.get("text", ""))
                st.write(f"Primary emotion: **{row.get('top_emotion', 'N/A')}**")
                st.write(f"Mood score: **{row.get('mood_score', 'N/A')}**")
    else:
        st.info("No recent entries to display.")
