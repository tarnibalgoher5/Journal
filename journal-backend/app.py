from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from transformers import pipeline
from pydantic import BaseModel
import uvicorn
import random
import firebase_admin
from firebase_admin import credentials, firestore

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Set specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load transformer model
classifier = pipeline("text-classification", model='bhadresh-savani/distilbert-base-uncased-emotion', return_all_scores=True)

# Initialize Firebase
cred = credentials.Certificate("backend/serviceAccountKey.json")  # Update path if different
firebase_admin.initialize_app(cred)
db = firestore.client()

class JournalEntry(BaseModel):
    text: str
    userId: str

# Prompts and activities
prompts = {
    "joy": ["What made you happy today and why?", "Describe a moment that brought you joy recently."],
    "sadness": ["Write about something you're finding difficult right now.", "What would help you feel better today?"],
    "anger": ["What triggered your frustration today?", "How could you respond differently next time?"],
    "fear": ["What's causing you anxiety right now?", "Write about a time you overcame a similar challenge."],
    "love": ["Who are you grateful for today and why?", "Describe a meaningful connection in your life."],
    "surprise": ["What unexpected event impacted you recently?", "How did this surprise change your perspective?"]
}

activities = {
    "joy": ["Share your happiness with a friend", "Try a new hobby that excites you"],
    "sadness": ["Take a gentle walk in nature", "Practice self-compassion meditation"],
    "anger": ["Try box breathing (4-4-4-4 count)", "Write a letter expressing your feelings (without sending it)"],
    "fear": ["Progressive muscle relaxation", "Make a list of what you can control"],
    "love": ["Reach out to someone you care about", "Practice acts of kindness"],
    "surprise": ["Journal about what you learned from this experience", "Explore the new perspective this gives you"]
}

@app.post("/analyze_emotion")
async def analyze_emotion(entry: JournalEntry):
    result = classifier(entry.text)
    emotions = result[0]
    emotions.sort(key=lambda x: x['score'], reverse=True)
    top_emotion = emotions[0]['label']
    recommended_activities = activities.get(top_emotion, ["Take a deep breath", "Practice mindfulness"])
    writing_prompts = prompts.get(top_emotion, ["How are you feeling right now?"])

    return {
        "emotions": emotions,
        "top_emotion": top_emotion,
        "activities": random.sample(recommended_activities, min(2, len(recommended_activities))),
        "prompts": random.sample(writing_prompts, min(1, len(writing_prompts)))
    }

# Save journal entry to Firebase
@app.post("/save_journal_entry")
async def save_journal_entry(entry: JournalEntry):
    db.collection("entries").add(entry.dict())
    return {"message": "Saved entry to Firebase"}

# Run the app
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)





# from fastapi import FastAPI, Request
# from fastapi.middleware.cors import CORSMiddleware
# from transformers import pipeline
# import uvicorn
# from pydantic import BaseModel
# import random
# from datetime import datetime

# # Firebase
# import firebase_admin
# from firebase_admin import credentials, firestore

# # Initialize Firebase Admin
# cred = credentials.Certificate("path/to/your/serviceAccountKey.json")  # 👈 Update path
# firebase_admin.initialize_app(cred)
# db = firestore.client()

# app = FastAPI()

# # Enable CORS for frontend communication
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],  # Adjust in prod
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Load emotion classifier
# classifier = pipeline("text-classification", model='bhadresh-savani/distilbert-base-uncased-emotion', return_all_scores=True)

# # Model for POST body
# class JournalEntry(BaseModel):
#     text: str
#     userId: str

# # Emotion-based prompts and activities
# prompts = {
#     "joy": ["What made you happy today and why?", "Describe a moment that brought you joy recently."],
#     "sadness": ["Write about something you're finding difficult right now.", "What would help you feel better today?"],
#     "anger": ["What triggered your frustration today?", "How could you respond differently next time?"],
#     "fear": ["What's causing you anxiety right now?", "Write about a time you overcame a similar challenge."],
#     "love": ["Who are you grateful for today and why?", "Describe a meaningful connection in your life."],
#     "surprise": ["What unexpected event impacted you recently?", "How did this surprise change your perspective?"]
# }
# activities = {
#     "joy": ["Share your happiness with a friend", "Try a new hobby that excites you"],
#     "sadness": ["Take a gentle walk in nature", "Practice self-compassion meditation"],
#     "anger": ["Try box breathing (4-4-4-4 count)", "Write a letter expressing your feelings (without sending it)"],
#     "fear": ["Progressive muscle relaxation", "Make a list of what you can control"],
#     "love": ["Reach out to someone you care about", "Practice acts of kindness"],
#     "surprise": ["Journal about what you learned from this experience", "Explore the new perspective this gives you"]
# }

# @app.post("/analyze_emotion")
# async def analyze_emotion(entry: JournalEntry):
#     # 1. Analyze emotion
#     result = classifier(entry.text)
#     emotions = result[0]
#     emotions.sort(key=lambda x: x['score'], reverse=True)
#     top_emotion = emotions[0]['label']

#     # 2. Recommendations
#     recommended_activities = activities.get(top_emotion, ["Take a deep breath", "Practice mindfulness"])
#     writing_prompts = prompts.get(top_emotion, ["How are you feeling right now?"])

#     # 3. Save to Firestore
#     db.collection("journal_entries").add({
#         "text": entry.text,
#         "userId": entry.userId,
#         "timestamp": datetime.now().isoformat(),
#         "top_emotion": top_emotion,
#         "emotions": emotions,
#         "activities": recommended_activities,
#         "prompts": writing_prompts
#     })

#     return {
#         "emotions": emotions,
#         "top_emotion": top_emotion,
#         "activities": random.sample(recommended_activities, min(2, len(recommended_activities))),
#         "prompts": random.sample(writing_prompts, min(1, len(writing_prompts)))
#     }

# @app.get("/entries/{user_id}")
# def get_entries(user_id: str):
#     docs = db.collection("journal_entries").where("userId", "==", user_id).order_by("timestamp", direction=firestore.Query.DESCENDING).stream()
#     return [{"id": doc.id, **doc.to_dict()} for doc in docs]

# if __name__ == "__main__":
#     uvicorn.run(app, host="0.0.0.0", port=8000)
