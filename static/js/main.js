document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatMessages = document.getElementById('chat-messages');
    const pdfUpload = document.getElementById('pdf-upload');
    const fileInfo = document.getElementById('file-info');
    const loadingBar = document.getElementById('loading-bar');
    const barProgress = document.querySelector('.bar-progress');
    const statusText = document.getElementById('status-text');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const userDisplay = document.getElementById('user-display');

    // Firebase Config - Fill this with your project details from Firebase Console
    const firebaseConfig = {
        apiKey: "AIzaSyCUoP9XaVMSLOoxojY3ZzF2hn1cEYdqy88",
        authDomain: "datagpt-web.firebaseapp.com",
        projectId: "datagpt-web",
        storageBucket: "datagpt-web.firebasestorage.app",
        messagingSenderId: "550224476694",
        appId: "G-Q0L6HC2B6C"
    };

    // Initialize Firebase
    if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
        firebase.initializeApp(firebaseConfig);
    } else {
        console.warn("Firebase config not set. Authentication will be disabled.");
    }

    // Auth State Observer
    if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                loginBtn.style.display = 'none';
                logoutBtn.style.display = 'flex';
                userDisplay.textContent = `Logged in as ${user.email}`;
            } else {
                loginBtn.style.display = 'flex';
                logoutBtn.style.display = 'none';
                userDisplay.textContent = '';
            }
        });
    }

    // Login Handler
    loginBtn.addEventListener('click', () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider).catch(error => {
            console.error("Login failed:", error);
            alert("Login failed. Check console for details.");
        });
    });

    // Logout Handler
    logoutBtn.addEventListener('click', () => {
        firebase.auth().signOut();
    });

    let isUploading = false;

    // Handle PDF Upload
    pdfUpload.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        fileInfo.textContent = file.name;
        isUploading = true;

        loadingBar.style.display = 'block';
        barProgress.style.width = '30%';
        statusText.textContent = 'Uploading...';

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                barProgress.style.width = '100%';
                statusText.textContent = 'Ready';
                addMessage('AI', 'File processed successfully! You can now ask questions.');
            } else {
                statusText.textContent = 'Error';
                addMessage('AI', `Upload failed: ${data.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Upload error:', error);
            statusText.textContent = 'Error';
            addMessage('AI', 'An error occurred during upload. Please check the server logs.');
        } finally {
            isUploading = false;
            setTimeout(() => {
                if (statusText.textContent === 'Ready') {
                    loadingBar.style.display = 'none';
                }
            }, 2000);
        }
    });

    // Handle Chat Form
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = userInput.value.trim();
        if (!message || isUploading) return;

        addMessage('User', message);
        userInput.value = '';

        const aiMsgId = addTypingIndicator();

        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            });

            const data = await response.json();
            removeTypingIndicator(aiMsgId);

            if (response.ok) {
                addMessage('AI', data.response);
            } else {
                addMessage('AI', `Error: ${data.error}`);
            }
        } catch (error) {
            removeTypingIndicator(aiMsgId);
            addMessage('AI', 'Something went wrong. Please try again.');
        }
    });

    function addMessage(sender, text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender.toLowerCase()}-message`;

        const icon = sender === 'AI' ? 'robot' : 'user';

        messageDiv.innerHTML = `
            <div class="avatar"><i class="fas fa-${icon}"></i></div>
            <div class="content">${text}</div>
        `;

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function addTypingIndicator() {
        const id = 'typing-' + Date.now();
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message ai-message';
        typingDiv.id = id;

        typingDiv.innerHTML = `
            <div class="avatar"><i class="fas fa-robot"></i></div>
            <div class="content">
                <div class="typing-dots">
                    <span></span><span></span><span></span>
                </div>
            </div>
        `;

        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return id;
    }

    function removeTypingIndicator(id) {
        const indicator = document.getElementById(id);
        if (indicator) indicator.remove();
    }
});
