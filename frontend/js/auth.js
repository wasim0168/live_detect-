// js/auth.js - Authentication utilities

// Check if user is authenticated
function isAuthenticated() {
    return localStorage.getItem('rt-detect-auth') === 'true';
}

// Get current user data
function getCurrentUser() {
    const userData = localStorage.getItem('rt-detect-user');
    return userData ? JSON.parse(userData) : null;
}

// Logout function
function logout() {
    localStorage.removeItem('rt-detect-auth');
    localStorage.removeItem('rt-detect-user');
    window.location.href = 'login.html';
}

// Protect routes - call this on every protected page
function protectRoute() {
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Update UI with user info
function updateUserUI() {
    const user = getCurrentUser();
    if (user) {
        // Update any user-related UI elements
        const userElements = document.querySelectorAll('.user-name, .user-email');
        userElements.forEach(element => {
            if (element.classList.contains('user-name')) {
                element.textContent = user.name;
            } else if (element.classList.contains('user-email')) {
                element.textContent = user.email;
            }
        });
    }
}

// Initialize demo users
function initializeDemoUsers() {
    const users = JSON.parse(localStorage.getItem('rt-detect-users') || '[]');
    
    if (users.length === 0) {
        // Add demo users
        const demoUsers = [
            {
                name: "Demo User",
                email: "demo@rtdetect.com",
                password: "password123",
                createdAt: new Date().toISOString()
            },
            {
                name: "Admin User",
                email: "admin@rtdetect.com",
                password: "admin123",
                createdAt: new Date().toISOString()
            }
        ];
        
        localStorage.setItem('rt-detect-users', JSON.stringify(demoUsers));
        console.log('Demo users initialized');
    }
}