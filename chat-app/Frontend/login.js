const formTitle = document.getElementById('form-title');
const authForm = document.getElementById('auth-form');
const toggleLink = document.getElementById('toggle-link');
const profilePicGroup = document.getElementById('profile-pic-group');
const profilePicInput = document.getElementById('profile-pic');
const profilePreview = document.getElementById('profile-preview');
const emailGroup = document.getElementById('email-group');
const emailInput = document.getElementById('email');
const submitBtn = document.getElementById('submit-btn');

let isLogin = true;

toggleLink.addEventListener('click', () => {
  isLogin = !isLogin;
  formTitle.textContent = isLogin ? 'Login' : 'Register';
  submitBtn.textContent = isLogin ? 'Login' : 'Register';
  profilePicGroup.style.display = isLogin ? 'none' : 'flex';
  emailGroup.style.display = isLogin ? 'none' : 'flex';
  toggleLink.textContent = isLogin ? 'Register' : 'Login';
});

profilePicInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  profilePreview.src = file ? URL.createObjectURL(file) : 'assets/default-avatar.png';
});

authForm.addEventListener('submit', async e => {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const email = emailInput.value.trim();
  let profile = 'assets/default-avatar.png';

  if (isLogin) {
    const res = await fetch('http://localhost:5000/login', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({username, password}),
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('currentUser', JSON.stringify(data));
      window.location.href = 'chat.html';
    } else alert(data.error);
  } else {
    const res = await fetch('http://localhost:5000/register', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({username, password, email, profile}),
    });
    const data = await res.json();
    if (res.ok) {
      alert('Registration successful! Please log in.');
      isLogin = true;
      toggleLink.click();
    } else alert(data.error);
  }
});
