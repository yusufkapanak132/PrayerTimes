document.addEventListener('DOMContentLoaded', function() {
    // Password visibility toggle
    const passwordToggles = document.querySelectorAll('.password-toggle');
    
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            const icon = this.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
    
    // Form validation
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            let isValid = true;
            const inputs = this.querySelectorAll('input[required]');
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    showInputError(input, 'Това поле е задължително');
                } else {
                    clearInputError(input);
                    
                    // Email validation
                    if (input.type === 'email') {
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (!emailRegex.test(input.value)) {
                            isValid = false;
                            showInputError(input, 'Моля, въведете валиден имейл адрес');
                        }
                    }
                    
                    // Password validation for registration
                    if (input.name === 'password' && input.value.length < 6) {
                        isValid = false;
                        showInputError(input, 'Паролата трябва да бъде поне 6 символа');
                    }
                    
                    // Confirm password validation
                    if (input.name === 'confirm_password') {
                        const password = this.querySelector('input[name="password"]');
                        if (password && input.value !== password.value) {
                            isValid = false;
                            showInputError(input, 'Паролите не съвпадат');
                        }
                    }
                }
            });
            
            if (!isValid) {
                e.preventDefault();
            }
        });
    });
    
    // Input error handling
    function showInputError(input, message) {
        clearInputError(input);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'input-error';
        errorDiv.style.color = '#c62828';
        errorDiv.style.fontSize = '12px';
        errorDiv.style.marginTop = '5px';
        errorDiv.style.display = 'flex';
        errorDiv.style.alignItems = 'center';
        errorDiv.style.gap = '5px';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        
        input.parentElement.appendChild(errorDiv);
        input.style.borderColor = '#c62828';
    }
    
    function clearInputError(input) {
        const existingError = input.parentElement.querySelector('.input-error');
        if (existingError) {
            existingError.remove();
        }
        input.style.borderColor = '';
    }
    
    // Real-time password confirmation check
    const confirmPassword = document.getElementById('confirm_password');
    if (confirmPassword) {
        const password = document.getElementById('password');
        
        confirmPassword.addEventListener('input', function() {
            if (password.value !== this.value && this.value.length > 0) {
                showInputError(this, 'Паролите не съвпадат');
            } else {
                clearInputError(this);
            }
        });
        
        password.addEventListener('input', function() {
            if (confirmPassword.value && confirmPassword.value !== this.value) {
                showInputError(confirmPassword, 'Паролите не съвпадат');
            }
        });
    }
    
    // Add focus effects
    const inputs = document.querySelectorAll('.form-control');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'translateY(-2px)';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'translateY(0)';
        });
    });
});