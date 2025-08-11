// Home Products Manager - Uses same card style as gallery
class HomeProductsManager {
    constructor() {
        this.products = [];
        this.categories = [];
        this.filteredProducts = [];
        this.currentFilter = 'all';
        this.productsGrid = null;
        this.maxProducts = 12; // Show more products on home page with filtering
        this.modal = null;
        this.currentIndex = 0;
    }

    async initialize() {
        this.productsGrid = document.getElementById('home-products-grid');
        if (!this.productsGrid) {
            console.warn('Home products grid not found');
            return;
        }

        this.setupModal();
        await this.loadProducts();
        await this.loadCategories();
        this.renderCategoryTabs();
    }

    async loadProducts() {
        try {
            // Show loading state
            this.showLoading();

            // Fetch products from API
            const response = await apiService.getProducts({ 
                isActive: true, 
                limit: this.maxProducts 
            });
            
            this.products = response.data || [];
            this.filteredProducts = [...this.products];
            
            if (this.products.length === 0) {
                // Use fallback data if no products from API
                this.loadFallbackProducts();
                return;
            }

            this.renderFilteredProducts();
            
        } catch (error) {
            console.error('Failed to load products for home page:', error);
            // Use fallback data when API fails
            this.loadFallbackProducts();
        }
    }

    loadFallbackProducts() {
        console.log('No products available from API');
        this.products = [];
        this.showNoProducts();
    }

    showLoading() {
        if (!this.productsGrid) return;
        
        this.productsGrid.innerHTML = `
            <div class="loading-products">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading products...</p>
            </div>
        `;
    }

    showNoProducts() {
        if (!this.productsGrid) return;
        
        this.productsGrid.innerHTML = `
            <div class="no-products" style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #6c757d;">
                <i class="fas fa-box-open" style="font-size: 3rem; margin-bottom: 1rem; color: #dee2e6;"></i>
                <h3>No products available</h3>
                <p>Check back later for our latest products.</p>
            </div>
        `;
    }

    showError() {
        if (!this.productsGrid) return;
        
        this.productsGrid.innerHTML = `
            <div class="error-products" style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #6c757d;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem; color: #dc3545;"></i>
                <h3>Failed to load products</h3>
                <p>Please check your internet connection and try again.</p>
                <button onclick="location.reload()" class="retry-btn" style="background: #4CAF50; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-top: 1rem;">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>
        `;
    }

    renderProducts() {
        if (!this.productsGrid) return;

        // Clear the grid
        this.productsGrid.innerHTML = '';

        // Create product cards using gallery style
        this.products.forEach((product, index) => {
            const productCard = this.createProductCard(product, index);
            this.productsGrid.appendChild(productCard);
        });

        this.setupProductClickHandlers();
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
                    <button class="view-product-btn" onclick="openHomeFullscreen(${index})">
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
                this.openFullscreen(index);
            }
        });

        return card;
    }

    setupModal() {
        // Create fullscreen modal if it doesn't exist
        if (!document.querySelector('.home-fullscreen-modal')) {
            const modalHTML = `
                <div class="fullscreen-modal home-fullscreen-modal" id="home-fullscreen-modal">
                    <button class="close-modal" onclick="closeHomeFullscreen()">
                        <i class="fas fa-times"></i>
                    </button>
                    <div class="modal-content">
                        <div class="modal-image-container">
                            <img id="home-modal-image" src="" alt="" />
                        </div>
                        <div class="modal-info">
                            <h3 id="home-modal-title"></h3>
                            <div class="modal-meta">
                                <div class="meta-item">
                                    <i class="fas fa-tag"></i>
                                    <span id="home-modal-category"></span>
                                </div>
                            </div>
                            <div class="modal-actions">
                                <button class="view-details-btn" id="home-modal-view-details">
                                    <i class="fas fa-info-circle"></i> View Full Details
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="modal-navigation">
                        <button class="nav-btn prev-btn" onclick="navigateHomeModal(-1)">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                        <button class="nav-btn next-btn" onclick="navigateHomeModal(1)">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }

        this.modal = document.getElementById('home-fullscreen-modal');
        this.setupModalEventListeners();
        this.setupKeyboardNavigation();
    }

    setupModalEventListeners() {
        if (!this.modal) return;

        const closeBtn = this.modal.querySelector('.close-modal');
        
        // Close on close button click
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeFullscreen());
        }
        
        // Close on background click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeFullscreen();
            }
        });
    }

    setupProductClickHandlers() {
        const productItems = document.querySelectorAll('.product-item');
        
        productItems.forEach((item, index) => {
            // Click on image opens fullscreen
            const imageContainer = item.querySelector('.product-image-container');
            imageContainer.addEventListener('click', (e) => {
                if (!e.target.closest('.product-actions')) {
                    this.openFullscreen(index);
                }
            });
        });
    }

    openFullscreen(index) {
        this.currentIndex = index;
        this.updateModal();
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    updateModal() {
        const product = this.products[this.currentIndex];
        if (!product) return;

        const modalImage = document.getElementById('home-modal-image');
        const modalTitle = document.getElementById('home-modal-title');
        const modalCategory = document.getElementById('home-modal-category');
        const viewDetailsBtn = document.getElementById('home-modal-view-details');

        modalImage.src = product.image || 'assets/images/placeholder-product.jpg';
        modalImage.alt = product.name;
        modalTitle.textContent = product.name;
        modalCategory.textContent = product.category?.name || 'Uncategorized';

        // Update view details button
        viewDetailsBtn.onclick = () => viewProductDetails(product._id);
    }

    navigateModal(direction) {
        this.currentIndex += direction;
        
        if (this.currentIndex >= this.products.length) {
            this.currentIndex = 0;
        } else if (this.currentIndex < 0) {
            this.currentIndex = this.products.length - 1;
        }
        
        this.updateModal();
    }

    closeFullscreen() {
        this.modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (this.modal && this.modal.classList.contains('active')) {
                switch(e.key) {
                    case 'ArrowLeft':
                        this.navigateModal(-1);
                        break;
                    case 'ArrowRight':
                        this.navigateModal(1);
                        break;
                    case 'Escape':
                        this.closeFullscreen();
                        break;
                }
            }
        });
    }

    async loadCategories() {
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

    renderCategoryTabs() {
        const categoryTabsContainer = document.getElementById('home-category-tabs');
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
        document.querySelectorAll('#home-category-tabs .category-tab').forEach(tab => {
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
        
        this.renderFilteredProducts();
    }

    renderFilteredProducts() {
        if (!this.productsGrid) return;

        // Clear the grid
        this.productsGrid.innerHTML = '';

        if (this.filteredProducts.length === 0) {
            this.showNoProducts();
            return;
        }

        // Create product cards using gallery style
        this.filteredProducts.forEach((product, index) => {
            const productCard = this.createProductCard(product, index);
            this.productsGrid.appendChild(productCard);
        });

        this.setupProductClickHandlers();

        // Trigger AOS animation refresh if available
        if (window.AOS) {
            window.AOS.refresh();
        }
    }

    // Get product by ID
    getProduct(productId) {
        return this.products.find(product => product._id === productId);
    }
}

// Global functions for home page fullscreen
function openHomeFullscreen(index) {
    if (window.homeProducts) {
        window.homeProducts.openFullscreen(index);
    }
}

function closeHomeFullscreen() {
    if (window.homeProducts) {
        window.homeProducts.closeFullscreen();
    }
}

function navigateHomeModal(direction) {
    if (window.homeProducts) {
        window.homeProducts.navigateModal(direction);
    }
}

function viewProductDetails(productId) {
    window.location.href = `product-details.html?id=${productId}`;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
    // Only initialize on home page
    if (document.getElementById('home-products-grid')) {
        window.homeProducts = new HomeProductsManager();
        await window.homeProducts.initialize();
    }
});