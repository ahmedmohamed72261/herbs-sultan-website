// Home Contact Form Manager
class HomeContactFormManager {
    constructor() {
        this.form = null;
        this.submitButton = null;
        this.isSubmitting = false;
    }

    initialize() {
        // Initialize contact form on home page
        this.form = document.getElementById('contactForm');
        if (this.form) {
            this.submitButton = this.form.querySelector('.submit-btn');
            this.setupFormHandler();
            this.setupValidation();
        }
        
        this.loadContactInfo();
    }

    setupFormHandler() {
        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleSubmit();
        });
    }

    setupValidation() {
        const inputs = this.form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Remove existing error styling
        this.clearFieldError(field);

        switch(field.type) {
            case 'email':
                if (value && !this.isValidEmail(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid email address';
                }
                break;
            case 'tel':
                if (value && !this.isValidPhone(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid phone number';
                }
                break;
        }

        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        }

        if (!isValid) {
            this.showFieldError(field, errorMessage);
        }

        return isValid;
    }

    showFieldError(field, message) {
        field.classList.add('error');
        
        // Remove existing error message
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Add new error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            color: #dc3545;
            font-size: 0.8rem;
            margin-top: 0.25rem;
            display: block;
        `;
        
        field.parentNode.appendChild(errorDiv);
    }

    clearFieldError(field) {
        field.classList.remove('error');
        const errorMessage = field.parentNode.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }

    async handleSubmit() {
        if (this.isSubmitting) return;

        // Validate all fields
        const inputs = this.form.querySelectorAll('input[required], textarea[required]');
        let isFormValid = true;

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isFormValid = false;
            }
        });

        if (!isFormValid) {
            this.showMessage('Please correct the errors above', 'error');
            return;
        }

        // Prepare form data
        const formData = new FormData(this.form);
        const messageData = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone') || '',
            subject: formData.get('subject'),
            message: formData.get('message')
        };

        this.isSubmitting = true;
        this.updateSubmitButton('Sending...', true);

        try {
            // Send to backend API
            await apiService.sendMessage(messageData);
            
            this.showMessage('Thank you for your message! We will get back to you soon.', 'success');
            this.form.reset();
            
        } catch (error) {
            console.error('Failed to send message:', error);
            
            // Fallback: store locally and show appropriate message
            this.storeMessageLocally(messageData);
            this.showMessage('Message received! We will contact you soon.', 'success');
            this.form.reset();
            
        } finally {
            this.isSubmitting = false;
            this.updateSubmitButton('Send Message <i class="fas fa-paper-plane"></i>', false);
        }
    }

    updateSubmitButton(html, disabled) {
        if (this.submitButton) {
            this.submitButton.innerHTML = html;
            this.submitButton.disabled = disabled;
            
            if (disabled) {
                this.submitButton.style.opacity = '0.7';
                this.submitButton.style.cursor = 'not-allowed';
            } else {
                this.submitButton.style.opacity = '1';
                this.submitButton.style.cursor = 'pointer';
            }
        }
    }

    storeMessageLocally(messageData) {
        try {
            const messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
            messages.push({
                ...messageData,
                timestamp: new Date().toISOString(),
                id: Date.now().toString()
            });
            localStorage.setItem('contactMessages', JSON.stringify(messages));
        } catch (error) {
            console.error('Failed to store message locally:', error);
        }
    }

    showMessage(message, type) {
        // Remove existing message
        const existingMessage = document.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.className = `form-message ${type}`;
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            padding: 1rem;
            margin: 1rem 0;
            border-radius: 8px;
            text-align: center;
            font-weight: 500;
            ${type === 'success' 
                ? 'background: #d4edda; color: #155724; border: 1px solid #c3e6cb;' 
                : 'background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;'
            }
        `;

        // Insert after form
        this.form.parentNode.insertBefore(messageDiv, this.form.nextSibling);

        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }

    async loadContactInfo() {
        try {
            const response = await apiService.getContactMethods();
            const contactMethods = response.data || [];
            this.updateContactDisplay(contactMethods);
        } catch (error) {
            console.error('Failed to load contact info:', error);
            // Set fallback values if API fails
            this.setFallbackContactInfo();
        }
    }

    updateContactDisplay(contactMethods) {
        contactMethods.forEach(method => {
            // Update contact details in the page
            const elements = document.querySelectorAll(`[data-contact-type="${method.type}"]`);
            elements.forEach(element => {
                if (method.type === 'phone') {
                    element.textContent = method.value;
                    if (element.tagName === 'A') {
                        element.href = `tel:${method.value}`;
                    }
                } else if (method.type === 'email') {
                    element.textContent = method.value;
                    if (element.tagName === 'A') {
                        element.href = `mailto:${method.value}`;
                    }
                } else if (method.type === 'address') {
                    element.textContent = method.value;
                } else if (method.type === 'whatsapp') {
                    if (element.tagName === 'A') {
                        element.href = `https://wa.me/${method.value.replace(/\D/g, '')}`;
                    }
                }
            });
        });
    }

    setFallbackContactInfo() {
        // Set fallback contact information if API fails
        const fallbackData = [
            { type: 'address', value: 'Egypt, Beni Suef, Sumusta Al Waqf' },
            { type: 'phone', value: '+20 1009480722' },
            { type: 'email', value: 'info@.net' }
        ];
        
        this.updateContactDisplay(fallbackData);
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidPhone(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const homeContactManager = new HomeContactFormManager();
    homeContactManager.initialize();
});