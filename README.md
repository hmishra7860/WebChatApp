# WebChatApp
# Real-Time Chat Application

This is a simple real-time chat application built with Flask, Flask-SocketIO, and vanilla JavaScript for frontend.

## Features

- User registration and login
- Real-time chatting via WebSocket (Socket.IO)
- User search and selection
- Persistent messages stored in SQLite
- Profile pictures support
- UI with message bubbles and timestamps

## Project Structure

chat-app/
│
├── backend/
│ ├── app.py # Flask backend with REST APIs and WebSocket events
│ ├── db.py # Database models and initialization
│ ├── requirement.txt # Python dependencies
│ └── assets/ # (Optional) backend static assets if serving images
│
├── frontend/
│ ├── index.html # Landing page
│ ├── login.html # Login/Register page
│ ├── chat.html # Chat interface page
│ ├── index.css # CSS for landing page
│ ├── login.css # CSS for login page
│ ├── chat.css # CSS for chat page
│ ├── login.js # Login/Register JavaScript logic
│ ├── chat.js # Chat page JavaScript with WebSocket client
│ └── assets/ # Contains default-avatar.png and other frontend assets


## Setup and Running Locally

### Backend setup

1. Navigate to `backend` folder:
cd backend

2. Create a Python virtual environment (optional but recommended):
python -m venv venv
source venv/bin/activate # On Windows: venv\Scripts\activate

3. Install dependencies:
pip install -r requirement.txt

4. Start the Flask backend server:
python app.py

Backend runs at `http://localhost:5000`.

### Frontend setup

1. Open the `frontend/index.html` in your browser.
2. Use the UI to register/login and start chatting.
3. The frontend communicates with backend via REST APIs and WebSocket at `localhost:5000`.

## Notes

- Make sure your backend server is running while using the frontend.
- Images are loaded relative to frontend files inside `frontend/assets`.
- The WebSocket connection uses Socket.IO protocol.

## Troubleshooting

- If messages don't appear in real-time, check backend console logs to ensure Socket.IO events are received.
- Check browser console for errors.
- Ensure backend and frontend are using matching URLs and ports (`localhost:5000` by default).


