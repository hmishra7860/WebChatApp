const socket = io("http://localhost:5000");
const userColors = {};


const userNameElem = document.getElementById('user-name');
const userAvatarElem = document.getElementById('user-avatar');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const messagesContainer = document.getElementById('messages');
const logoutBtn = document.getElementById('logout-btn');
const deleteChatBtn = document.getElementById('delete-chat-btn');
const allUsersList = document.getElementById('all-users');
const userSearch = document.getElementById('user-search');

let currentChatUser = null;
let currentChatUserId = null;
let previousChatUserId = null;


const currentUser = JSON.parse(localStorage.getItem('currentUser'));
if (!currentUser) window.location.href = 'login.html';

userNameElem.textContent = currentUser.username;
userAvatarElem.src = currentUser.profile || 'assets/default-avatar.png';

function getUserColor(username) {
  if (!userColors[username]) {
    const colors = ["#238636", "#2ea043", "#58a6ff", "#ff7b72", "#ffa657"];
    userColors[username] = colors[Math.floor(Math.random() * colors.length)];
  }
  return userColors[username];
}

function renderMessages(messages) {
  messagesContainer.innerHTML = '';
  messages.forEach(msg => {
    const div = document.createElement('div');
    div.classList.add('message');
    if (msg.username === currentUser.username) {
      div.classList.add('self');
    }
    const img = document.createElement('img');
    img.src = msg.profile || 'assets/default-avatar.png';
    img.alt = msg.username;

    const messageContent = document.createElement('div');

    const spanText = document.createElement('span');
    spanText.textContent = msg.text;
    spanText.style.backgroundColor = getUserColor(msg.username);
    spanText.style.padding = "8px 12px";
    spanText.style.borderRadius = "12px";
    spanText.style.display = "inline-block";
    spanText.title = msg.username;

    const spanTime = document.createElement('span');
    spanTime.classList.add('timestamp');
    spanTime.textContent = msg.time;

    messageContent.appendChild(spanText);
    messageContent.appendChild(spanTime);

    if (msg.username === currentUser.username) {
      div.appendChild(messageContent);
      div.appendChild(img);
    } else {
      div.appendChild(img);
      div.appendChild(messageContent);
    }
    messagesContainer.appendChild(div);
  });
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function joinChatRoom(user1, user2) {
  const room = `chat_${Math.min(user1, user2)}_${Math.max(user1, user2)}`;
  socket.emit('join', { room });
}

function leaveChatRoom(user1, user2) {
  const room = `chat_${Math.min(user1, user2)}_${Math.max(user1, user2)}`;
  socket.emit('leave', { room });
}

async function loadMessagesWith(userId, username) {
  if (previousChatUserId !== null) {
    leaveChatRoom(currentUser.id, previousChatUserId);
  }
  currentChatUser = username;
  currentChatUserId = userId;
  joinChatRoom(currentUser.id, currentChatUserId);
  previousChatUserId = currentChatUserId;

  // Highlight selected user in user list
  Array.from(allUsersList.children).forEach(li => {
    li.classList.toggle('active', li.querySelector('span').textContent === username);
  });

  try {
    const res = await fetch(`http://localhost:5000/messages/${currentUser.id}/${userId}`);
    if (!res.ok) throw new Error("Failed to load messages");
    const msgs = await res.json();
    renderMessages(msgs);
  } catch (err) {
    console.error("Failed to load messages:", err);
  }
}

messageForm.addEventListener('submit', e => {
  e.preventDefault();
  if (!currentChatUser) return alert("Select a user!");
  const text = messageInput.value.trim();
  if (!text) return;

  // Append the new message immediately
  const newMsg = {
    text,
    username: currentUser.username,
    profile: currentUser.profile || 'assets/default-avatar.png',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  // Get previous messages from DOM and add new message
  const prevMessages = [...document.querySelectorAll('.message')].map(m => ({
    text: m.querySelector('span').textContent,
    username: m.querySelector('span').title,
    profile: m.querySelector('img').src,
    time: m.querySelector('.timestamp').textContent
  }));
  renderMessages(prevMessages.concat(newMsg));

  socket.emit('send_message', {
    sender_id: currentUser.id,
    receiver_id: currentChatUserId,
    text
  });
  messageInput.value = '';
});

// Append incoming message when received from socket
socket.on('receive_message', message => {
  renderMessages([...document.querySelectorAll('.message')].map(m => ({
    text: m.querySelector('span').textContent,
    username: m.querySelector('span').title,
    profile: m.querySelector('img').src,
    time: m.querySelector('.timestamp').textContent
  })).concat(message));
});

// User search input event with backend fetch and list rendering
userSearch.addEventListener('input', async () => {
  const query = userSearch.value.trim().toLowerCase();
  try {
    const res = await fetch(`http://localhost:5000/users`);
    if (!res.ok) throw new Error("Failed to fetch users");
    const users = await res.json();

    allUsersList.innerHTML = '';
    users
      .filter(u => u.username !== currentUser.username && u.username.toLowerCase().includes(query))
      .forEach(u => {
        const li = document.createElement('li');
        const img = document.createElement('img');
        img.src = u.profile || 'assets/default-avatar.png';
        img.alt = u.username;
        const span = document.createElement('span');
        span.textContent = u.username;
        li.appendChild(img);
        li.appendChild(span);
        li.addEventListener('click', () => loadMessagesWith(u.id, u.username));
        allUsersList.appendChild(li);
      });
  } catch (err) {
    console.error("Failed to fetch users:", err);
  }
});

logoutBtn.addEventListener('click', e => {
  e.preventDefault(); // Prevent default if inside a form to avoid reload
  localStorage.removeItem('currentUser'); // Clear login state
  window.location.href = 'login.html';    // Redirect to login page
});

