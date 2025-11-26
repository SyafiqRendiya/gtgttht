/**
 * Iqbal - Modern Video Editor Portfolio
 * Clean & Modern Version
 */

// ==========================================
// SUPABASE CONFIGURATION
// ==========================================
const SUPABASE_URL = 'https://bqmsfhnojmmaouaweixi.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxbXNmaG5vam1tYW91YXdlaXhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNjg3ODAsImV4cCI6MjA3OTc0NDc4MH0.SOU9dUdJqWwa4BWW0qgbdIRiZNV8uH2v_654f_Puqa8';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

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
// PORTFOLIO DISPLAY - DIPERBAIKI
// ==========================================

// Load projects from database - HANYA 3 PROJECT TERBARU
async function loadPortfolioProjects() {
    try {
        console.log('🔄 Loading recent projects from database...');
        
        const portfolioGrid = document.getElementById('portfolioGrid');
        if (!portfolioGrid) {
            console.error('Portfolio grid element not found!');
            return;
        }
        
        const { data: projects, error } = await supabase
            .from('Portfolio')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(3); // HANYA AMBIL 3 PROJECT TERBARU
        
        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }
        
        portfolioGrid.innerHTML = '';
        
        if (projects && projects.length > 0) {
            console.log(`✅ Loaded ${projects.length} recent projects`);
            
            projects.forEach(project => {
                const projectElement = createProjectElement(project);
                portfolioGrid.appendChild(projectElement);
            });
        } else {
            console.log('No projects found, showing empty state');
            showEmptyState();
        }
        
    } catch (error) {
        console.error('Error loading portfolio:', error);
        showEmptyState();
    }
}

// Create project HTML element - DIPERBAIKI
function createProjectElement(project) {
    const element = document.createElement('div');
    element.className = 'portfolio-item';
    
    const badgeClass = getBadgeClass(project.platform);
    const actionButton = createActionButton(project);
    
    element.innerHTML = `
        <div class="portfolio-img">
            <img src="${project.image_url}" alt="${project.title}" loading="lazy" 
                 onerror="this.src='https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=225&fit=crop'">
            <div class="portfolio-overlay">
                <div class="platform-badge ${badgeClass}">
                    <i class="${project.platform_icon}"></i>
                </div>
            </div>
        </div>
        
        <div class="portfolio-content">
            <h3>${project.title}</h3>
            <p>${project.description}</p>
            <div class="portfolio-meta">
                ${actionButton}
                <span class="portfolio-date">${formatDate(project.created_at)}</span>
            </div>
        </div>
    `;
    return element;
}

// Buat action button berdasarkan platform
function createActionButton(project) {
    if (project.platform === 'YouTube' || project.platform === 'TikTok') {
        const buttonText = project.platform === 'YouTube' ? 'Watch Video' : 'Watch TikTok';
        const buttonIcon = project.platform === 'YouTube' ? 'fa-play-circle' : 'fa-music';
        
        return `
            <a href="${project.url}" target="_blank" class="portfolio-link">
                <i class="fas ${buttonIcon}"></i> ${buttonText}
            </a>
        `;
    } else {
        return `
            <a href="${project.url}" target="_blank" class="portfolio-link">
                <i class="${project.platform_icon}"></i> View on ${project.platform}
            </a>
        `;
    }
}

// Helper functions
function getBadgeClass(platform) {
    const classes = {
        'YouTube': 'youtube-badge',
        'TikTok': 'tiktok-badge',
        'Instagram': 'instagram-badge',
        'Facebook': 'facebook-badge',
        'Twitter': 'twitter-badge'
    };
    return classes[platform] || 'website-badge';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Show empty state
function showEmptyState() {
    const portfolioGrid = document.getElementById('portfolioGrid');
    portfolioGrid.innerHTML = `
        <div class="empty-portfolio">
            <i class="fas fa-film"></i>
            <h3>Belum Ada Project</h3>
            <p>Project akan muncul di sini setelah ditambahkan melalui admin panel</p>
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
// NAVBAR SCROLL EFFECT
// ==========================================

function initNavbarScroll() {
    window.addEventListener('scroll', function() {
        const header = document.querySelector('.site-header');
        if (header) {
            if (window.scrollY > 100) {
                header.style.background = 'rgba(15, 15, 15, 0.98)';
            } else {
                header.style.background = 'rgba(15, 15, 15, 0.95)';
            }
        }
    });
}

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Iqbal Portfolio initialized');
    
    initAnimations();
    initSmoothScroll();
    initNavbarScroll();
    loadPortfolioProjects();
});

// Refresh portfolio when page becomes visible
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        loadPortfolioProjects();
    }
});
