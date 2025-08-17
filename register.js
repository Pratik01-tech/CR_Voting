document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const togglePassword = document.getElementById('togglePassword');
    const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
    const passwordField = document.getElementById('password');
    const confirmPasswordField = document.getElementById('confirmPassword');
    const voterCardInput = document.getElementById('voterCard');
    const imagePreview = document.getElementById('imagePreview');
    const previewImage = document.getElementById('previewImage');

    // Toggle password visibility
    togglePassword.addEventListener('click', function() {
        const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordField.setAttribute('type', type);
        this.classList.toggle('fa-eye');
        this.classList.toggle('fa-eye-slash');
    });

    toggleConfirmPassword.addEventListener('click', function() {
        const type = confirmPasswordField.getAttribute('type') === 'password' ? 'text' : 'password';
        confirmPasswordField.setAttribute('type', type);
        this.classList.toggle('fa-eye');
        this.classList.toggle('fa-eye-slash');
    });

    // Image preview functionality
    voterCardInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                showMessage('Please select a valid image file', 'error');
                this.value = '';
                return;
            }

            // Validate file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                showMessage('Image size should be less than 5MB', 'error');
                this.value = '';
                return;
            }

            // Create preview
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImage.src = e.target.result;
                imagePreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });

    // Form submission
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const fullName = document.getElementById('fullName').value.trim();
        const mobile = document.getElementById('mobile').value.trim();
        const password = passwordField.value;
        const confirmPassword = confirmPasswordField.value;
        const voterCard = voterCardInput.files[0];

        // Validation
        if (!fullName || !mobile || !password || !confirmPassword || !voterCard) {
            showMessage('Please fill in all fields and upload an image', 'error');
            return;
        }

        if (fullName.length < 2) {
            showMessage('Full name must be at least 2 characters long', 'error');
            return;
        }

        if (mobile.length < 10) {
            showMessage('Please enter a valid mobile number', 'error');
            return;
        }

        if (!validatePassword(password)) {
            showMessage('Password must be at least 8 characters with uppercase, lowercase, number, and special character', 'error');
            return;
        }

        if (password !== confirmPassword) {
            showMessage('Passwords do not match', 'error');
            return;
        }

        // Show loading state
        const submitBtn = registerForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Registering...';
        submitBtn.disabled = true;

        // Create FormData for file upload
        const formData = new FormData();
        formData.append('fullName', fullName);
        formData.append('mobile', mobile);
        formData.append('password', password);
        formData.append('confirmPassword', confirmPassword);
        formData.append('voterCard', voterCard);

        // Send registration request
        fetch('php/register.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showMessage('Registration successful! Redirecting to login...', 'success');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            } else {
                showMessage(data.message || 'Registration failed. Please try again.', 'error');
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

    // Password validation function
    function validatePassword(password) {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        return password.length >= minLength && 
               hasUpperCase && 
               hasLowerCase && 
               hasNumbers && 
               hasSpecialChar;
    }

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
        registerForm.parentNode.insertBefore(messageDiv, registerForm.nextSibling);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }

    // Real-time password strength indicator
    passwordField.addEventListener('input', function() {
        const password = this.value;
        const strength = calculatePasswordStrength(password);
        updatePasswordStrengthIndicator(strength);
    });

    function calculatePasswordStrength(password) {
        let score = 0;
        
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[a-z]/.test(password)) score++;
        if (/\d/.test(password)) score++;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
        
        return score;
    }

    function updatePasswordStrengthIndicator(strength) {
        // Remove existing strength indicator
        const existingIndicator = document.querySelector('.password-strength');
        if (existingIndicator) {
            existingIndicator.remove();
        }

        if (strength === 0) return;

        const strengthText = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
        const strengthColor = ['#ff4757', '#ffa500', '#ffd700', '#2ed573', '#00d4ff'];
        
        const indicator = document.createElement('div');
        indicator.className = 'password-strength';
        indicator.style.cssText = `
            margin-top: 5px;
            font-size: 12px;
            color: ${strengthColor[strength - 1]};
            font-weight: 600;
        `;
        indicator.textContent = `Password Strength: ${strengthText[strength - 1]}`;
        
        passwordField.parentNode.appendChild(indicator);
    }

    // Real-time mobile number validation
    mobile.addEventListener('input', function() {
        const mobileNumber = this.value;
        const isValid = /^\d{10,15}$/.test(mobileNumber);
        
        if (mobileNumber.length > 0) {
            if (isValid) {
                this.style.borderColor = '#2ed573';
            } else {
                this.style.borderColor = '#ff4757';
            }
        } else {
            this.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        }
    });

    // Real-time name validation
    fullName.addEventListener('input', function() {
        const name = this.value;
        const isValid = name.length >= 2 && /^[a-zA-Z\s]+$/.test(name);
        
        if (name.length > 0) {
            if (isValid) {
                this.style.borderColor = '#2ed573';
            } else {
                this.style.borderColor = '#ff4757';
            }
        } else {
            this.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        }
    });
});
