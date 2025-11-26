/**
 * Iqbal - Modern Video Editor Portfolio
 * Clean & Modern Version
 */

// ==========================================
// ANIMATIONS & EFFECTS
// ==========================================

// Initialize animations
function initAnimations() {
    // Add intersection observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe all cards and sections
    document.querySelectorAll('.skill-card, .portfolio-item, .service-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// ==========================================
// PORTFOLIO DISPLAY
// ==========================================

// Load projects from database
async function loadPortfolioProjects() {
    try {
        const portfolioGrid = document.getElementById('portfolioGrid');
        if (!portfolioGrid) return;
        
        const { data: projects, error } = await supabase
            .from('Portfolio')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(6);
        
        if (error) throw error;
        
        portfolioGrid.innerHTML = '';
        
        if (projects && projects.length > 0) {
            projects.forEach(project => {
                const projectElement = createProjectElement(project);
                portfolioGrid.appendChild(projectElement);
            });
        } else {
            showEmptyState();
        }
        
    } catch (error) {
        console.error('Error loading portfolio:', error);
        showEmptyState();
    }
}

// Create project HTML element
function createProjectElement(project) {
    const element = document.createElement('div');
    element.className = 'portfolio-item';
    element.innerHTML = `
        <div class="platform-badge">
            <i class="${project.platform_icon}"></i>
        </div>
        
        <div class="portfolio-img">
            <img src="${project.image_url}" alt="${project.title}" loading="lazy" 
                 onerror="this.src='https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=225&fit=crop'">
        </div>
        
        <div class="portfolio-content">
            <h3>${project.title}</h3>
            <p>${project.description}</p>
            <a href="${project.url}" target="_blank" class="portfolio-link">
                <i class="${project.platform_icon}"></i> Watch on ${project.platform}
            </a>
        </div>
    `;
    return element;
}

// Show empty state
function showEmptyState() {
    const portfolioGrid = document.getElementById('portfolioGrid');
    portfolioGrid.innerHTML = `
        <div class="portfolio-item" style="text-align: center; padding: var(--space-xxl); grid-column: 1 / -1;">
            <i class="fas fa-film" style="font-size: 3rem; margin-bottom: var(--space-md); opacity: 0.5; color: var(--accent-primary);"></i>
            <h3 style="margin-bottom: var(--space-sm);">More Projects Coming Soon!</h3>
            <p style="color: var(--text-secondary);">I'm currently working on some amazing projects. Stay tuned!</p>
        </div>
    `;
}

// ==========================================
// SMOOTH SCROLLING
// ==========================================

function initSmoothScroll() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 100;
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    initAnimations();
    initSmoothScroll();
    loadPortfolioProjects();
    
    console.log('🎬 Iqbal Portfolio loaded successfully!');
});

// Refresh portfolio when page becomes visible
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        loadPortfolioProjects();
    }
});