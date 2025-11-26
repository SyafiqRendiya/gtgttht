// ==========================================
// SUPABASE CONFIGURATION - PAKAI YANG BARU
// ==========================================
const SUPABASE_URL = 'https://eabhpznktrytcwvrjagu.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhYmhwem5rdHJ5dGN3dnJqYWd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk2MjU2NzcsImV4cCI6MjAyNTIwMTY3N30.UkX4_xKoD8m9_1fJd2M0Nkwo1k1MGAq8uJjC3xJ8J5E';
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
        
        if (error) {
            console.error('Error loading projects:', error);
            throw error;
        }
        
        allProjects = projects || [];
        console.log(`✅ Loaded ${allProjects.length} projects`);
        
        renderProjects(allProjects);
        updateStats(allProjects);
        
    } catch (error) {
        console.error('Error loading projects:', error);
        showEmptyPortfolio();
    }
}

function updateStats(projects) {
    const total = projects.length;
    const youtube = projects.filter(p => p.platform === 'YouTube').length;
    const tiktok = projects.filter(p => p.platform === 'TikTok').length;
    const instagram = projects.filter(p => p.platform === 'Instagram').length;
    
    // Animate counting up
    animateCount('totalProjects', total);
    animateCount('youtubeProjects', youtube);
    animateCount('tiktokProjects', tiktok);
    animateCount('instagramProjects', instagram);
}

function animateCount(elementId, target) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    let current = 0;
    const increment = target / 50; // Adjust speed here
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
    element.setAttribute('data-platform', project.platform);
    
    let actionButton;
    let badgeClass = getBadgeClass(project.platform);
    let actionIcon = getActionIcon(project.platform);
    let actionText = getActionText(project.platform);
    
    // Determine action based on platform
    if (project.platform === 'YouTube' || project.platform === 'TikTok') {
        // For YouTube and TikTok, use video player
        actionButton = `
            <button class="portfolio-link" 
                    onclick="showVideoPlayer('${project.title.replace(/'/g, "\\'")}', '${project.url}', '${project.platform}')"
                    style="background: none; border: none; cursor: pointer; color: var(--primary); font-family: inherit; padding: 0; font-weight: 600; font-size: 0.9rem; display: flex; align-items: center; gap: 5px;">
                <i class="${actionIcon}"></i> ${actionText}
            </button>
        `;
    } else {
        // For other platforms, open in new tab
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
// VIDEO PLAYER FUNCTIONS - FIXED
// ==========================================

function showVideoPlayer(title, url, platform) {
    const modal = document.getElementById('videoPlayerModal');
    const titleElement = document.getElementById('videoPlayerTitle');
    const container = document.querySelector('.video-embed-container');
    
    if (!modal || !titleElement || !container) {
        console.error('Modal video player elements not found');
        window.open(url, '_blank');
        return;
    }
    
    // Reset container
    container.innerHTML = '';
    container.className = 'video-embed-container';
    
    try {
        let embedUrl = '';
        let isVertical = false;

        if (platform === 'YouTube') {
            const videoId = extractYouTubeId(url);
            if (videoId) {
                // Deteksi apakah ini YouTube Shorts
                const isShorts = url.includes('/shorts/');
                isVertical = isShorts;
                
                embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&playsinline=1`;
                
                const iframe = document.createElement('iframe');
                iframe.src = embedUrl;
                iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
                iframe.allowFullscreen = true;
                iframe.setAttribute('playsinline', '1');
                
                container.appendChild(iframe);
                
                if (isShorts) {
                    container.classList.add('is-shorts');
                }
            } else {
                throw new Error('YouTube video ID not found');
            }
            
        } else if (platform === 'TikTok') {
            // Untuk TikTok, kita gunakan embed
            const videoId = extractTikTokVideoId(url);
            if (videoId) {
                embedUrl = `https://www.tiktok.com/embed/v2/${videoId}?autoplay=1`;
                isVertical = true;
                
                const iframe = document.createElement('iframe');
                iframe.src = embedUrl;
                iframe.allow = "autoplay; fullscreen";
                iframe.scrolling = "no";
                iframe.setAttribute('playsinline', '1');
                
                container.appendChild(iframe);
                container.classList.add('is-tiktok');
            } else {
                throw new Error('TikTok video ID not found');
            }
            
        } else {
            // Untuk platform lain, buka di tab baru
            window.open(url, '_blank');
            return;
        }
        
        console.log(`🎬 Playing ${platform} video:`, embedUrl);
        
        // Tampilkan modal
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
        // Fallback: buka di tab baru
        window.open(url, '_blank');
    }
}

function hideVideoPlayer() {
    const modal = document.getElementById('videoPlayerModal');
    const container = document.querySelector('.video-embed-container');
    
    if (!modal || !container) return;
    
    // Hentikan video dengan menghapus iframe
    const iframe = container.querySelector('iframe');
    if (iframe) {
        iframe.src = ''; // Stop video playback
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

// Fungsi untuk extract YouTube ID
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

// Fungsi untuk extract TikTok video ID
function extractTikTokVideoId(url) {
    try {
        // Pattern untuk berbagai format URL TikTok
        const patterns = [
            /tiktok\.com\/@[\w.-]+\/video\/(\d+)/,
            /vt\.tiktok\.com\/(\w+)\//,
            /vm\.tiktok\.com\/(\w+)\//,
            /tiktok\.com\/v\/(\d+)/
        ];
        
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) {
                // Untuk URL dengan video ID eksplisit
                if (match[1]) return match[1];
                // Untuk URL pendek, return match pertama
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
// FILTER FUNCTIONALITY
// ==========================================

function initFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            filterProjects(filter);
        });
    });
}

function filterProjects(platform) {
    if (platform === 'all') {
        renderProjects(allProjects);
    } else {
        const filteredProjects = allProjects.filter(project => 
            project.platform === platform
        );
        renderProjects(filteredProjects);
    }
}

// ==========================================
// MODAL STYLES - ADD TO EXISTING CSS
// ==========================================

function addVideoPlayerStyles() {
    if (document.getElementById('videoPlayerStyles')) return;
    
    const styles = `
        /* Video Player Modal */
        .video-player-modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.95);
            z-index: 9999;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            align-items: center;
            justify-content: center;
        }
        
        .video-player-modal.show {
            opacity: 1;
            visibility: visible;
        }
        
        .video-player-content {
            width: 90%;
            max-width: 900px;
            background: var(--bg-card);
            border-radius: var(--radius);
            overflow: hidden;
            border: 1px solid var(--border);
        }
        
        .video-player-header {
            padding: 20px;
            border-bottom: 1px solid var(--border);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .video-player-title {
            font-size: 1.2rem;
            font-weight: 600;
            color: var(--text-white);
        }
        
        .close-video-btn {
            background: none;
            border: none;
            color: var(--text-gray);
            font-size: 1.5rem;
            cursor: pointer;
            padding: 5px;
            transition: var(--transition);
        }
        
        .close-video-btn:hover {
            color: var(--primary);
        }
        
        .video-embed-container {
            position: relative;
            width: 100%;
            height: 0;
            padding-bottom: 56.25%; /* 16:9 aspect ratio */
        }
        
        .video-embed-container iframe {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border: none;
        }
        
        /* Vertical video styles */
        .video-embed-container.is-shorts {
            padding-bottom: 177.78%; /* 9:16 aspect ratio for Shorts */
            max-width: 360px;
            margin: 0 auto;
        }
        
        .video-embed-container.is-tiktok {
            padding-bottom: 177.78%; /* 9:16 aspect ratio for TikTok */
            max-width: 360px;
            margin: 0 auto;
        }
    `;
    
    const styleElement = document.createElement('style');
    styleElement.id = 'videoPlayerStyles';
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
}

// ==========================================
// VIDEO PLAYER MODAL HTML - ADD TO BODY
// ==========================================

function addVideoPlayerModal() {
    if (document.getElementById('videoPlayerModal')) return;
    
    const modalHTML = `
        <div id="videoPlayerModal" class="video-player-modal">
            <div class="video-player-content">
                <div class="video-player-header">
                    <h3 id="videoPlayerTitle" class="video-player-title">Video Player</h3>
                    <button class="close-video-btn" onclick="hideVideoPlayer()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="video-embed-container" id="videoEmbedContainer">
                    <!-- Video embed will be inserted here -->
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Portfolio Public initialized');
    
    // Add video player styles and modal
    addVideoPlayerStyles();
    addVideoPlayerModal();
    
    // Load projects and init filters
    loadAllProjects();
    initFilters();
    
    // Smooth scrolling for navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

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

// Close video player with ESC key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        hideVideoPlayer();
    }
});

// Close video player when clicking outside
document.addEventListener('click', function(e) {
    if (e.target.id === 'videoPlayerModal') {
        hideVideoPlayer();
    }
});
