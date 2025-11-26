/**
 * Portfolio Manager - Public Version
 * Hanya bisa melihat project, TIDAK BISA edit/hapus
 */

// ==========================================
// SUPABASE CONFIGURATION - FIXED
// ==========================================
const SUPABASE_URL = 'https://bqmsfhnojmmaouaweixi.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxbXNmaG5vam1tYW91YXdlaXhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNjg3ODAsImV4cCI6MjA3OTc0NDc4MH0.SOU9dUdJqWwa4BWW0qgbdIRiZNV8uH2v_654f_Puqa8';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ==========================================
// GLOBAL VARIABLES
// ==========================================
let allProjects = [];

// ==========================================
// PORTFOLIO FUNCTIONS - PUBLIC VIEW
// ==========================================

async function loadAllProjects() {
    try {
        console.log('🔄 Loading projects from database...');
        
        const { data: projects, error } = await supabase
            .from('Portfolio')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        allProjects = projects || [];
        console.log(`✅ Loaded ${allProjects.length} projects`);
        
        renderProjects(allProjects);
        updateStats(allProjects);
        
    } catch (error) {
        console.error('Error loading projects:', error);
        showEmptyPortfolio();
    }
}

// FUNCTION REFRESH BARU DITAMBAHIN
async function refreshPortfolio() {
    const btn = document.querySelector('.refresh-btn');
    if (btn) {
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        btn.disabled = true;
    }
    
    await loadAllProjects();
    
    setTimeout(() => {
        if (btn) {
            btn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
            btn.disabled = false;
        }
    }, 1000);
}

function updateStats(projects) {
    const total = projects.length;
    
    // HANYA update total projects
    animateCount('totalProjects', total);
}

function animateCount(elementId, target) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 30);
}

function renderProjects(projects) {
    const portfolioGrid = document.getElementById('portfolioGrid');
    
    if (!portfolioGrid) {
        console.error('Portfolio grid element not found!');
        return;
    }
    
    if (projects.length === 0) {
        showEmptyPortfolio();
        return;
    }
    
    portfolioGrid.innerHTML = '';
    
    projects.forEach(project => {
        const projectElement = createProjectElement(project);
        portfolioGrid.appendChild(projectElement);
    });
}

function createProjectElement(project) {
    const element = document.createElement('div');
    element.className = 'portfolio-item';
    
    let actionButton;
    let badgeClass = getBadgeClass(project.platform);
    let actionIcon = getActionIcon(project.platform);
    let actionText = getActionText(project.platform);
    
    // Determine action based on platform
    if (project.platform === 'YouTube' || project.platform === 'TikTok') {
        actionButton = `
            <button class="portfolio-link" 
                    onclick="showVideoPlayer('${project.title.replace(/'/g, "\\'")}', '${project.url}', '${project.platform}')"
                    style="background: none; border: none; cursor: pointer; color: var(--primary); font-family: inherit; padding: 0; font-weight: 600; font-size: 0.9rem; display: flex; align-items: center; gap: 5px;">
                <i class="${actionIcon}"></i> ${actionText}
            </button>
        `;
    } else {
        actionButton = `
            <a href="${project.url}" target="_blank" class="portfolio-link">
                <i class="${actionIcon}"></i> ${actionText}
            </a>
        `;
    }
    
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

function getBadgeClass(platform) {
    const badgeClasses = {
        'YouTube': 'youtube-badge',
        'TikTok': 'tiktok-badge',
        'Instagram': 'instagram-badge',
        'Facebook': 'facebook-badge',
        'Twitter': 'twitter-badge'
    };
    return badgeClasses[platform] || 'website-badge';
}

function getActionIcon(platform) {
    const actionIcons = {
        'YouTube': 'fas fa-play-circle',
        'TikTok': 'fas fa-music',
        'Instagram': 'fas fa-camera',
        'Facebook': 'fab fa-facebook',
        'Twitter': 'fab fa-twitter'
    };
    return actionIcons[platform] || 'fas fa-external-link-alt';
}

function getActionText(platform) {
    const actionTexts = {
        'YouTube': 'Watch Video',
        'TikTok': 'Watch TikTok',
        'Instagram': 'View Post',
        'Facebook': 'View Post',
        'Twitter': 'View Tweet'
    };
    return actionTexts[platform] || 'View Content';
}

function showEmptyPortfolio() {
    const portfolioGrid = document.getElementById('portfolioGrid');
    if (!portfolioGrid) return;
    
    portfolioGrid.innerHTML = `
        <div class="empty-portfolio">
            <i class="fas fa-film"></i>
            <h3>Belum Ada Project</h3>
            <p>Project akan muncul di sini setelah ditambahkan melalui admin panel</p>
        </div>
    `;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// ==========================================
// VIDEO PLAYER FUNCTIONS - DIPERBAIKI
// ==========================================

function showVideoPlayer(title, url, platform) {
    const modal = document.getElementById('videoPlayerModal');
    const titleElement = document.getElementById('videoPlayerTitle');
    const container = document.getElementById('videoEmbedContainer');
    
    if (!modal || !titleElement || !container) {
        console.error('Modal video player elements not found');
        window.open(url, '_blank');
        return;
    }
    
    container.innerHTML = '';
    container.className = 'video-embed-container';
    
    try {
        let embedUrl = '';
        let isVertical = false;

        if (platform === 'YouTube') {
            const videoId = extractYouTubeId(url);
            if (videoId) {
                const isShorts = url.includes('/shorts/');
                embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&playsinline=1`;
                
                const iframe = document.createElement('iframe');
                iframe.src = embedUrl;
                iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
                iframe.allowFullscreen = true;
                iframe.setAttribute('playsinline', '1');
                
                container.appendChild(iframe);
                
                if (isShorts) {
                    isVertical = true;
                    container.classList.add('is-vertical');
                } else {
                    container.classList.add('is-landscape');
                }
            } else {
                throw new Error('YouTube video ID not found');
            }
            
        } else if (platform === 'TikTok') {
            const videoId = extractTikTokVideoId(url);
            if (videoId) {
                embedUrl = `https://www.tiktok.com/embed/v2/${videoId}?autoplay=1`;
                
                const iframe = document.createElement('iframe');
                iframe.src = embedUrl;
                iframe.allow = "autoplay; fullscreen";
                iframe.scrolling = "no";
                iframe.setAttribute('playsinline', '1');
                
                container.appendChild(iframe);
                
                isVertical = true;
                container.classList.add('is-vertical');
            } else {
                throw new Error('TikTok video ID not found');
            }
            
        } else {
            window.open(url, '_blank');
            return;
        }
        
        console.log(`🎬 Playing ${platform} video:`, embedUrl);
        
        titleElement.textContent = title;
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        setTimeout(() => {
            modal.style.opacity = '1';
            modal.style.visibility = 'visible';
            modal.classList.add('show');
        }, 10);
        
    } catch (error) {
        console.error('Error showing video:', error);
        window.open(url, '_blank');
    }
}

function hideVideoPlayer() {
    const modal = document.getElementById('videoPlayerModal');
    const container = document.getElementById('videoEmbedContainer');
    
    if (!modal || !container) return;
    
    const iframe = container.querySelector('iframe');
    if (iframe) {
        iframe.src = '';
    }
    container.innerHTML = '';
    container.className = 'video-embed-container';
    
    modal.style.opacity = '0';
    modal.style.visibility = 'hidden';
    modal.classList.remove('show');
    
    setTimeout(() => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }, 300);
}

function extractYouTubeId(url) {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?#]+)/,
        /youtube\.com\/embed\/([^&?#]+)/,
        /youtube\.com\/v\/([^&?#]+)/,
        /youtube\.com\/shorts\/([^&?#]+)/
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

function extractTikTokVideoId(url) {
    try {
        const patterns = [
            /tiktok\.com\/@[\w.-]+\/video\/(\d+)/,
            /vt\.tiktok\.com\/(\w+)\//,
            /vm\.tiktok\.com\/(\w+)\//,
            /tiktok\.com\/v\/(\d+)/
        ];
        
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) {
                if (match[1]) return match[1];
                return match[0].split('/').pop();
            }
        }
        return null;
    } catch (error) {
        console.log('Error extracting TikTok ID:', error);
        return null;
    }
}

// ==========================================
// EVENT LISTENERS
// ==========================================

// Close modals when clicking outside
document.addEventListener('click', function(e) {
    if (e.target.id === 'videoPlayerModal') hideVideoPlayer();
});

// Close modals with ESC key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        hideVideoPlayer();
    }
});

// ==========================================
// INITIALIZATION
// ==========================================

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Portfolio Public initialized');
    loadAllProjects();
    
    // Navbar scroll effect
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
});
