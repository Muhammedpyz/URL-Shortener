const API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:3000/api'
    : '/api';

// State
let currentUser = null;
let currentShortCode = null;

// DOM Elements
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userMenu = document.getElementById('userMenu');
const navLinks = document.getElementById('navLinks');
const userEmailSpan = document.getElementById('userEmail');

const authModal = document.getElementById('authModal');
const statsModal = document.getElementById('statsModal');
const myUrlsModal = document.getElementById('myUrlsModal');
const closeModals = document.querySelectorAll('.close-modal');

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const switchToRegister = document.getElementById('switchToRegister');
const switchToLogin = document.getElementById('showLogin'); // Fixed ID

// ... (existing code)

// Register Form Submit
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('regEmail').value;
        const username = document.getElementById('regUsername').value;
        const password = document.getElementById('regPassword').value;

        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, username, password }),
            });

            const data = await res.json();
            if (res.ok) {
                // Show verification modal
                authModal.classList.add('hidden');
                document.getElementById('verificationModal').classList.remove('hidden');
                localStorage.setItem('pendingEmail', email);
            } else {
                showToast('Kayıt başarısız: ' + (data.error || 'Bilinmeyen hata'), 'error');
            }
        } catch (error) {
            console.error(error);
            showToast('Bir hata oluştu', 'error');
        }
    });
}

// Verify Email
document.getElementById('verificationForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const code = document.getElementById('verifyCode').value;
    const email = localStorage.getItem('pendingEmail');

    try {
        const res = await fetch(`${API_URL}/auth/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code }),
        });

        const data = await res.json();
        if (res.ok) {
            showToast('Hesabınız doğrulandı! Şimdi giriş yapabilirsiniz.', 'success');
            document.getElementById('verificationModal').classList.add('hidden');
            authModal.classList.remove('hidden');
            // Switch to login tab
            if (switchToLogin) switchToLogin.click();
        } else {
            showToast(data.error || 'Doğrulama başarısız', 'error');
        }
    } catch (error) {
        console.error(error);
        alert('Bir hata oluştu');
    }
});

// Profile & Delete Account Logic
const profileModal = document.getElementById('profileModal');

if (document.getElementById('initiateDeleteBtn')) {
    document.getElementById('initiateDeleteBtn').addEventListener('click', () => {
        document.getElementById('deleteStep1').classList.remove('hidden');
        document.getElementById('initiateDeleteBtn').classList.add('hidden');
    });
}

if (document.getElementById('confirmDeletePassword')) {
    document.getElementById('confirmDeletePassword').addEventListener('click', async () => {
        const password = document.getElementById('deletePassword').value;
        const token = localStorage.getItem('token');

        try {
            const res = await fetch(`${API_URL}/auth/delete-account/initiate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ password }),
            });

            if (res.ok) {
                document.getElementById('deleteStep1').classList.add('hidden');
                document.getElementById('deleteStep2').classList.remove('hidden');
                showToast('E-postanıza bir silme kodu gönderildi.', 'info');
            } else {
                const data = await res.json();
                showToast(data.error || 'Şifre yanlış', 'error');
            }
        } catch (error) {
            console.error(error);
        }
    });
}

if (document.getElementById('finalDeleteBtn')) {
    document.getElementById('finalDeleteBtn').addEventListener('click', async () => {
        const code = document.getElementById('deleteCode').value;
        const token = localStorage.getItem('token');

        try {
            const res = await fetch(`${API_URL}/auth/delete-account/confirm`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ code }),
            });

            if (res.ok) {
                showToast('Hesabınız başarıyla silindi.', 'success');
                logout();
                profileModal.classList.add('hidden');
            } else {
                const data = await res.json();
                showToast(data.error || 'Kod hatalı', 'error');
            }
        } catch (error) {
            console.error(error);
        }
    });
}

// Login Submit
document.getElementById('submitLogin').addEventListener('click', () => {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    login(email, password);
});

const urlInput = document.getElementById('urlInput');
const shortenBtn = document.getElementById('shortenBtn');
const resultBox = document.getElementById('result');
const shortLink = document.getElementById('shortLink');
const copyBtn = document.getElementById('copyBtn');
const guestWarning = document.getElementById('guestWarning');
const statsBtn = document.getElementById('statsBtn');
const myUrlsBtn = document.getElementById('myUrlsBtn');
const triggerLogin = document.getElementById('triggerLogin');

// Auth Functions
function checkAuth() {
    const token = localStorage.getItem('token');
    if (token) {
        // In a real app, we would verify the token with an API call
        // For now, let's assume it's valid and decode payload if needed, or just show logged in state
        const username = localStorage.getItem('userUsername');
        const email = localStorage.getItem('userEmail');
        currentUser = { username, email, token };
        updateUI();
        getMyUrls();
    }
}

function updateUI() {
    if (currentUser) {
        navLinks.classList.add('hidden');
        userMenu.classList.remove('hidden');
        document.getElementById('userUsername').textContent = currentUser.username || 'Kullanıcı';
        if (currentShortCode) {
            guestWarning.classList.add('hidden');
            statsBtn.classList.remove('hidden');
        }
    } else {
        navLinks.classList.remove('hidden');
        userMenu.classList.add('hidden');
        if (currentShortCode) {
            guestWarning.classList.remove('hidden');
            statsBtn.classList.add('hidden');
        }
    }
}

async function login(email, password) {
    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (res.ok) {
            localStorage.setItem('token', data.token);
            // Temporary fix: decode token if possible or just use email until backend update
            // Actually, let's update backend AuthController.login to return user object.

            // For now in frontend:
            localStorage.setItem('userUsername', data.user?.username || email);
            localStorage.setItem('userEmail', data.user?.email || email);
            currentUser = { username: data.user?.username || email, email: data.user?.email || email, token: data.token };
            updateUI();
            getMyUrls(); // Fetch URLs immediately
            closeAllModals();
        } else {
            showToast(data.error || 'Giriş başarısız', 'error');
        }
    } catch (err) {
        console.error(err);
        alert('Bir hata oluştu');
    }
}

async function register(email, password) {
    try {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (res.ok) {
            showToast('Kayıt başarılı! Lütfen giriş yapın.', 'success');
            toggleAuthForms();
        } else {
            showToast(data.error || 'Kayıt başarısız', 'error');
        }
    } catch (err) {
        console.error(err);
        alert('Bir hata oluştu');
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    currentUser = null;
    // document.getElementById('myUrlsList').innerHTML = ''; // User requested to keep this
    updateUI();
}

// Shortener Functions
async function shortenUrl() {
    const originalUrl = urlInput.value;
    if (!originalUrl) return;

    const headers = { 'Content-Type': 'application/json' };
    if (currentUser) {
        headers['Authorization'] = `Bearer ${currentUser.token}`;
    }

    try {
        const res = await fetch(`${API_URL}/url/shorten`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ originalUrl })
        });
        const data = await res.json();

        if (res.ok) {
            showResult(data);
            if (currentUser) {
                getMyUrls(); // Refresh the list immediately
            }
        } else {
            showToast(data.error || 'Kısaltma başarısız', 'error');
        }
    } catch (err) {
        console.error(err);
        alert('Bir hata oluştu');
    }
}

function showResult(data) {
    currentShortCode = data.shortCode;
    shortLink.href = data.shortUrl;
    shortLink.textContent = data.shortUrl;
    resultBox.classList.remove('hidden');
    updateUI(); // To show/hide stats button based on auth
}

// Stats Functions
async function getStats() {
    if (!currentUser || !currentShortCode) return;

    try {
        const res = await fetch(`${API_URL}/stats/${currentShortCode}`, {
            headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });
        const data = await res.json();

        if (res.ok) {
            showStatsModal(data);
        } else {
            showToast(data.error || 'İstatistikler alınamadı', 'error');
        }
    } catch (err) {
        console.error(err);
        showToast('Bir hata oluştu', 'error');
    }
}

function showStatsModal(data) {
    document.getElementById('totalVisits').textContent = data.totalVisits;
    const tbody = document.getElementById('lastVisitsList');
    tbody.innerHTML = '';

    data.lastVisits.forEach(visit => {
        const tr = document.createElement('tr');
        const date = new Date(visit.createdAt).toLocaleString('tr-TR');
        const location = visit.city ? `${visit.city}, ${visit.country}` : (visit.country || 'Bilinmiyor');
        const device = `${visit.device || 'Masaüstü'} - ${visit.os || ''} / ${visit.browser || ''}`;

        tr.innerHTML = `
            <td>${date}</td>
            <td>${location}</td>
            <td>${device}</td>
            <td>${visit.ip || 'Gizli'}</td>
        `;
        tbody.appendChild(tr);
    });

    statsModal.classList.remove('hidden');
}

// My URLs Functions
async function getMyUrls() {
    if (!currentUser) return;

    try {
        const res = await fetch(`${API_URL}/user/my-urls`, {
            headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });
        const data = await res.json();

        if (res.ok) {
            renderMyUrls(data);
            myUrlsModal.classList.remove('hidden');
        } else {
            showToast(data.error || 'Linkler alınamadı', 'error');
        }
    } catch (err) {
        console.error(err);
        showToast('Bir hata oluştu', 'error');
    }
}

function renderMyUrls(urls) {
    const tbody = document.getElementById('myUrlsList');
    tbody.innerHTML = '';

    urls.forEach(url => {
        const tr = document.createElement('tr');
        const shortUrl = `${window.location.origin}/${url.shortCode}`; // Assuming client runs on same domain/port proxy or we construct it
        // Actually API returns shortCode. Let's construct full URL.
        // Since we are running separate client/server, let's assume server port 3000 for link
        const fullShortUrl = `http://localhost:3000/${url.shortCode}`;

        tr.innerHTML = `
            <td><a href="${fullShortUrl}" target="_blank">${url.shortCode}</a></td>
            <td><div style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${url.originalUrl}</div></td>
            <td>${url.visits}</td>
            <td>${new Date(url.createdAt).toLocaleDateString('tr-TR')}</td>
            <td>
                <button class="action-btn" onclick="viewStats('${url.shortCode}')">📊</button>
                <button class="action-btn" onclick="navigator.clipboard.writeText('${fullShortUrl}')">📋</button>
                <button class="action-btn delete-btn-small" onclick="deleteUrl('${url.shortCode}')">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.deleteUrl = async (shortCode) => {
    if (!confirm('Bu linki silmek istediğinize emin misiniz?')) return;

    try {
        const res = await fetch(`${API_URL}/url/${shortCode}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });

        if (res.ok) {
            showToast('Link silindi', 'success');
            getMyUrls(); // Refresh list
        } else {
            const data = await res.json();
            showToast(data.error || 'Silme başarısız', 'error');
        }
    } catch (error) {
        console.error(error);
        showToast('Bir hata oluştu', 'error');
    }
};

// Helper to view stats from list
window.viewStats = async (shortCode) => {
    currentShortCode = shortCode;
    await getStats();
    myUrlsModal.classList.add('hidden'); // Close list modal
};

// Event Listeners
loginBtn.addEventListener('click', () => {
    authModal.classList.remove('hidden');
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
});

registerBtn.addEventListener('click', () => {
    authModal.classList.remove('hidden');
    registerForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
});

closeModals.forEach(btn => {
    btn.onclick = () => closeAllModals(); // Use onclick to ensure event binding
});
window.addEventListener('click', (e) => {
    if (e.target === authModal || e.target === statsModal || e.target === myUrlsModal || e.target === profileModal || e.target === document.getElementById('verificationModal')) {
        closeAllModals();
    }
});

function closeAllModals() {
    authModal.classList.add('hidden');
    statsModal.classList.add('hidden');
    myUrlsModal.classList.add('hidden');
    profileModal.classList.add('hidden');
    document.getElementById('verificationModal').classList.add('hidden');
}

function toggleAuthForms() {
    loginForm.classList.toggle('hidden');
    registerForm.classList.toggle('hidden');
}

switchToRegister.addEventListener('click', (e) => {
    e.preventDefault();
    toggleAuthForms();
});

switchToLogin.addEventListener('click', (e) => {
    e.preventDefault();
    toggleAuthForms();
});

document.getElementById('submitLogin').addEventListener('click', () => {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    login(email, password);
});



logoutBtn.addEventListener('click', logout);

shortenBtn.addEventListener('click', shortenUrl);

copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(shortLink.href);
    copyBtn.textContent = '✅';
    setTimeout(() => copyBtn.textContent = '📋', 2000);
});

triggerLogin.addEventListener('click', (e) => {
    e.preventDefault();
    loginBtn.click();
});

statsBtn.addEventListener('click', getStats);
if (myUrlsBtn) myUrlsBtn.addEventListener('click', getMyUrls);

const settingsBtn = document.getElementById('settingsBtn');
if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
        document.getElementById('profileModal').classList.remove('hidden');
        // Populate user info
        if (currentUser) {
            document.getElementById('settingsUsername').textContent = currentUser.username || '-';
            // We need to store email too if we want to show it, or decode token
            // For now let's rely on what we have. If email is missing, we might need to fetch it or store it on login.
            // Let's update login to store email as well.
            const email = localStorage.getItem('userEmail');
            document.getElementById('settingsEmail').textContent = email || '-';
        }
    });
}

// Toast Notification System
function showToast(message, type = 'info') {
    // Handle object messages
    if (typeof message === 'object') {
        message = message.error || message.message || JSON.stringify(message);
    }

    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';

    toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;

    container.appendChild(toast);

    // Auto remove
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-in forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Override default alert
window.alert = (msg) => showToast(msg, 'info');

// Init
checkAuth();
