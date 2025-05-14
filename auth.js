// User data storage (replace with backend storage in production)
let users = JSON.parse(localStorage.getItem('users')) || [];

// Check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('currentUser') !== null;
}

// Register form handling
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const fullName = document.getElementById('fullName').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Basic validation
        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        // Check if user already exists
        if (users.find(u => u.email === email)) {
            alert('Email already registered!');
            return;
        }

        // Create new user
        const newUser = {
            id: Date.now(),
            fullName,
            email,
            password, // In production, use proper password hashing
            stores: []
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(newUser));

        // Redirect to store creation
        window.location.href = 'shopzap.html#create-store';
    });
}

// Login form handling
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Find user
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            window.location.href = 'shopzap.html#create-store';
        } else {
            alert('Invalid email or password!');
        }
    });
}

// Handle store creation authentication
function handleStoreCreation() {
    const storeForm = document.getElementById('storeCreationForm');
    if (!storeForm) return;

    storeForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!isLoggedIn()) {
            const isNewUser = confirm('Do you want to create a new account?');
            window.location.href = isNewUser ? 'register.html' : 'login.html';
            return;
        }

        // Proceed with store creation
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const storeName = document.getElementById('storeName').value;
        const whatsappNumber = document.getElementById('whatsappNumber').value;

        // Create store object
        const newStore = {
            id: Date.now(),
            name: storeName,
            whatsappNumber: whatsappNumber,
            createdAt: new Date().toISOString()
        };

        // Update user's stores
        currentUser.stores.push(newStore);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        // Update users array
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex] = currentUser;
            localStorage.setItem('users', JSON.stringify(users));
        }

        // Redirect to dashboard or success page
        window.location.href = 'dashboard.html';
    });
}

// Function to check authentication before redirecting
function checkAuthAndRedirect(event, targetSection) {
    event.preventDefault();
    if (!isLoggedIn()) {
        const isNewUser = confirm('Do you want to create a new account?');
        window.location.href = isNewUser ? 'register.html' : 'login.html';
        return;
    }
    window.location.hash = targetSection;
}

// Initialize store creation handling
handleStoreCreation();