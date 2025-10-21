from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, join_room, leave_room, emit
from db import db, User, Message, init_db
from datetime import datetime

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///chatapp.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

init_db(app)

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    if User.query.filter_by(username=data['username']).first():
        return jsonify({"error": "Username already exists"}), 400
    if User.query.filter_by(email=data.get('email')).first():
        return jsonify({"error": "Email already exists"}), 400
    user = User(
        username=data['username'],
        email=data.get('email'),
        password=data['password'],  # Consider hashing passwords
        profile=data.get('profile', 'assets/default-avatar.png')
    )
    db.session.add(user)
    db.session.commit()
    return jsonify({"message": "User registered successfully", "id": user.id}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(username=data['username'], password=data['password']).first()
    if user:
        return jsonify({
            "message": "Login successful",
            "id": user.id,
            "username": user.username,
            "profile": user.profile
        })
    return jsonify({"error": "Invalid username or password"}), 401

@app.route('/users', methods=['GET'])
def get_users():
    users = User.query.all()
    users_list = [{
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "profile": user.profile
    } for user in users]
    return jsonify(users_list)

@app.route('/messages/<int:user1>/<int:user2>', methods=['GET'])
def get_messages(user1, user2):
    msgs = Message.query.filter(
        ((Message.sender_id == user1) & (Message.receiver_id == user2)) |
        ((Message.sender_id == user2) & (Message.receiver_id == user1))
    ).all()
    result = []
    for m in msgs:
        sender = db.session.get(User, m.sender_id)
        result.append({
            "text": m.text,
            "username": sender.username,
            "profile": sender.profile,
            "time": m.timestamp
        })
    return jsonify(result)

@app.route('/messages/<int:user1>/<int:user2>', methods=['DELETE'])
def delete_messages(user1, user2):
    Message.query.filter(
        ((Message.sender_id == user1) & (Message.receiver_id == user2)) |
        ((Message.sender_id == user2) & (Message.receiver_id == user1))
    ).delete()
    db.session.commit()
    return jsonify({"message": "Messages deleted successfully"})

# SocketIO events
@socketio.on('join')
def on_join(data):
    room = data['room']
    join_room(room)

@socketio.on('leave')
def on_leave(data):
    room = data['room']
    leave_room(room)

@socketio.on('send_message')
def handle_send_message(data):
    print(f"Received message event: {data}")  # Debug log
    msg = Message(
        sender_id=data['sender_id'],
        receiver_id=data['receiver_id'],
        text=data['text'],
        timestamp=datetime.now().strftime("%H:%M, %d-%m-%Y")
    )
    db.session.add(msg)
    db.session.commit()

    user = db.session.get(User, msg.sender_id)

    room = f"chat_{min(data['sender_id'], data['receiver_id'])}_{max(data['sender_id'], data['receiver_id'])}"
    emit('receive_message', {
        'text': msg.text,
        'username': user.username,
        'profile': user.profile,
        'time': msg.timestamp
    }, room=room)

if __name__ == "__main__":
    socketio.run(app, debug=True)
