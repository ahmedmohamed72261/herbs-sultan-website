// Gallery Manager for Products API Integration
class ProductsGalleryManager {
    constructor() {
        this.products = [];
        this.categories = [];
        this.filteredProducts = [];
        this.currentFilter = 'all';
        this.currentIndex = 0;
        this.modal = null;
        this.initialized = false;
        this.loading = false;
    }

    async initialize() {
        if (this.initialized) return;
        
        console.log('Initializing Products Gallery...');
        
        // Show loading state
        this.showLoadingState();
        
        try {
            // Load products and categories from API
            await this.loadProductsFromAPI();
            await this.loadCategoriesFromAPI();
            
            // Render the gallery
            this.renderCategoryTabs();
            this.renderProductsGallery();
            this.updateProductsCount();
            
            // Setup modal and event listeners
            this.setupModal();
            this.setupEventListeners();
            
            this.initialized = true;
            console.log('✅ Products Gallery initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize gallery:', error);
            this.showErrorState();
        } finally {
            this.hideLoadingState();
        }
    }

    async loadProductsFromAPI() {
        try {
            const response = await apiService.getProducts({ limit: 50 });
            
            if (response.success && response.data) {
                this.products = response.data;
                this.filteredProducts = [...this.products];
                console.log(`Loaded ${this.products.length} products from API`);
            } else {
                throw new Error('Invalid API response format');
            }
        } catch (error) {
            console.error('Failed to load products:', error);
            // Use fallback data
            this.products = this.getFallbackProducts();
            this.filteredProducts = [...this.products];
        }
    }

    async loadCategoriesFromAPI() {
        try {
            const response = await apiService.getCategories();
            
            if (response.success && response.data) {
                this.categories = response.data;
            } else {
                // Extract categories from products if categories API fails
                this.extractCategoriesFromProducts();
            }
        } catch (error) {
            console.error('Failed to load categories:', error);
            // Extract categories from products
            this.extractCategoriesFromProducts();
        }
    }

    extractCategoriesFromProducts() {
        const categoryMap = new Map();
        
        this.products.forEach(product => {
            if (product.category && product.category.name) {
                categoryMap.set(product.category._id, product.category);
            }
        });
        
        this.categories = Array.from(categoryMap.values());
        console.log(`Extracted ${this.categories.length} categories from products`);
    }

    getFallbackProducts() {
        return [];
    }

    renderCategoryTabs() {
        const categoryTabsContainer = document.getElementById('category-tabs');
        if (!categoryTabsContainer) return;

        // Clear loading content
        categoryTabsContainer.innerHTML = '';

        // Create "All" tab
        const allTab = this.createCategoryTab('all', 'All Products', true);
        categoryTabsContainer.appendChild(allTab);

        // Create category tabs
        this.categories.forEach(category => {
            const tab = this.createCategoryTab(category._id, category.name, false);
            categoryTabsContainer.appendChild(tab);
        });
    }

    createCategoryTab(categoryId, categoryName, isActive = false) {
        const tab = document.createElement('button');
        tab.className = `category-tab ${isActive ? 'active' : ''}`;
        tab.setAttribute('data-category', categoryId);
        tab.textContent = categoryName;
        
        tab.addEventListener('click', () => {
            this.filterByCategory(categoryId);
            this.updateActiveTab(tab);
        });

        return tab;
    }

    updateActiveTab(activeTab) {
        // Remove active class from all tabs
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Add active class to clicked tab
        activeTab.classList.add('active');
    }

    filterByCategory(categoryId) {
        this.currentFilter = categoryId;
        
        if (categoryId === 'all') {
            this.filteredProducts = [...this.products];
        } else {
            this.filteredProducts = this.products.filter(product => 
                product.category && product.category._id === categoryId
            );
        }
        
        this.renderProductsGallery();
        this.updateProductsCount();
    }

    renderProductsGallery() {
        const galleryContainer = document.getElementById('products-gallery');
        if (!galleryContainer) return;

        // Clear existing content
        galleryContainer.innerHTML = '';

        if (this.filteredProducts.length === 0) {
            this.showNoProductsMessage(galleryContainer);
            return;
        }

        // Create product cards
        this.filteredProducts.forEach((product, index) => {
            const productCard = this.createProductCard(product, index);
            galleryContainer.appendChild(productCard);
        });

        // Trigger AOS animation refresh if available
        if (window.AOS) {
            window.AOS.refresh();
        }
    }

    createProductCard(product, index) {
        const card = document.createElement('div');
        card.className = 'gallery-item product-card';
        card.setAttribute('data-product-id', product._id);
        card.setAttribute('data-aos', 'fade-up');
        card.setAttribute('data-aos-delay', (index * 100).toString());

        // Handle missing or invalid images
        const imageUrl = product.image || 'assets/images/placeholder-product.jpg';
        const categoryName = product.category?.name || 'Uncategorized';
        const featuredBadge = product.featured ? '<span class="featured-badge">Featured</span>' : '';

        card.innerHTML = `
            <div class="product-image">
                <img src="${imageUrl}" 
                     alt="${product.name}" 
                     loading="lazy"
                     onerror="this.src='assets/images/placeholder-product.jpg'" />
                ${featuredBadge}
                <div class="product-overlay">
                    <button class="view-product-btn" onclick="window.productsGallery.openFullscreenModal('${product._id}')">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                </div>
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <div class="product-meta">
                    <span class="product-category">
                        <i class="fas fa-tag"></i> ${categoryName}
                    </span>
                </div>
            </div>
        `;

        // Add click event for fullscreen modal
        card.addEventListener('click', (e) => {
            // Don't trigger if clicking on the view button
            if (!e.target.closest('.view-product-btn')) {
                this.openFullscreenModal(product._id);
            }
        });

        return card;
    }

    showNoProductsMessage(container) {
        container.innerHTML = `
            <div class="no-products-message">
                <i class="fas fa-search"></i>
                <h3>No products found</h3>
                <p>No products available in this category.</p>
            </div>
        `;
    }

    updateProductsCount() {
        const countElement = document.getElementById('showing-count');
        if (countElement) {
            countElement.textContent = this.filteredProducts.length;
        }
    }

    setupModal() {
        // Create modal if it doesn't exist
        if (!document.querySelector('.product-modal')) {
            this.createProductModal();
        }
        
        this.modal = document.querySelector('.product-modal');
        this.setupModalEventListeners();
    }

    createProductModal() {
        const modalHTML = `
            <div class="product-modal" style="display: none;">
                <div class="modal-overlay"></div>
                <div class="modal-content">
                    <button class="modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                    <div class="modal-body">
                        <div class="modal-image">
                            <img id="modal-product-image" src="" alt="" />
                        </div>
                        <div class="modal-info">
                            <h2 id="modal-product-name"></h2>
                            <p id="modal-product-description"></p>
                            <div class="modal-meta">
                                <div class="meta-item">
                                    <strong>Category:</strong>
                                    <span id="modal-product-category"></span>
                                </div>
                                <div class="meta-item" id="modal-product-tags-container" style="display: none;">
                                    <strong>Tags:</strong>
                                    <span id="modal-product-tags"></span>
                                </div>
                            </div>
                            <div class="modal-actions">
                                <button class="contact-btn" onclick="window.open('https://wa.me/201009480722', '_blank')">
                                    <i class="fab fa-whatsapp"></i> Contact for Details
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="modal-navigation">
                        <button class="nav-btn prev-btn" onclick="window.productsGallery.navigateModal(-1)">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                        <button class="nav-btn next-btn" onclick="window.productsGallery.navigateModal(1)">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    setupModalEventListeners() {
        const modal = this.modal;
        const closeBtn = modal.querySelector('.modal-close');
        const overlay = modal.querySelector('.modal-overlay');

        // Close modal events
        closeBtn.addEventListener('click', () => this.closeModal());
        overlay.addEventListener('click', () => this.closeModal());

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (modal.style.display === 'block') {
                switch(e.key) {
                    case 'Escape':
                        this.closeModal();
                        break;
                    case 'ArrowLeft':
                        this.navigateModal(-1);
                        break;
                    case 'ArrowRight':
                        this.navigateModal(1);
                        break;
                }
            }
        });
    }

    openProductModal(productId) {
        const product = this.filteredProducts.find(p => p._id === productId);
        if (!product) return;

        this.currentIndex = this.filteredProducts.findIndex(p => p._id === productId);
        this.updateModalContent(product);
        
        this.modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    updateModalContent(product) {
        const modal = this.modal;
        
        // Update image
        const image = modal.querySelector('#modal-product-image');
        image.src = product.image || 'assets/images/placeholder-product.jpg';
        image.alt = product.name;
        image.onerror = () => image.src = 'assets/images/placeholder-product.jpg';

        // Update text content
        modal.querySelector('#modal-product-name').textContent = product.name;
        modal.querySelector('#modal-product-description').textContent = 
            product.description || 'No description available';
        modal.querySelector('#modal-product-category').textContent = 
            product.category?.name || 'Uncategorized';

        // Update tags if available
        const tagsContainer = modal.querySelector('#modal-product-tags-container');
        const tagsElement = modal.querySelector('#modal-product-tags');
        
        if (product.tags && product.tags.length > 0) {
            tagsElement.textContent = product.tags.join(', ');
            tagsContainer.style.display = 'block';
        } else {
            tagsContainer.style.display = 'none';
        }
    }

    navigateModal(direction) {
        if (this.filteredProducts.length === 0) return;

        this.currentIndex += direction;
        
        if (this.currentIndex >= this.filteredProducts.length) {
            this.currentIndex = 0;
        } else if (this.currentIndex < 0) {
            this.currentIndex = this.filteredProducts.length - 1;
        }
        
        const product = this.filteredProducts[this.currentIndex];
        this.updateModalContent(product);
    }

    openFullscreenModal(productId) {
        const product = this.filteredProducts.find(p => p._id === productId);
        if (!product) return;

        this.currentIndex = this.filteredProducts.findIndex(p => p._id === productId);
        
        // Create fullscreen modal if it doesn't exist
        if (!document.querySelector('.fullscreen-modal')) {
            this.createFullscreenModal();
        }
        
        this.updateFullscreenModalContent(product);
        
        const fullscreenModal = document.querySelector('.fullscreen-modal');
        fullscreenModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    createFullscreenModal() {
        const fullscreenModalHTML = `
            <div class="fullscreen-modal">
                <button class="close-modal" onclick="window.productsGallery.closeFullscreenModal()">
                    <i class="fas fa-times"></i>
                </button>
                <div class="modal-content">
                    <div class="modal-image-container">
                        <img id="fullscreen-modal-image" src="" alt="" />
                    </div>
                    <div class="modal-info">
                        <h3 id="fullscreen-modal-name"></h3>
                        <div class="modal-meta">
                            <div class="meta-item">
                                <i class="fas fa-tag"></i>
                                <span id="fullscreen-modal-category"></span>
                            </div>
                        </div>
                        <div class="modal-actions">
                            <button class="view-details-btn" onclick="window.productsGallery.goToProductDetails()">
                                <i class="fas fa-info-circle"></i> View Full Details
                            </button>
                        </div>
                    </div>
                </div>
                <div class="modal-navigation">
                    <button class="nav-btn prev-btn" onclick="window.productsGallery.navigateFullscreenModal(-1)">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <button class="nav-btn next-btn" onclick="window.productsGallery.navigateFullscreenModal(1)">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', fullscreenModalHTML);
        
        // Setup event listeners for fullscreen modal
        const fullscreenModal = document.querySelector('.fullscreen-modal');
        const closeBtn = fullscreenModal.querySelector('.close-modal');
        
        closeBtn.addEventListener('click', () => this.closeFullscreenModal());
        
        // Close on background click
        fullscreenModal.addEventListener('click', (e) => {
            if (e.target === fullscreenModal) {
                this.closeFullscreenModal();
            }
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (fullscreenModal.classList.contains('active')) {
                switch(e.key) {
                    case 'Escape':
                        this.closeFullscreenModal();
                        break;
                    case 'ArrowLeft':
                        this.navigateFullscreenModal(-1);
                        break;
                    case 'ArrowRight':
                        this.navigateFullscreenModal(1);
                        break;
                }
            }
        });
    }

    updateFullscreenModalContent(product) {
        const modal = document.querySelector('.fullscreen-modal');
        
        // Update image
        const image = modal.querySelector('#fullscreen-modal-image');
        image.src = product.image || 'assets/images/placeholder-product.jpg';
        image.alt = product.name;
        image.onerror = () => image.src = 'assets/images/placeholder-product.jpg';

        // Update text content
        modal.querySelector('#fullscreen-modal-name').textContent = product.name;
        modal.querySelector('#fullscreen-modal-category').textContent = 
            product.category?.name || 'Uncategorized';
            
        // Store current product for navigation to details
        this.currentProduct = product;
    }

    navigateFullscreenModal(direction) {
        if (this.filteredProducts.length === 0) return;

        this.currentIndex += direction;
        
        if (this.currentIndex >= this.filteredProducts.length) {
            this.currentIndex = 0;
        } else if (this.currentIndex < 0) {
            this.currentIndex = this.filteredProducts.length - 1;
        }
        
        const product = this.filteredProducts[this.currentIndex];
        this.updateFullscreenModalContent(product);
    }

    closeFullscreenModal() {
        const fullscreenModal = document.querySelector('.fullscreen-modal');
        if (fullscreenModal) {
            fullscreenModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }

    goToProductDetails() {
        if (this.currentProduct) {
            window.location.href = `product-details.html?id=${this.currentProduct._id}`;
        }
    }

    closeModal() {
        this.modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    setupEventListeners() {
        // Search functionality (if search input exists)
        const searchInput = document.querySelector('#products-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchProducts(e.target.value);
            });
        }
    }

    searchProducts(query) {
        const searchTerm = query.toLowerCase().trim();
        
        if (searchTerm === '') {
            this.filterByCategory(this.currentFilter);
            return;
        }

        this.filteredProducts = this.products.filter(product => {
            return product.name.toLowerCase().includes(searchTerm) ||
                   (product.description && product.description.toLowerCase().includes(searchTerm)) ||
                   (product.category && product.category.name.toLowerCase().includes(searchTerm));
        });

        this.renderProductsGallery();
        this.updateProductsCount();
    }

    showLoadingState() {
        const galleryContainer = document.getElementById('products-gallery');
        const categoryTabs = document.getElementById('category-tabs');
        
        if (galleryContainer) {
            galleryContainer.innerHTML = `
                <div class="loading-products">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Loading products...</p>
                </div>
            `;
        }

        if (categoryTabs) {
            categoryTabs.innerHTML = `
                <div class="loading-categories">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Loading categories...</p>
                </div>
            `;
        }
    }

    hideLoadingState() {
        // Loading states will be replaced by actual content
    }

    showErrorState() {
        const galleryContainer = document.getElementById('products-gallery');
        const categoryTabs = document.getElementById('category-tabs');
        
        if (galleryContainer) {
            galleryContainer.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Failed to load products</h3>
                    <p>Please check your internet connection and try again.</p>
                    <button onclick="window.productsGallery.initialize()" class="retry-btn">
                        <i class="fas fa-redo"></i> Retry
                    </button>
                </div>
            `;
        }

        if (categoryTabs) {
            categoryTabs.innerHTML = `
                <button class="category-tab active" data-category="all">All Products</button>
            `;
        }
    }
}

// Initialize gallery when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
    // Only initialize on gallery page
    if (window.location.pathname.includes('gallery') || document.getElementById('products-gallery')) {
        // Wait for API service to be available
        if (typeof apiService === 'undefined') {
            console.warn('API Service not available, waiting...');
            setTimeout(() => {
                if (typeof apiService !== 'undefined') {
                    initializeGallery();
                }
            }, 1000);
        } else {
            initializeGallery();
        }
    }
});

async function initializeGallery() {
    window.productsGallery = new ProductsGalleryManager();
    await window.productsGallery.initialize();
}

// Global functions for backward compatibility
window.openProductModal = function(productId) {
    if (window.productsGallery) {
        window.productsGallery.openProductModal(productId);
    }
};

window.closeProductModal = function() {
    if (window.productsGallery) {
        window.productsGallery.closeModal();
    }
};

window.navigateProductModal = function(direction) {
    if (window.productsGallery) {
        window.productsGallery.navigateModal(direction);
    }
};