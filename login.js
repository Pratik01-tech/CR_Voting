document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const togglePassword = document.getElementById('togglePassword');
    const passwordField = document.getElementById('password');

    // Toggle password visibility
    togglePassword.addEventListener('click', function() {
        const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordField.setAttribute('type', type);
        this.classList.toggle('fa-eye');
        this.classList.toggle('fa-eye-slash');
    });

    // Handle form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const mobile = document.getElementById('mobile').value.trim();
        const password = passwordField.value;

        // Basic validation
        if (!mobile || !password) {
            showMessage('Please fill in all fields', 'error');
            return;
        }

        if (mobile.length < 10) {
            showMessage('Please enter a valid mobile number', 'error');
            return;
        }

        // Show loading state
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Logging in...';
        submitBtn.disabled = true;

        // Send login request
        fetch('php/login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                mobile: mobile,
                password: password
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Store voter data in session storage
                sessionStorage.setItem('voterData', JSON.stringify(data.voter));
                
                // Show success message and redirect
                showMessage('Login successful! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = 'voting.html';
                }, 1500);
            } else {
                showMessage(data.message || 'Login failed. Please try again.', 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showMessage('Network error. Please try again.', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        });
    });

    // Function to show messages
    function showMessage(message, type) {
        // Remove existing message
        const existingMessage = document.querySelector('.message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;
        
        // Insert after form
        loginForm.parentNode.insertBefore(messageDiv, loginForm.nextSibling);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }

    // Check if user is already logged in
    const voterData = sessionStorage.getItem('voterData');
    if (voterData) {
        window.location.href = 'voting.html';
    }
});
