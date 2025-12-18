/**
 * Iqbal - Modern Video Editor Portfolio - MAIN SITE
 * COMPLETELY FIXED VERSION
 */

// ==========================================
// SUPABASE CONFIGURATION - SIMPLE VERSION
// ==========================================
let mainSupabase = null;

function getMainSupabase() {
    if (!mainSupabase) {
        const SUPABASE_URL = 'https://bqmsfhnojmmaouaweixi.supabase.co';
        const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxbXNmaG5vam1tYW91YXdlaXhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNjg3ODAsImV4cCI6MjA3OTc0NDc4MH0.SOU9dUdJqWwa4BWW0qgbdIRiZNV8uH2v_654f_Puqa8';
        
        mainSupabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log('✅ Main site Supabase client created');
    }
    return mainSupabase;
}

// ==========================================
// ANIMATIONS & EFFECTS
// ==========================================

function initAnimations() {
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

    document.querySelectorAll('.skill-card, .portfolio-item, .service-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// ==========================================
// PORTFOLIO DISPLAY - ULTIMATE FIX
// ==========================================

async function loadPortfolioProjects() {
    try {
        console.log('🔄 [MAIN] Loading recent projects from database...');
        
        const portfolioGrid = document.getElementById('portfolioGrid');
        if (!portfolioGrid) {
            console.error('Portfolio grid element not found!');
            return;
        }
        
        const client = getMainSupabase();
        if (!client) {
            console.error('Supabase client not available');
            showEmptyState();
            return;
        }
        
        // Try multiple table names
        let projects = [];
        let error = null;
        
        // Try with quotes first
        try {
            const result = await client
                .from('"Portfolio"')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(3);
            
            projects = result.data || [];
            error = result.error;
            
            if (error) {
                // Try without quotes
                const result2 = await client
                    .from('Portfolio')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(3);
                
                projects = result2.data || [];
                error = result2.error;
            }
        } catch (err) {
            console.error('Query error:', err);
            error = err;
        }
        
        portfolioGrid.innerHTML = '';
        
        if (error) {
            console.error('Supabase error:', error);
            showEmptyState();
            return;
        }
        
        if (projects && projects.length > 0) {
            console.log(`✅ [MAIN] Loaded ${projects.length} recent projects`);
            
            projects.forEach(project => {
                const projectElement = createProjectElement(project);
                portfolioGrid.appendChild(projectElement);
            });
        } else {
            console.log('[MAIN] No projects found, showing empty state');
            showEmptyState();
        }
        
    } catch (error) {
        console.error('Error loading portfolio:', error);
        showEmptyState();
    }
}

function createProjectElement(project) {
    const element = document.createElement('div');
    element.className = 'portfolio-item';
    
    // Safe defaults
    const title = project.title || 'Untitled Project';
    const description = project.description || 'No description';
    const imageUrl = project.image_url || 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=225&fit=crop';
    const platform = project.platform || 'Website';
    const platformIcon = project.platform_icon || getDefaultPlatformIcon(platform);
    
    const badgeClass = getBadgeClass(platform);
    const actionButton = createActionButton(project);
    
    element.innerHTML = `
        <div class="portfolio-img">
            <img src="${imageUrl}" alt="${title}" loading="lazy" 
                 onerror="this.src='https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=225&fit=crop'">
            <div class="portfolio-overlay">
                <div class="platform-badge ${badgeClass}">
                    <i class="${platformIcon}"></i>
                </div>
            </div>
        </div>
        
        <div class="portfolio-content">
            <h3>${title}</h3>
            <p>${description}</p>
            <div class="portfolio-meta">
                ${actionButton}
                <span class="portfolio-date">${formatDate(project.created_at)}</span>
            </div>
        </div>
    `;
    return element;
}

function getDefaultPlatformIcon(platform) {
    const icons = {
        'YouTube': 'fab fa-youtube',
        'TikTok': 'fab fa-tiktok',
        'Instagram': 'fab fa-instagram',
        'Facebook': 'fab fa-facebook',
        'Twitter': 'fab fa-twitter',
        'X': 'fab fa-x-twitter'
    };
    return icons[platform] || 'fas fa-globe';
}

function createActionButton(project) {
    const platform = project.platform || 'Website';
    const url = project.url || '#';
    
    if (platform === 'YouTube' || platform === 'TikTok') {
        const buttonText = platform === 'YouTube' ? 'Watch Video' : 'Watch TikTok';
        const buttonIcon = platform === 'YouTube' ? 'fa-play-circle' : 'fa-music';
        
        return `
            <a href="${url}" target="_blank" class="portfolio-link">
                <i class="fas ${buttonIcon}"></i> ${buttonText}
            </a>
        `;
    } else {
        return `
            <a href="${url}" target="_blank" class="portfolio-link">
                <i class="${project.platform_icon || getDefaultPlatformIcon(platform)}"></i> View on ${platform}
            </a>
        `;
    }
}

function getBadgeClass(platform) {
    const classes = {
        'YouTube': 'youtube-badge',
        'TikTok': 'tiktok-badge',
        'Instagram': 'instagram-badge',
        'Facebook': 'facebook-badge',
        'Twitter': 'twitter-badge',
        'X': 'twitter-badge'
    };
    return classes[platform] || 'website-badge';
}

function formatDate(dateString) {
    try {
        if (!dateString) return 'Recent';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (e) {
        return 'Recent';
    }
}

function showEmptyState() {
    const portfolioGrid = document.getElementById('portfolioGrid');
    if (portfolioGrid) {
        portfolioGrid.innerHTML = `
            <div class="empty-portfolio">
                <i class="fas fa-film"></i>
                <h3>Belum Ada Project</h3>
                <p>Project akan muncul di sini setelah ditambahkan melalui admin panel</p>
            </div>
        `;
    }
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
    console.log('🚀 Main site initialized');
    
    // Wait for Supabase to load
    setTimeout(() => {
        initAnimations();
        initSmoothScroll();
        initNavbarScroll();
        loadPortfolioProjects();
    }, 800);
});

// Refresh portfolio when page becomes visible
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        setTimeout(loadPortfolioProjects, 300);
    }
});

// Helper functions
function getPlatformFromUrl(url) {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube';
    if (url.includes('tiktok.com')) return 'TikTok';
    if (url.includes('instagram.com')) return 'Instagram';
    if (url.includes('facebook.com')) return 'Facebook';
    if (url.includes('x.com') || url.includes('twitter.com')) return 'X';
    return 'Website';
}

