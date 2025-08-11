// Team Page Manager
class TeamPageManager {
    constructor() {
        this.teamMembers = [];
        this.filteredMembers = [];
        this.currentFilter = 'all';
        this.modal = null;
        this.currentMember = null;
    }

    async initialize() {
        console.log('Team page initializing...');
        
        // Initialize AOS
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 800,
                easing: 'ease-in-out',
                once: true
            });
        }
        
        this.setupFilters();
        this.setupModal();
        this.setupMobileMenu();
        await this.loadTeamMembers();
    }

    async loadTeamMembers() {
        try {
            const response = await apiService.getTeamMembers({ isActive: true });
            this.teamMembers = response.data || [];
            this.filteredMembers = [...this.teamMembers];
            
            this.renderManagementTeam();
            this.renderAllTeamMembers();
            this.updateTeamStats();
            
        } catch (error) {
            console.error('Failed to load team members:', error);
            // Load fallback data for demonstration
            this.loadFallbackData();
        }
    }

    renderManagementTeam() {
        const managementGrid = document.getElementById('management-grid');
        if (!managementGrid) return;

        const managementMembers = this.teamMembers.filter(member => 
            member.department === 'management' || member.isManagement
        );

        if (managementMembers.length === 0) {
            managementGrid.innerHTML = '<p style="text-align: center; color: #6c757d;">No management team members found.</p>';
            return;
        }

        const managementHTML = managementMembers.map(member => this.createManagementCard(member)).join('');
        managementGrid.innerHTML = managementHTML;
    }

    renderAllTeamMembers() {
        const teamGrid = document.getElementById('team-grid');
        if (!teamGrid) return;

        if (this.teamMembers.length === 0) {
            teamGrid.innerHTML = '<p style="text-align: center; color: #6c757d;">No team members found.</p>';
            return;
        }

        const teamHTML = this.teamMembers.map(member => this.createTeamCard(member)).join('');
        teamGrid.innerHTML = teamHTML;
    }

    createManagementCard(member) {
        return `
            <div class="management-card professional-team-card" data-department="${member.department}" onclick="openTeamModal('${member._id}')">
                <div class="professional-status-badge">
                    <i class="fas fa-crown"></i>
                    Leadership
                </div>
                <div class="management-image professional-member-image">
                    <img src="${member.image || 'assets/images/placeholder-team.jpg'}" alt="${member.name}" />
                    <div class="management-overlay professional-member-overlay">
                        <div class="overlay-content professional-overlay-content">
                            <i class="fas fa-eye"></i>
                            <span>View Profile</span>
                            <div class="overlay-accent"></div>
                        </div>
                    </div>
                    ${member.department ? `<div class="department-badge">${this.formatDepartment(member.department)}</div>` : ''}
                </div>
                <div class="management-info professional-member-info">
                    <div class="member-header">
                        <h3 class="member-name">${member.name}</h3>
                        <p class="position member-position">${member.position}</p>
                        ${member.tenure ? `<p class="member-tenure">${member.tenure}</p>` : ''}
                    </div>
                    
                    ${member.experience ? `
                        <div class="member-experience-badge">
                            <i class="fas fa-briefcase"></i>
                            <span>${member.experience} years experience</span>
                        </div>
                    ` : ''}
                    
                    ${member.bio ? `
                        <div class="member-bio">
                            <p>${member.bio.substring(0, 150)}${member.bio.length > 150 ? '...' : ''}</p>
                        </div>
                    ` : ''}
                    
                    ${member.specializations && member.specializations.length > 0 ? `
                        <div class="professional-member-skills">
                            <div class="skills-header">
                                <i class="fas fa-star"></i>
                                <span>Expertise</span>
                            </div>
                            <div class="skills-tags">
                                ${member.specializations.slice(0, 3).map(skill => 
                                    `<span class="skill-tag professional-skill-tag">${skill}</span>`
                                ).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="management-contact professional-member-contact">
                        ${member.email ? `<a href="mailto:${member.email}" class="contact-link email-link" onclick="event.stopPropagation()" title="Email ${member.name}"><i class="fas fa-envelope"></i></a>` : ''}
                        ${member.phone ? `<a href="tel:${member.phone}" class="contact-link phone-link" onclick="event.stopPropagation()" title="Call ${member.name}"><i class="fas fa-phone"></i></a>` : ''}
                        ${member.whatsapp ? `<a href="https://wa.me/${member.whatsapp}" target="_blank" class="contact-link whatsapp-link" onclick="event.stopPropagation()" title="WhatsApp ${member.name}"><i class="fab fa-whatsapp"></i></a>` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    createTeamCard(member) {
        return `
            <div class="team-member-card professional-team-card" data-department="${member.department}" onclick="openTeamModal('${member._id}')">
                ${member.isManagement || member.featured ? `
                    <div class="professional-status-badge">
                        <i class="fas fa-star"></i>
                        ${member.isManagement ? 'Leadership' : 'Featured'}
                    </div>
                ` : ''}
                <div class="member-image professional-member-image">
                    <img src="${member.image || 'assets/images/placeholder-team.jpg'}" alt="${member.name}" />
                    <div class="member-overlay professional-member-overlay">
                        <div class="overlay-content professional-overlay-content">
                            <i class="fas fa-user"></i>
                            <span>View Profile</span>
                            <div class="overlay-accent"></div>
                        </div>
                    </div>
                    ${member.department ? `<div class="department-badge">${this.formatDepartment(member.department)}</div>` : ''}
                </div>
                <div class="member-info professional-member-info">
                    <div class="member-header">
                        <h4 class="member-name">${member.name}</h4>
                        <p class="position member-position">${member.position}</p>
                        ${member.tenure ? `<p class="member-tenure">${member.tenure}</p>` : ''}
                    </div>
                    
                    ${member.experience ? `
                        <div class="member-experience-badge">
                            <i class="fas fa-briefcase"></i>
                            <span>${member.experience} years experience</span>
                        </div>
                    ` : ''}
                    
                    ${member.bio ? `
                        <div class="member-bio">
                            <p>${member.bio.substring(0, 120)}${member.bio.length > 120 ? '...' : ''}</p>
                        </div>
                    ` : ''}
                    
                    ${member.specializations && member.specializations.length > 0 ? `
                        <div class="professional-member-skills">
                            <div class="skills-header">
                                <i class="fas fa-star"></i>
                                <span>Specializations</span>
                            </div>
                            <div class="skills-tags">
                                ${member.specializations.slice(0, 3).map(skill => 
                                    `<span class="skill-tag professional-skill-tag">${skill}</span>`
                                ).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    ${member.languages && member.languages.length > 0 ? `
                        <div class="professional-member-languages">
                            <div class="skills-header">
                                <i class="fas fa-language"></i>
                                <span>Languages</span>
                            </div>
                            <div class="skills-tags">
                                ${member.languages.slice(0, 2).map(lang => 
                                    `<span class="skill-tag professional-language-tag">${lang}</span>`
                                ).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="professional-member-contact">
                        ${member.email ? `<a href="mailto:${member.email}" class="contact-link email-link" onclick="event.stopPropagation()" title="Email ${member.name}"><i class="fas fa-envelope"></i></a>` : ''}
                        ${member.phone ? `<a href="tel:${member.phone}" class="contact-link phone-link" onclick="event.stopPropagation()" title="Call ${member.name}"><i class="fas fa-phone"></i></a>` : ''}
                        ${member.whatsapp ? `<a href="https://wa.me/${member.whatsapp}" target="_blank" class="contact-link whatsapp-link" onclick="event.stopPropagation()" title="WhatsApp ${member.name}"><i class="fab fa-whatsapp"></i></a>` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    setupFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const filter = button.getAttribute('data-filter');
                
                // Update active button
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Filter team members
                this.filterTeamMembers(filter);
            });
        });
    }

    filterTeamMembers(filter) {
        this.currentFilter = filter;
        const teamCards = document.querySelectorAll('.team-member-card');
        
        teamCards.forEach(card => {
            const department = card.getAttribute('data-department');
            
            if (filter === 'all' || department === filter) {
                card.style.display = 'block';
                card.style.opacity = '0';
                
                setTimeout(() => {
                    card.style.opacity = '1';
                }, 50);
            } else {
                card.style.opacity = '0';
                
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });

        // Update filtered members array
        if (filter === 'all') {
            this.filteredMembers = [...this.teamMembers];
        } else {
            this.filteredMembers = this.teamMembers.filter(member => member.department === filter);
        }
    }

    setupModal() {
        this.modal = document.querySelector('.team-modal');
        const closeBtn = document.querySelector('.close-modal');
        
        // Close modal when clicking close button
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeTeamModal());
        }
        
        // Close modal when clicking outside
        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.closeTeamModal();
                }
            });
        }
        
        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal && this.modal.style.display === 'block') {
                this.closeTeamModal();
            }
        });
    }

    openTeamModal(memberId) {
        const member = this.teamMembers.find(m => m._id === memberId);
        if (!member) return;

        this.currentMember = member;
        this.updateModalContent(member);
        
        if (this.modal) {
            this.modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }

    updateModalContent(member) {
        // Update modal image
        const modalImage = document.getElementById('modal-image');
        if (modalImage) {
            modalImage.src = member.image || 'assets/images/placeholder-team.jpg';
            modalImage.alt = member.name;
        }

        // Update basic info
        const modalName = document.getElementById('modal-name');
        const modalPosition = document.getElementById('modal-position');
        const modalDepartment = document.getElementById('modal-department');
        const modalExperience = document.getElementById('modal-experience');

        if (modalName) modalName.textContent = member.name;
        if (modalPosition) modalPosition.textContent = member.position;
        if (modalDepartment) modalDepartment.textContent = this.formatDepartment(member.department);
        if (modalExperience && member.experience) {
            modalExperience.innerHTML = `<i class="fas fa-briefcase"></i> ${member.experience} years experience`;
        }

        // Update bio
        const modalBio = document.getElementById('modal-bio');
        if (modalBio) {
            modalBio.textContent = member.bio || 'No biography available.';
        }

        // Update qualifications
        this.updateModalSection('modal-qualifications', member.qualifications, 'qualifications-section');

        // Update specializations
        this.updateModalSection('modal-specializations', member.specializations, 'specializations-section');

        // Update languages
        this.updateModalSection('modal-languages', member.languages, 'languages-section');

        // Update contact info
        this.updateModalContact(member);

        // Update social links
        this.updateModalSocial(member);
    }

    updateModalSection(elementId, data, sectionId) {
        const element = document.getElementById(elementId);
        const section = document.getElementById(sectionId);
        
        if (!element || !section) return;

        if (data && data.length > 0) {
            section.style.display = 'block';
            element.innerHTML = data.map(item => `<span class="tag">${item}</span>`).join('');
        } else {
            section.style.display = 'none';
        }
    }

    updateModalContact(member) {
        const contactElement = document.getElementById('modal-contact');
        const contactSection = document.getElementById('modal-contact-section');
        
        if (!contactElement || !contactSection) return;

        const contactInfo = [];
        if (member.email) contactInfo.push(`<a href="mailto:${member.email}"><i class="fas fa-envelope"></i> ${member.email}</a>`);
        if (member.phone) contactInfo.push(`<a href="tel:${member.phone}"><i class="fas fa-phone"></i> ${member.phone}</a>`);
        if (member.whatsapp) contactInfo.push(`<a href="https://wa.me/${member.whatsapp}" target="_blank"><i class="fab fa-whatsapp"></i> WhatsApp</a>`);

        if (contactInfo.length > 0) {
            contactSection.style.display = 'block';
            contactElement.innerHTML = contactInfo.join('');
        } else {
            contactSection.style.display = 'none';
        }
    }

    updateModalSocial(member) {
        const socialElement = document.getElementById('modal-social');
        const socialSection = document.getElementById('modal-social-section');
        
        if (!socialElement || !socialSection) return;

        const socialLinks = [];
        if (member.linkedin) socialLinks.push(`<a href="${member.linkedin}" target="_blank"><i class="fab fa-linkedin"></i></a>`);
        if (member.twitter) socialLinks.push(`<a href="${member.twitter}" target="_blank"><i class="fab fa-twitter"></i></a>`);
        if (member.facebook) socialLinks.push(`<a href="${member.facebook}" target="_blank"><i class="fab fa-facebook"></i></a>`);

        if (socialLinks.length > 0) {
            socialSection.style.display = 'block';
            socialElement.innerHTML = socialLinks.join('');
        } else {
            socialSection.style.display = 'none';
        }
    }

    closeTeamModal() {
        if (this.modal) {
            this.modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
        this.currentMember = null;
    }

    updateTeamStats() {
        const statsContainer = document.getElementById('team-stats');
        if (!statsContainer) return;

        const totalMembers = this.teamMembers.length;
        const departments = [...new Set(this.teamMembers.map(m => m.department))].length;
        const totalExperience = this.teamMembers.reduce((sum, member) => sum + (member.experience || 0), 0);

        const statItems = statsContainer.querySelectorAll('.stat-item');
        if (statItems.length >= 3) {
            statItems[0].querySelector('.stat-number').textContent = `${totalMembers}+`;
            statItems[1].querySelector('.stat-number').textContent = `${totalExperience}+`;
            statItems[2].querySelector('.stat-number').textContent = departments;
        }
    }

    setupMobileMenu() {
        const mobileMenu = document.querySelector('.mobile-menu');
        const navLinks = document.querySelector('.nav-links');
        
        if (mobileMenu && navLinks) {
            mobileMenu.addEventListener('click', function() {
                navLinks.classList.toggle('active');
                this.classList.toggle('active');
            });
        }
    }

    formatDepartment(department) {
        const departmentMap = {
            'management': 'Management',
            'research': 'Research & Development',
            'production': 'Production',
            'quality': 'Quality Control',
            'sales': 'Sales',
            'marketing': 'Marketing',
            'hr': 'Human Resources',
            'finance': 'Finance',
            'it': 'Information Technology'
        };
        
        return departmentMap[department] || department.charAt(0).toUpperCase() + department.slice(1);
    }

    loadFallbackData() {
        console.log('No fallback team data available. Please ensure the API is working properly.');
        
        // Remove static team data - rely entirely on API
        this.teamMembers = [];
        this.filteredMembers = [];
        
        // Show message that no team data is available
        this.showError('No team members found. Please check your connection and try again.');
    }

    showError(message) {
        const teamGrid = document.getElementById('team-grid');
        const managementGrid = document.getElementById('management-grid');
        
        const errorHTML = `
            <div class="error-message" style="text-align: center; padding: 2rem; color: #6c757d;">
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem; color: #dc3545;"></i>
                <p>${message}</p>
                <button onclick="location.reload()" style="background: #28a745; color: white; border: none; padding: 0.5rem 1rem; border-radius: 5px; cursor: pointer;">Retry</button>
            </div>
        `;
        
        if (teamGrid) teamGrid.innerHTML = errorHTML;
        if (managementGrid) managementGrid.innerHTML = errorHTML;
    }
}

// Global functions
function openTeamModal(memberId) {
    if (window.teamPageManager) {
        window.teamPageManager.openTeamModal(memberId);
    }
}

function closeTeamModal() {
    if (window.teamPageManager) {
        window.teamPageManager.closeTeamModal();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
    window.teamPageManager = new TeamPageManager();
    await window.teamPageManager.initialize();
});