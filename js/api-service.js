// API Service for HerbaCure Frontend
// Base API URL - Change this to your deployed backend URL
const API_BASE_URL = 'https://herbs-dashboard-backend-sultan.vercel.app/api';

// API Service Class
class APIService {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    // Generic fetch method with error handling
    async fetchAPI(endpoint, options = {}) {
        try {
            const url = `${this.baseURL}${endpoint}`;
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            };

            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'API request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Products API
    async getProducts(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `/products${queryString ? `?${queryString}` : ''}`;
        return this.fetchAPI(endpoint);
    }

    async getProduct(id) {
        return this.fetchAPI(`/products/${id}`);
    }

    // Team API
    async getTeamMembers(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `/team${queryString ? `?${queryString}` : ''}`;
        return this.fetchAPI(endpoint);
    }

    async getTeamMember(id) {
        return this.fetchAPI(`/team/${id}`);
    }

    // Certificates API
    async getCertificates(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `/certificates${queryString ? `?${queryString}` : ''}`;
        return this.fetchAPI(endpoint);
    }

    async getCertificate(id) {
        return this.fetchAPI(`/certificates/${id}`);
    }

    // Contact API
    async getContactMethods(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `/contact${queryString ? `?${queryString}` : ''}`;
        return this.fetchAPI(endpoint);
    }

    // Messages API (for contact form)
    async sendMessage(messageData) {
        return this.fetchAPI('/messages', {
            method: 'POST',
            body: JSON.stringify(messageData)
        });
    }

    // Categories API
    async getCategories(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `/categories${queryString ? `?${queryString}` : ''}`;
        return this.fetchAPI(endpoint);
    }

    // Dashboard API (for general stats)
    async getDashboardStats() {
        return this.fetchAPI('/dashboard/stats');
    }

    // Health check
    async healthCheck() {
        return this.fetchAPI('/health');
    }
}

// Create global API service instance
const apiService = new APIService();

// Gallery Data Manager
class GalleryManager {
    constructor() {
        this.products = [];
        this.certificates = [];
        this.teamMembers = [];
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;

        try {
            // Load data from API
            const [productsResponse, certificatesResponse, teamResponse] = await Promise.all([
                apiService.getProducts({ limit: 20 }),
                apiService.getCertificates({ limit: 10 }),
                apiService.getTeamMembers({ limit: 10 })
            ]);

            this.products = productsResponse.data || [];
            this.certificates = certificatesResponse.data || [];
            this.teamMembers = teamResponse.data || [];
            this.initialized = true;

            console.log('Gallery data loaded:', {
                products: this.products.length,
                certificates: this.certificates.length,
                teamMembers: this.teamMembers.length
            });
        } catch (error) {
            console.error('Failed to load gallery data:', error);
            // Use fallback data if API fails
            this.initializeFallbackData();
        }
    }

    initializeFallbackData() {
        // No fallback data - rely entirely on API
        this.products = [];
        this.certificates = [];
        this.teamMembers = [];
    }

    getProductsForGallery() {
        return this.products.map(product => ({
            id: product._id,
            title: product.name,
            description: product.description,
            image: product.image,
            category: 'products'
        }));
    }

    getCertificatesForGallery() {
        return this.certificates.map(cert => ({
            id: cert._id,
            title: cert.name,
            description: cert.description,
            image: cert.image,
            category: 'certificates'
        }));
    }

    getTeamForGallery() {
        return this.teamMembers.map(member => ({
            id: member._id,
            title: member.name,
            description: `${member.position} - ${member.bio || 'Team member'}`,
            image: member.image,
            category: 'team'
        }));
    }

    getAllGalleryItems() {
        return [
            ...this.getProductsForGallery(),
            ...this.getCertificatesForGallery(),
            ...this.getTeamForGallery()
        ];
    }
}

// Create global gallery manager
const galleryManager = new GalleryManager();

// Contact Form Handler
class ContactFormHandler {
    constructor() {
        this.form = null;
        this.submitButton = null;
    }

    initialize() {
        this.form = document.querySelector('#contact-form, .contact-form, form[action*="contact"]');
        if (!this.form) {
            // Create a contact form if it doesn't exist
            this.createContactForm();
        }
        this.setupFormHandler();
        this.loadContactInfo();
    }

    createContactForm() {
        const contactSection = document.querySelector('#contact, .contact-section');
        if (!contactSection) return;

        const formHTML = `
            <div class="contact-form-container" style="margin-top: 2rem;">
                <h3>Send us a Message</h3>
                <form id="contact-form" class="contact-form">
                    <div class="form-group">
                        <input type="text" name="name" placeholder="Your Name" required>
                    </div>
                    <div class="form-group">
                        <input type="email" name="email" placeholder="Your Email" required>
                    </div>
                    <div class="form-group">
                        <input type="tel" name="phone" placeholder="Your Phone (Optional)">
                    </div>
                    <div class="form-group">
                        <input type="text" name="subject" placeholder="Subject" required>
                    </div>
                    <div class="form-group">
                        <textarea name="message" placeholder="Your Message" rows="5" required></textarea>
                    </div>
                    <button type="submit" class="submit-btn">Send Message</button>
                </form>
            </div>
        `;

        contactSection.insertAdjacentHTML('beforeend', formHTML);
        this.form = document.getElementById('contact-form');
    }

    setupFormHandler() {
        if (!this.form) return;

        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleSubmit(e);
        });
    }

    async handleSubmit(event) {
        const formData = new FormData(this.form);
        const messageData = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone') || '',
            subject: formData.get('subject'),
            message: formData.get('message')
        };

        const submitButton = this.form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;

        try {
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;

            await apiService.sendMessage(messageData);
            
            // Show success message
            this.showMessage('Message sent successfully! We will get back to you soon.', 'success');
            this.form.reset();

        } catch (error) {
            console.error('Failed to send message:', error);
            this.showMessage('Failed to send message. Please try again later.', 'error');
        } finally {
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    }

    async loadContactInfo() {
        try {
            const response = await apiService.getContactMethods({ isActive: true });
            const contactMethods = response.data || [];
            this.updateContactDisplay(contactMethods);
        } catch (error) {
            console.error('Failed to load contact info:', error);
        }
    }

    updateContactDisplay(contactMethods) {
        contactMethods.forEach(method => {
            const elements = document.querySelectorAll(`[data-contact-type="${method.type}"]`);
            elements.forEach(element => {
                if (method.type === 'phone' || method.type === 'whatsapp') {
                    element.textContent = method.value;
                    element.href = `tel:${method.value}`;
                } else if (method.type === 'email') {
                    element.textContent = method.value;
                    element.href = `mailto:${method.value}`;
                } else if (method.type === 'address') {
                    element.textContent = method.value;
                }
            });
        });
    }

    showMessage(message, type) {
        // Create or update message display
        let messageDiv = document.querySelector('.form-message');
        if (!messageDiv) {
            messageDiv = document.createElement('div');
            messageDiv.className = 'form-message';
            this.form.appendChild(messageDiv);
        }

        messageDiv.textContent = message;
        messageDiv.className = `form-message ${type}`;
        messageDiv.style.cssText = `
            padding: 1rem;
            margin: 1rem 0;
            border-radius: 4px;
            text-align: center;
            ${type === 'success' ? 'background: #d4edda; color: #155724; border: 1px solid #c3e6cb;' : 'background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;'}
        `;

        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }
}

// Page-specific initializers
const PageInitializers = {
    // Home page initializer
    home: async function() {
        console.log('Initializing home page...');
        
        // Initialize gallery manager for home page gallery section
        await galleryManager.initialize();
        
        // Update gallery items if gallery exists on home page
        const galleryGrid = document.querySelector('.gallery-grid');
        if (galleryGrid) {
            this.updateHomeGallery(galleryGrid);
        }

        // Load featured products for organic section
        this.loadFeaturedProducts();
    },

    updateHomeGallery: function(galleryGrid) {
        const products = galleryManager.getProductsForGallery().slice(0, 4);
        
        // Update existing gallery items with real data
        const galleryItems = galleryGrid.querySelectorAll('.gallery-item[data-category="products"]');
        
        products.forEach((product, index) => {
            if (galleryItems[index]) {
                const img = galleryItems[index].querySelector('img');
                const title = galleryItems[index].querySelector('h3');
                const description = galleryItems[index].querySelector('p');
                
                if (img && product.image) img.src = product.image;
                if (title) title.textContent = product.title;
                if (description) description.textContent = product.description;
            }
        });
    },

    loadFeaturedProducts: async function() {
        try {
            const response = await apiService.getProducts({ featured: true, limit: 6 });
            const products = response.data || [];
            
            // You can update any featured products section here
            console.log('Featured products loaded:', products.length);
        } catch (error) {
            console.error('Failed to load featured products:', error);
        }
    },

    // Gallery page initializer - handled by dedicated gallery.js
    gallery: async function() {
        console.log('Gallery page handled by dedicated gallery.js');
        // Gallery functionality is now handled by the dedicated gallery.js file
        // This prevents conflicts between different gallery systems
    },

    // Team page initializer - handled by dedicated team.js
    team: async function() {
        console.log('Team page handled by dedicated team.js');
        // Team functionality is now handled by the dedicated team.js file
        // This prevents conflicts between different team systems
    },

    // Certificates page initializer - handled by dedicated certificates.js
    certificates: async function() {
        console.log('Certificates page handled by dedicated certificates.js');
        // Certificate functionality is now handled by the dedicated certificates.js file
        // This prevents conflicts between different certificate systems
    },

    // Contact page initializer
    contact: async function() {
        console.log('Initializing contact page...');
        
        const contactHandler = new ContactFormHandler();
        contactHandler.initialize();
    },

    // About page initializer
    about: async function() {
        console.log('Initializing about page...');
        
        // Load company stats or other about page data
        try {
            const response = await apiService.getDashboardStats();
            const stats = response.data || {};
            
            this.updateAboutStats(stats);
        } catch (error) {
            console.error('Failed to load about stats:', error);
        }
    },

    updateAboutStats: function(stats) {
        // Update any statistics on the about page
        const statsElements = {
            products: document.querySelector('[data-stat="products"]'),
            team: document.querySelector('[data-stat="team"]'),
            certificates: document.querySelector('[data-stat="certificates"]'),
            customers: document.querySelector('[data-stat="customers"]')
        };

        Object.keys(statsElements).forEach(key => {
            const element = statsElements[key];
            if (element && stats[key]) {
                element.textContent = stats[key];
            }
        });
    }
};

// Auto-initialize based on current page
document.addEventListener('DOMContentLoaded', async function() {
    console.log('API Service initialized');
    
    // Test API connection
    try {
        await apiService.healthCheck();
        console.log('✅ Backend API connection successful');
    } catch (error) {
        console.warn('⚠️ Backend API not available, using fallback data');
    }

    // Determine current page and initialize accordingly
    const currentPage = getCurrentPage();
    console.log('Current page detected:', currentPage);

    if (PageInitializers[currentPage]) {
        try {
            await PageInitializers[currentPage]();
            console.log(`✅ ${currentPage} page initialized successfully`);
        } catch (error) {
            console.error(`❌ Failed to initialize ${currentPage} page:`, error);
        }
    }

    // Initialize contact form on all pages (for footer newsletter, etc.)
    const contactHandler = new ContactFormHandler();
    contactHandler.loadContactInfo();
});

// Helper function to determine current page
function getCurrentPage() {
    const path = window.location.pathname;
    const filename = path.split('/').pop() || 'index.html';
    
    if (filename.includes('index') || filename === '' || filename === '/') {
        return 'home';
    } else if (filename.includes('gallery')) {
        return 'gallery';
    } else if (filename.includes('team')) {
        return 'team';
    } else if (filename.includes('certificates')) {
        return 'certificates';
    } else if (filename.includes('contact')) {
        return 'contact';
    } else if (filename.includes('about')) {
        return 'about';
    }
    
    return 'home'; // default
}

// Export for use in other scripts
window.apiService = apiService;
window.galleryManager = galleryManager;
window.PageInitializers = PageInitializers;