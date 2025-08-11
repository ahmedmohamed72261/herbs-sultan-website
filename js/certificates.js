// Certificates Page Manager
class CertificatesPageManager {
    constructor() {
        this.certificates = [];
        this.modal = null;
        this.currentCertificate = null;
    }

    async initialize() {
        console.log('Certificates page initializing...');
        
        // Initialize AOS
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 800,
                easing: 'ease-in-out',
                once: true
            });
        }
        
        this.setupModal();
        this.setupAnimations();
        await this.loadCertificates();
    }

    async loadCertificates() {
        try {
            const response = await apiService.getCertificates({ isActive: true });
            this.certificates = response.data || [];
            
            this.renderCertificates();
            this.updateCertificateStats();
            
        } catch (error) {
            console.error('Failed to load certificates:', error);
            this.showError('Failed to load certificates. Please try again later.');
        }
    }

    renderCertificates() {
        const certificatesGrid = document.querySelector('.certificates-grid');
        if (!certificatesGrid) return;

        if (this.certificates.length === 0) {
            certificatesGrid.innerHTML = '<p style="text-align: center; color: #6c757d;">No certificates available at the moment.</p>';
            return;
        }

        const certificatesHTML = this.certificates.map((cert, index) => this.createCertificateCard(cert, index)).join('');
        certificatesGrid.innerHTML = certificatesHTML;

        // Setup click handlers for view buttons
        this.setupViewButtons();
        this.setupCardAnimations();
    }

    createCertificateCard(certificate, index) {
        const issueDate = certificate.issueDate ? new Date(certificate.issueDate).toLocaleDateString() : 'N/A';
        const expiryDate = certificate.expiryDate ? new Date(certificate.expiryDate).toLocaleDateString() : 'N/A';
        
        return `
            <div class="certificate-card modern-card" data-aos="fade-up" data-aos-delay="${index * 100}">
                <div class="certificate-badge">${certificate.type || 'Official'}</div>
                <div class="certificate-image-wrapper">
                    <div class="certificate-image">
                        <img src="${certificate.image || 'assets/images/placeholder-certificate.jpg'}" 
                             alt="${certificate.name}" 
                             loading="lazy"
                             onerror="this.src='assets/images/placeholder-certificate.jpg'" />
                        <div class="image-overlay">
                            <div class="overlay-content">
                                <i class="fas fa-certificate"></i>
                                <span>View Certificate</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="certificate-content">
                    <div class="certificate-header">
                        <h3>${certificate.name}</h3>
                        <div class="certificate-status">
                            <i class="fas fa-check-circle"></i>
                            <span>Verified</span>
                        </div>
                    </div>
                    <p class="certificate-description">${certificate.description || 'Quality certification for our products and services.'}</p>
                    
                    <div class="certificate-details">
                        ${certificate.issuer ? `<p class="cert-issuer"><strong>Issued by:</strong> ${certificate.issuer}</p>` : ''}
                        ${certificate.certificateNumber ? `<p class="cert-number"><strong>Certificate #:</strong> ${certificate.certificateNumber}</p>` : ''}
                        <p class="cert-date">
                            ${certificate.issueDate ? `Issued: ${issueDate}` : ''}
                            ${certificate.expiryDate ? ` | Valid until: ${expiryDate}` : ''}
                        </p>
                    </div>
                    
                    <div class="certificate-actions">
                        <button class="view-cert primary-btn" data-certificate-id="${certificate._id}">
                            <span>View Certificate</span>
                        </button>
                        <button class="download-cert secondary-btn" data-certificate-id="${certificate._id}">
                            <i class="fas fa-download"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    setupViewButtons() {
        // Setup view certificate buttons
        const viewButtons = document.querySelectorAll('.view-cert');
        viewButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const certificateId = button.getAttribute('data-certificate-id');
                this.openCertificateModal(certificateId);
            });
        });

        // Setup download buttons in cards
        const downloadButtons = document.querySelectorAll('.download-cert');
        downloadButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const certificateId = button.getAttribute('data-certificate-id');
                const certificate = this.certificates.find(cert => cert._id === certificateId);
                if (certificate) {
                    this.downloadCertificate(certificate);
                }
            });
        });

        // Setup image overlay click to view certificate
        const imageOverlays = document.querySelectorAll('.image-overlay');
        imageOverlays.forEach((overlay, index) => {
            overlay.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.certificates[index]) {
                    this.openCertificateModal(this.certificates[index]._id);
                }
            });
        });

        // Setup image click to view certificate
        const certificateImages = document.querySelectorAll('.certificate-image img');
        certificateImages.forEach((img, index) => {
            img.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.certificates[index]) {
                    this.openCertificateModal(this.certificates[index]._id);
                }
            });
        });
    }

    downloadCertificate(certificate) {
        if (certificate.documentUrl) {
            // Open document URL in new tab
            window.open(certificate.documentUrl, '_blank');
        } else if (certificate.image) {
            // Download image
            const link = document.createElement('a');
            link.href = certificate.image;
            link.download = certificate.name.replace(/\s+/g, '_') + '_Certificate.jpg';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            alert('Download not available for this certificate.');
        }
    }

    setupCardAnimations() {
        const certificateCards = document.querySelectorAll('.certificate-card');
        certificateCards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-15px)';
                this.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.12)';
            });

            card.addEventListener('mouseleave', function() {
                this.style.transform = '';
                this.style.boxShadow = '';
            });
        });
    }

    setupModal() {
        this.modal = document.querySelector('.certificate-modal');
        const closeBtn = document.querySelector('.close-modal');
        
        // Close modal when clicking close button
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }
        
        // Close modal when clicking outside
        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.closeModal();
                }
            });
        }
        
        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal && this.modal.style.display === 'block') {
                this.closeModal();
            }
        });
    }

    openCertificateModal(certificateId) {
        const certificate = this.certificates.find(cert => cert._id === certificateId);
        if (!certificate) return;

        this.currentCertificate = certificate;
        this.updateModalContent(certificate);
        
        if (this.modal) {
            this.modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            
            // Add animation
            setTimeout(() => {
                this.modal.classList.add('active');
                const modalContent = this.modal.querySelector('.modal-content');
                if (modalContent) {
                    modalContent.classList.add('active');
                }
            }, 10);
        }
    }

    updateModalContent(certificate) {
        // Update modal title and badge
        const modalTitle = document.getElementById('modal-title');
        const modalBadge = document.getElementById('modal-badge');
        
        if (modalTitle) modalTitle.textContent = certificate.name;
        if (modalBadge) modalBadge.textContent = certificate.type || 'Official';

        // Update modal image with loading
        this.loadModalImage(certificate);

        // Update description
        const modalDescription = document.getElementById('modal-description');
        if (modalDescription) {
            modalDescription.textContent = certificate.description || 'Quality certification for our products and services.';
        }

        // Update date information
        const modalDate = document.getElementById('modal-date');
        if (modalDate) {
            const issueDate = certificate.issueDate ? new Date(certificate.issueDate).toLocaleDateString() : 'N/A';
            const expiryDate = certificate.expiryDate ? new Date(certificate.expiryDate).toLocaleDateString() : 'N/A';
            
            let dateText = '';
            if (certificate.issueDate) dateText += `Issued: ${issueDate}`;
            if (certificate.expiryDate) dateText += ` | Valid until: ${expiryDate}`;
            if (certificate.issuer) dateText += ` | Issued by: ${certificate.issuer}`;
            
            modalDate.textContent = dateText || 'Date information not available';
        }

        // Setup action buttons
        this.setupModalActions(certificate);
    }

    loadModalImage(certificate) {
        const modalImage = document.getElementById('modal-image');
        const loadingOverlay = document.querySelector('.image-loading-overlay');
        
        if (!modalImage) return;

        // Show loading overlay
        if (loadingOverlay) {
            loadingOverlay.style.display = 'flex';
        }

        // Hide previous image
        modalImage.style.opacity = '0';
        modalImage.style.display = 'none';

        // Load new image
        const img = new Image();
        img.onload = () => {
            // Hide loading overlay
            if (loadingOverlay) {
                loadingOverlay.style.display = 'none';
            }

            // Show image with fade-in effect
            modalImage.src = certificate.image || 'assets/images/placeholder-certificate.jpg';
            modalImage.alt = certificate.name;
            modalImage.style.display = 'block';
            
            // Trigger reflow for animation
            void modalImage.offsetWidth;
            
            modalImage.classList.add('fade-in');
            modalImage.style.opacity = '1';
        };

        img.onerror = () => {
            // Hide loading overlay
            if (loadingOverlay) {
                loadingOverlay.style.display = 'none';
            }

            // Show fallback image
            modalImage.src = 'assets/images/placeholder-certificate.jpg';
            modalImage.alt = 'Certificate image could not be loaded';
            modalImage.style.display = 'block';
            modalImage.style.opacity = '1';
        };

        // Start loading
        img.src = certificate.image || 'assets/images/placeholder-certificate.jpg';
    }

    setupModalActions(certificate) {
        // Download button in modal
        const downloadBtn = document.querySelector('.modal-actions .download-cert');
        if (downloadBtn) {
            downloadBtn.onclick = () => {
                this.downloadCertificate(certificate);
            };
        }

        // Verify button
        const verifyBtn = document.querySelector('.verify-cert');
        if (verifyBtn) {
            verifyBtn.onclick = () => {
                if (certificate.verificationUrl) {
                    window.open(certificate.verificationUrl, '_blank');
                } else {
                    alert(`Certificate verification: ${certificate.name} is valid and verified by ${certificate.issuer || 'the issuing authority'}.`);
                }
            };
        }
    }

    closeModal() {
        if (this.modal) {
            this.modal.classList.remove('active');
            const modalContent = this.modal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.classList.remove('active');
            }
            
            setTimeout(() => {
                this.modal.style.display = 'none';
                document.body.style.overflow = 'auto';
                
                // Reset image fade-in class
                const modalImage = document.getElementById('modal-image');
                if (modalImage) {
                    modalImage.classList.remove('fade-in');
                }
            }, 300);
        }
        
        this.currentCertificate = null;
    }

    updateCertificateStats() {
        const statNumbers = document.querySelectorAll('.stat-number');
        if (statNumbers.length >= 3) {
            // Update stats based on loaded certificates
            const totalCerts = this.certificates.length;
            const organicCerts = this.certificates.filter(cert => 
                cert.type?.toLowerCase().includes('organic') || 
                cert.name?.toLowerCase().includes('organic')
            ).length;
            
            // Animate counters
            this.animateCounter(statNumbers[0], 0, totalCerts, 2000);
            if (statNumbers[1]) {
                statNumbers[1].textContent = '100%'; // Organic percentage
            }
            if (statNumbers[2]) {
                statNumbers[2].textContent = '5'; // Quality steps
            }
        }
    }

    setupAnimations() {
        // Add animation to intro content section
        const introIcon = document.querySelector('.intro-content-icon');
        if (introIcon) {
            introIcon.classList.add('pulse-animation');
        }
    }

    animateCounter(element, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const value = Math.floor(progress * (end - start) + start);

            element.textContent = value + (element.textContent.includes('+') ? '+' : '');

            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                element.textContent = end + '+';
            }
        };
        window.requestAnimationFrame(step);
    }

    showError(message) {
        const certificatesGrid = document.querySelector('.certificates-grid');
        if (certificatesGrid) {
            certificatesGrid.innerHTML = `
                <div class="error-message" style="text-align: center; padding: 2rem; color: #6c757d; grid-column: 1 / -1;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem; color: #dc3545;"></i>
                    <p>${message}</p>
                    <button onclick="location.reload()" style="background: #28a745; color: white; border: none; padding: 0.5rem 1rem; border-radius: 5px; cursor: pointer;">Retry</button>
                </div>
            `;
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
    // Add required styles for modal and animations
    const style = document.createElement('style');
    style.textContent = `
        /* Modal Fullscreen Styles */
        .certificate-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.9);
            z-index: 9999;
            display: none;
            overflow: auto;
            opacity: 0;
            transition: opacity 0.3s ease;
            backdrop-filter: blur(5px);
        }

        .certificate-modal.active {
            opacity: 1;
        }

        .modal-content {
            background-color: white;
            margin: 2% auto;
            padding: 0;
            width: 95%;
            max-width: 1200px;
            border-radius: 15px;
            position: relative;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
            transform: translateY(50px);
            opacity: 0;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            overflow: hidden;
            max-height: 95vh;
        }

        .modal-content.active {
            transform: translateY(0);
            opacity: 1;
        }

        .close-modal {
            position: absolute;
            top: 20px;
            right: 25px;
            width: 45px;
            height: 45px;
            background-color: rgba(255, 255, 255, 0.95);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.8rem;
            color: #333;
            cursor: pointer;
            transition: all 0.3s ease;
            z-index: 10;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            border: none;
        }

        .close-modal:hover {
            background-color: #ff4757;
            color: white;
            transform: rotate(90deg) scale(1.1);
            box-shadow: 0 6px 20px rgba(255, 71, 87, 0.4);
        }

        /* Certificate Details Styles */
        .certificate-details {
            margin-bottom: 25px;
        }

        .certificate-details p {
            margin-bottom: 8px;
            color: #555;
            font-size: 0.95rem;
            line-height: 1.5;
        }

        .cert-issuer, .cert-number, .cert-date {
            padding: 8px 0;
            border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }

        .cert-date:last-child {
            border-bottom: none;
        }

        /* Button Animations */
        .view-cert.pressed {
            transform: scale(0.95);
            box-shadow: 0 2px 8px rgba(46, 125, 50, 0.2);
        }

        .btn-rotate {
            transition: all 0.3s ease;
        }

        .btn-rotate:hover {
            transform: translateY(-3px) rotate(1deg);
        }

        .fade-in {
            animation: fadeIn 0.8s ease-in-out;
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        .pulse-animation {
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0% {
                transform: scale(1);
                box-shadow: 0 10px 25px rgba(46, 125, 50, 0.2);
            }
            50% {
                transform: scale(1.05);
                box-shadow: 0 15px 30px rgba(46, 125, 50, 0.3);
            }
            100% {
                transform: scale(1);
                box-shadow: 0 10px 25px rgba(46, 125, 50, 0.2);
            }
        }

        /* Responsive Modal */
        @media (max-width: 768px) {
            .modal-content {
                width: 98%;
                margin: 1% auto;
                max-height: 98vh;
            }
            
            .close-modal {
                top: 15px;
                right: 15px;
                width: 40px;
                height: 40px;
                font-size: 1.5rem;
            }
        }
    `;
    document.head.appendChild(style);

    // Initialize certificates page
    window.certificatesPageManager = new CertificatesPageManager();
    await window.certificatesPageManager.initialize();
});