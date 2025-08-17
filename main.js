// Main JavaScript for Online Voting System

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initApp();
});

function initApp() {
    // File input handling
    setupFileInputs();
    
    // Form validation
    setupFormValidation();
    
    // Panel navigation
    setupPanelNavigation();
}

// File Input Handling
function setupFileInputs() {
    const fileInput = document.getElementById('voterCard');
    const fileText = document.querySelector('.file-text');
    
    if (fileInput && fileText) {
        fileInput.addEventListener('change', function(e) {
            const fileName = e.target.files[0]?.name || 'No file chosen';
            fileText.textContent = fileName;
            
            // Add visual feedback
            if (e.target.files[0]) {
                fileText.style.color = '#4facfe';
                fileText.style.borderColor = '#4facfe';
            } else {
                fileText.style.color = 'rgba(255, 255, 255, 0.7)';
                fileText.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            }
        });
    }
}

// Form Validation
function setupFormValidation() {
    // Register form validation
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            if (!validateRegisterForm()) {
                e.preventDefault();
                showNotification('Please fill all fields correctly', 'error');
            }
        });
    }
    
    // Login form validation
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            if (!validateLoginForm()) {
                e.preventDefault();
                showNotification('Please fill all fields correctly', 'error');
            }
        });
    }
    
    // Admin form validation
    const adminForm = document.getElementById('adminForm');
    if (adminForm) {
        adminForm.addEventListener('submit', function(e) {
            if (!validateAdminForm()) {
                e.preventDefault();
                showNotification('Please fill all fields correctly', 'error');
            }
        });
    }
}

function validateRegisterForm() {
    const fullName = document.getElementById('fullName').value.trim();
    const mobileNumber = document.getElementById('mobileNumber').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (fullName.length < 2) {
        showFieldError('fullName', 'Name must be at least 2 characters');
        return false;
    }
    
    if (!isValidMobile(mobileNumber)) {
        showFieldError('mobileNumber', 'Please enter a valid mobile number');
        return false;
    }
    
    if (password.length < 6) {
        showFieldError('password', 'Password must be at least 6 characters');
        return false;
    }
    
    if (password !== confirmPassword) {
        showFieldError('confirmPassword', 'Passwords do not match');
        return false;
    }
    
    clearFieldErrors();
    return true;
}

function validateLoginForm() {
    const mobileNumber = document.getElementById('loginMobile').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!isValidMobile(mobileNumber)) {
        showFieldError('loginMobile', 'Please enter a valid mobile number');
        return false;
    }
    
    if (password.length < 1) {
        showFieldError('loginPassword', 'Password is required');
        return false;
    }
    
    clearFieldErrors();
    return true;
}

function validateAdminForm() {
    const adminId = document.getElementById('adminId').value.trim();
    const adminPassword = document.getElementById('adminPassword').value;
    
    if (adminId.length < 1) {
        showFieldError('adminId', 'Admin ID is required');
        return false;
    }
    
    if (adminPassword.length < 1) {
        showFieldError('adminPassword', 'Admin password is required');
        return false;
    }
    
    clearFieldErrors();
    return true;
}

// Utility Functions
function isValidMobile(mobile) {
    const mobileRegex = /^[0-9]{10,15}$/;
    return mobileRegex.test(mobile);
}

function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.style.borderColor = '#ff4757';
        field.style.boxShadow = '0 0 10px rgba(255, 71, 87, 0.3)';
        
        // Remove existing error message
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Add error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.color = '#ff4757';
        errorDiv.style.fontSize = '0.8rem';
        errorDiv.style.marginTop = '5px';
        errorDiv.textContent = message;
        
        field.parentNode.appendChild(errorDiv);
    }
}

function clearFieldErrors() {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        input.style.boxShadow = 'none';
        
        const errorMessage = input.parentNode.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    });
}

// Panel Navigation
function setupPanelNavigation() {
    // Add click handlers for navigation links
    const registerLink = document.querySelector('a[onclick="showPanel(\'register\')"]');
    const loginLink = document.querySelector('a[onclick="showPanel(\'login\')"]');
    
    if (registerLink) {
        registerLink.addEventListener('click', function(e) {
            e.preventDefault();
            showPanel('register');
        });
    }
    
    if (loginLink) {
        loginLink.addEventListener('click', function(e) {
            e.preventDefault();
            showPanel('login');
        });
    }
}

function showPanel(panelName) {
    const panels = document.querySelectorAll('.panel');
    const targetPanel = document.querySelector(`.panel:has(h2:contains('${panelName}'))`);
    
    if (targetPanel) {
        // Scroll to the target panel
        targetPanel.scrollIntoView({ 
            behavior: 'smooth',
            block: 'center'
        });
        
        // Add highlight effect
        targetPanel.style.transform = 'scale(1.02)';
        targetPanel.style.boxShadow = '0 25px 50px rgba(79, 172, 254, 0.4)';
        
        setTimeout(() => {
            targetPanel.style.transform = 'scale(1)';
            targetPanel.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3)';
        }, 300);
    }
}

// Notification System
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 10px;
        color: white;
        font-weight: 600;
        z-index: 1000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    // Set notification styles based on type
    switch (type) {
        case 'success':
            notification.style.background = 'linear-gradient(45deg, #2ed573, #7bed9f)';
            break;
        case 'error':
            notification.style.background = 'linear-gradient(45deg, #ff4757, #ff6b7a)';
            break;
        case 'warning':
            notification.style.background = 'linear-gradient(45deg, #ffa502, #ffb142)';
            break;
        default:
            notification.style.background = 'linear-gradient(45deg, #4facfe, #00f2fe)';
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 5000);
}

// Input Enhancement
function enhanceInputs() {
    const inputs = document.querySelectorAll('input');
    
    inputs.forEach(input => {
        // Add focus effects
        input.addEventListener('focus', function() {
            this.parentNode.style.transform = 'scale(1.02)';
        });
        
        input.addEventListener('blur', function() {
            this.parentNode.style.transform = 'scale(1)';
        });
        
        // Add typing animation
        input.addEventListener('input', function() {
            if (this.value.length > 0) {
                this.style.borderColor = '#4facfe';
            } else {
                this.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            }
        });
    });
}

// Initialize input enhancements
document.addEventListener('DOMContentLoaded', function() {
    enhanceInputs();
});

// Add CSS for error messages
const style = document.createElement('style');
style.textContent = `
    .error-message {
        color: #ff4757;
        font-size: 0.8rem;
        margin-top: 5px;
        animation: fadeIn 0.3s ease;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);
