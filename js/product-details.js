// Product Details Manager
class ProductDetailsManager {
    constructor() {
        this.product = null;
        this.relatedProducts = [];
        this.currentImageIndex = 0;
        this.productImages = [];
        this.productId = null;
    }

    async initialize() {
        this.productId = this.getProductIdFromURL();
        if (!this.productId) {
            this.showError('Product not found', 'Invalid product ID');
            return;
        }

        await this.loadProduct();
        await this.loadRelatedProducts();
        this.setupImageModal();
    }

    getProductIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    async loadProduct() {
        try {
            const response = await apiService.getProduct(this.productId);
            this.product = response.data;
            this.renderProduct();
        } catch (error) {
            console.error('Failed to load product:', error);
            this.showError('Product not found', 'The requested product could not be found.');
        }
    }

    renderProduct() {
        if (!this.product) return;

        const container = document.getElementById('product-container');
        
        // Update breadcrumb
        const breadcrumbProduct = document.getElementById('breadcrumb-product');
        if (breadcrumbProduct) {
            breadcrumbProduct.textContent = this.product.name;
        }

        // Update page title
        document.title = `${this.product.name} - HerbaCure`;

        // Prepare product images
        this.productImages = [];
        if (this.product.image) {
            this.productImages.push(this.product.image);
        }
        if (this.product.images && Array.isArray(this.product.images)) {
            this.productImages.push(...this.product.images);
        }
        if (this.productImages.length === 0) {
            this.productImages.push('assets/images/placeholder-product.jpg');
        }

        const productHTML = `
            <div class="product-images" data-aos="fade-right">
                <div class="main-image-container" onclick="openImageModal(0)">
                    <img src="${this.productImages[0]}" alt="${this.product.name}" class="main-image" id="main-product-image">
                    <div class="zoom-indicator">
                        <i class="fas fa-search-plus"></i>
                        Click to zoom
                    </div>
                </div>
                ${this.productImages.length > 1 ? `
                    <div class="thumbnail-images">
                        ${this.productImages.map((image, index) => `
                            <img src="${image}" alt="${this.product.name}" class="thumbnail ${index === 0 ? 'active' : ''}" 
                                 onclick="changeMainImage(${index})">
                        `).join('')}
                    </div>
                ` : ''}
            </div>

            <div class="product-info" data-aos="fade-left">
                <h1 class="product-title">${this.product.name}</h1>
                
                ${this.product.category ? `
                    <span class="product-category">${this.product.category.name}</span>
                ` : ''}

                ${this.product.price ? `
                    <div class="product-price">
                        $${this.product.price}
                        ${this.product.originalPrice ? `<span class="original-price">$${this.product.originalPrice}</span>` : ''}
                    </div>
                ` : ''}

                <div class="product-description">
                    ${this.product.description || 'Premium quality product from HerbaCure.'}
                </div>

                <div class="product-meta">
                    ${this.product.weight ? `
                        <div class="meta-item">
                            <i class="fas fa-weight-hanging"></i>
                            <span class="meta-label">Weight:</span>
                            <span>${this.product.weight}</span>
                        </div>
                    ` : ''}
                    
                    ${this.product.origin ? `
                        <div class="meta-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <span class="meta-label">Origin:</span>
                            <span>${this.product.origin}</span>
                        </div>
                    ` : ''}
                    
                    ${this.product.shelfLife ? `
                        <div class="meta-item">
                            <i class="fas fa-calendar-alt"></i>
                            <span class="meta-label">Shelf Life:</span>
                            <span>${this.product.shelfLife}</span>
                        </div>
                    ` : ''}
                    
                    ${this.product.storage ? `
                        <div class="meta-item">
                            <i class="fas fa-thermometer-half"></i>
                            <span class="meta-label">Storage:</span>
                            <span>${this.product.storage}</span>
                        </div>
                    ` : ''}

                    <div class="meta-item">
                        <i class="fas fa-leaf"></i>
                        <span class="meta-label">Organic:</span>
                        <span>${this.product.isOrganic ? 'Yes' : 'No'}</span>
                    </div>
                </div>

                ${this.product.features && this.product.features.length > 0 ? `
                    <div class="product-features">
                        <h3 class="features-title">
                            <i class="fas fa-star"></i>
                            Key Features
                        </h3>
                        <ul class="features-list">
                            ${this.product.features.map(feature => `
                                <li>
                                    <i class="fas fa-check"></i>
                                    ${feature}
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                ` : ''}

                <div class="product-actions">
                    <a href="contact.html" class="action-btn btn-primary">
                        <i class="fas fa-envelope"></i>
                        Contact for Order
                    </a>
                    <a href="gallery.html" class="action-btn btn-secondary">
                        <i class="fas fa-arrow-left"></i>
                        Back to Gallery
                    </a>
                    <button class="action-btn btn-secondary" onclick="shareProduct()">
                        <i class="fas fa-share-alt"></i>
                        Share Product
                    </button>
                </div>

                ${this.product.specifications && Object.keys(this.product.specifications).length > 0 ? `
                    <div class="product-specifications">
                        <h3 class="specifications-title">
                            <i class="fas fa-list-ul"></i>
                            Specifications
                        </h3>
                        <div class="specifications-grid">
                            ${Object.entries(this.product.specifications).map(([key, value]) => `
                                <div class="spec-item">
                                    <span class="spec-label">${key}:</span>
                                    <span class="spec-value">${value}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;

        container.innerHTML = productHTML;

        // Initialize AOS animations
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        }
    }

    async loadRelatedProducts() {
        try {
            const params = {
                limit: 4,
                isActive: true
            };

            // If product has category, get products from same category
            if (this.product && this.product.category) {
                params.category = this.product.category._id;
            }

            const response = await apiService.getProducts(params);
            this.relatedProducts = (response.data || []).filter(p => p._id !== this.productId);
            
            this.renderRelatedProducts();
        } catch (error) {
            console.error('Failed to load related products:', error);
        }
    }

    renderRelatedProducts() {
        const container = document.getElementById('related-products');
        if (!container) return;

        if (this.relatedProducts.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #6c757d;">No related products found.</p>';
            return;
        }

        const relatedHTML = this.relatedProducts.map(product => `
            <div class="related-product-card" onclick="viewProduct('${product._id}')">
                <img src="${product.image || 'assets/images/placeholder-product.jpg'}" 
                     alt="${product.name}" class="related-product-image">
                <div class="related-product-info">
                    <h4 class="related-product-title">${product.name}</h4>
                    ${product.price ? `<div class="related-product-price">$${product.price}</div>` : ''}
                    <p class="related-product-description">
                        ${product.description ? product.description.substring(0, 100) + '...' : 'Premium quality product'}
                    </p>
                </div>
            </div>
        `).join('');

        container.innerHTML = relatedHTML;
    }

    setupImageModal() {
        // Modal is already created in HTML, just setup keyboard navigation
        document.addEventListener('keydown', (e) => {
            const modal = document.getElementById('image-modal');
            if (modal && modal.style.display === 'flex') {
                switch(e.key) {
                    case 'ArrowLeft':
                        this.navigateProductImages(-1);
                        break;
                    case 'ArrowRight':
                        this.navigateProductImages(1);
                        break;
                    case 'Escape':
                        this.closeImageModal();
                        break;
                }
            }
        });
    }

    openImageModal(index = 0) {
        this.currentImageIndex = index;
        const modal = document.getElementById('image-modal');
        const modalImage = document.getElementById('modal-product-image');
        
        modalImage.src = this.productImages[this.currentImageIndex];
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    closeImageModal() {
        const modal = document.getElementById('image-modal');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    navigateProductImages(direction) {
        this.currentImageIndex += direction;
        
        if (this.currentImageIndex >= this.productImages.length) {
            this.currentImageIndex = 0;
        } else if (this.currentImageIndex < 0) {
            this.currentImageIndex = this.productImages.length - 1;
        }
        
        const modalImage = document.getElementById('modal-product-image');
        modalImage.src = this.productImages[this.currentImageIndex];
    }

    changeMainImage(index) {
        this.currentImageIndex = index;
        const mainImage = document.getElementById('main-product-image');
        const thumbnails = document.querySelectorAll('.thumbnail');
        
        // Update main image
        mainImage.src = this.productImages[index];
        
        // Update active thumbnail
        thumbnails.forEach((thumb, i) => {
            thumb.classList.toggle('active', i === index);
        });
    }

    showError(title, message) {
        const container = document.getElementById('product-container');
        container.innerHTML = `
            <div class="error-container">
                <i class="fas fa-exclamation-triangle"></i>
                <h2>${title}</h2>
                <p>${message}</p>
                <a href="gallery.html" class="btn">Back to Gallery</a>
            </div>
        `;
    }
}

// Global functions
function openImageModal(index) {
    if (window.productDetailsManager) {
        window.productDetailsManager.openImageModal(index);
    }
}

function closeImageModal() {
    if (window.productDetailsManager) {
        window.productDetailsManager.closeImageModal();
    }
}

function navigateProductImages(direction) {
    if (window.productDetailsManager) {
        window.productDetailsManager.navigateProductImages(direction);
    }
}

function changeMainImage(index) {
    if (window.productDetailsManager) {
        window.productDetailsManager.changeMainImage(index);
    }
}

function viewProduct(productId) {
    window.location.href = `product-details.html?id=${productId}`;
}

function shareProduct() {
    if (navigator.share && window.productDetailsManager && window.productDetailsManager.product) {
        navigator.share({
            title: window.productDetailsManager.product.name,
            text: window.productDetailsManager.product.description,
            url: window.location.href
        }).catch(console.error);
    } else {
        // Fallback: copy URL to clipboard
        navigator.clipboard.writeText(window.location.href).then(() => {
            alert('Product URL copied to clipboard!');
        }).catch(() => {
            alert('Unable to share. Please copy the URL manually.');
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
    window.productDetailsManager = new ProductDetailsManager();
    await window.productDetailsManager.initialize();
});