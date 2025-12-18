/**
 * Portfolio Manager - Public Version dengan Folder Grouping
 * FIXED VERSION - Compatible dengan main site
 */

// ==========================================
// SUPABASE CONFIGURATION - FIXED: SHARE INSTANCE
// ==========================================
let portfolioSupabase = null;

function getPortfolioSupabase() {
    if (!portfolioSupabase) {
        const SUPABASE_URL = 'https://bqmsfhnojmmaouaweixi.supabase.co';
        const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxbXNmaG5vam1tYW91YXdlaXhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNjg3ODAsImV4cCI6MjA3OTc0NDc4MH0.SOU9dUdJqWwa4BWW0qgbdIRiZNV8uH2v_654f_Puqa8';
        
        // Cek apakah sudah ada instance dari main site
        if (window._supabaseClient) {
            portfolioSupabase = window._supabaseClient;
            console.log('✅ Using shared Supabase client from main site');
        } else if (typeof supabase !== 'undefined' && supabase.createClient) {
            // Buat instance baru jika tidak ada
            portfolioSupabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            console.log('✅ Created new Supabase client for portfolio');
        } else {
            console.error('❌ Supabase library not loaded');
            return null;
        }
    }
    return portfolioSupabase;
}

// Folder definitions
const PROJECT_FOLDERS = [
    { 
        name: 'Motion Graphics', 
        icon: 'fas fa-film',
        description: 'Animasi dan motion graphics projects'
    },
    { 
        name: 'Long Video', 
        icon: 'fas fa-video',
        description: 'Video panjang lebih dari 5 menit'
    },
    { 
        name: 'Short Video', 
        icon: 'fas fa-clapperboard',
        description: 'Video pendek dan konten sosial media'
    },
    { 
        name: 'Timeline Preview', 
        icon: 'fas fa-play-circle',
        description: 'Preview dan rough cut videos'
    }
];

// Global variables
let allProjects = [];
const folderStates = {};

// ==========================================
// PORTFOLIO FUNCTIONS - FIXED
// ==========================================

async function loadAllProjects() {
    try {
        console.log('🔄 Loading projects from database...');
        
        const supabase = getPortfolioSupabase();
        if (!supabase) {
            console.error('Supabase not initialized');
            showConnectionError();
            return;
        }
        
        const { data: projects, error } = await supabase
            .from('Portfolio')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Database error:', error);
            if (error.code === '42P01') {
                showTableError();
            } else {
                showError('Database error: ' + error.message);
            }
            return;
        }
        
        allProjects = projects || [];
        console.log(`✅ Loaded ${allProjects.length} projects`);
        
        renderFolderProjects(allProjects);
        updateStats(allProjects);
        
    } catch (error) {
        console.error('Error loading projects:', error);
        showError('Failed to load projects');
    }
}

// REFRESH FUNCTION - FIXED
async function refreshPortfolio() {
    console.log('🔄 Refreshing portfolio...');
    const btn = document.querySelector('.refresh-btn');
    const originalHTML = btn ? btn.innerHTML : null;
    
    if (btn) {
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        btn.disabled = true;
    }
    
    try {
        await loadAllProjects();
    } finally {
        if (btn) {
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.disabled = false;
            }, 500);
        }
    }
}

function showConnectionError() {
    const folderSections = document.getElementById('folderSections');
    if (folderSections) {
        folderSections.innerHTML = `
            <div class="empty-portfolio">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Database Connection Error</h3>
                <p>Unable to connect to database. Please check your connection.</p>
                <button onclick="refreshPortfolio()" style="margin-top: 20px; padding: 10px 20px; background: var(--primary); color: white; border: none; border-radius: 6px; cursor: pointer;">
                    Try Again
                </button>
            </div>
        `;
    }
}

function showTableError() {
    const folderSections = document.getElementById('folderSections');
    if (folderSections) {
        folderSections.innerHTML = `
            <div class="empty-portfolio">
                <i class="fas fa-database"></i>
                <h3>Table Not Found</h3>
                <p>The "Portfolio" table does not exist in the database.</p>
                <p style="color: var(--text-gray); font-size: 0.9rem; margin-top: 10px;">
                    Please create the table in Supabase dashboard.
                </p>
            </div>
        `;
    }
}

function showError(message) {
    const folderSections = document.getElementById('folderSections');
    if (folderSections) {
        folderSections.innerHTML = `
            <div class="empty-portfolio">
                <i class="fas fa-exclamation-circle"></i>
                <h3>Error</h3>
                <p>${message}</p>
            </div>
        `;
    }
}

function updateStats(projects) {
    const total = projects.length;
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

function renderFolderProjects(projects) {
    const folderSections = document.getElementById('folderSections');
    if (!folderSections) return;
    
    if (projects.length === 0) {
        showEmptyPortfolio();
        return;
    }
    
    folderSections.innerHTML = '';
    
    // Group projects by folder
    const projectsByFolder = groupProjectsByFolder(projects);
    
    // Create sections for each folder
    PROJECT_FOLDERS.forEach(folder => {
        const folderProjects = projectsByFolder[folder.name] || [];
        const folderSection = createFolderSection(folder, folderProjects);
        folderSections.appendChild(folderSection);
    });
}

function groupProjectsByFolder(projects) {
    const grouped = {};
    
    projects.forEach(project => {
        const folderName = project.folder || 'Uncategorized';
        if (!grouped[folderName]) {
            grouped[folderName] = [];
        }
        grouped[folderName].push(project);
    });
    
    return grouped;
}

function createFolderSection(folder, projects) {
    const section = document.createElement('div');
    section.className = 'folder-section';
    section.id = `folder-${folder.name.replace(/\s+/g, '-').toLowerCase()}`;
    
    const isExpanded = folderStates[folder.name] || false;
    
    // Tampilkan 12 project pertama ketika collapsed, semua ketika expanded
    const visibleProjects = isExpanded ? projects : projects.slice(0, 12);
    const hasMoreProjects = projects.length > 12;
    
    section.innerHTML = `
        <div class="folder-header">
            <div class="folder-icon">
                <i class="${folder.icon}"></i>
            </div>
            <h2 class="folder-title">${folder.name}</h2>
            <div class="folder-count">${projects.length} Projects</div>
        </div>
        
        ${projects.length > 0 ? `
            <div class="portfolio-grid ${!isExpanded && hasMoreProjects ? 'collapsed' : ''}">
                ${visibleProjects.map(project => createProjectElement(project)).join('')}
            </div>
            
            ${hasMoreProjects ? `
                <div class="show-more-container">
                    <button class="show-more-btn" onclick="toggleFolder('${folder.name}')">
                        <i class="fas fa-${isExpanded ? 'eye-slash' : 'eye'}"></i>
                        ${isExpanded ? 'Show Less' : `Show All Projects (${projects.length})`}
                    </button>
                </div>
            ` : ''}
        ` : `
            <div class="empty-folder">
                <i class="fas fa-video-slash"></i>
                <h3>Belum Ada Project</h3>
                <p>Project di folder ${folder.name} akan muncul di sini</p>
            </div>
        `}
    `;
    
    return section;
}

function toggleFolder(folderName) {
    console.log('🔧 Toggle folder:', folderName);
    
    // Toggle folder state
    folderStates[folderName] = !folderStates[folderName];
    
    // Dapatkan projects untuk folder ini
    const projectsByFolder = groupProjectsByFolder(allProjects);
    const folderProjects = projectsByFolder[folderName] || [];
    
    console.log(`📁 Projects for ${folderName}:`, folderProjects.length);
    
    // Update folder section
    const folderSection = document.getElementById(`folder-${folderName.replace(/\s+/g, '-').toLowerCase()}`);
    if (folderSection) {
        const newSection = createFolderSection(
            PROJECT_FOLDERS.find(f => f.name === folderName),
            folderProjects
        );
        folderSection.parentNode.replaceChild(newSection, folderSection);
        
        // Scroll ke folder setelah update
        setTimeout(() => {
            newSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    }
}

function createProjectElement(project) {
    const badgeClass = getBadgeClass(project.platform);
    const actionButton = createActionButton(project);
    
    return `
        <div class="portfolio-item">
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
        </div>
    `;
}

function createActionButton(project) {
    if (project.platform === 'YouTube' || project.platform === 'TikTok') {
        const buttonText = project.platform === 'YouTube' ? 'Watch Video' : 'Watch TikTok';
        const buttonIcon = project.platform === 'YouTube' ? 'fa-play-circle' : 'fa-music';
        
        return `
            <button class="portfolio-link" 
                    onclick="showVideoPlayer('${project.title.replace(/'/g, "\\'")}', '${project.url}', '${project.platform}')"
                    style="background: none; border: none; cursor: pointer; color: var(--primary); font-family: inherit; padding: 0; font-weight: 600; font-size: 0.9rem; display: flex; align-items: center; gap: 5px;">
                <i class="fas ${buttonIcon}"></i> ${buttonText}
            </button>
        `;
    } else {
        return `
            <a href="${project.url}" target="_blank" class="portfolio-link">
                <i class="${project.platform_icon}"></i> View on ${project.platform}
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
        'Twitter': 'twitter-badge'
    };
    return classes[platform] || 'website-badge';
}

function showEmptyPortfolio() {
    const folderSections = document.getElementById('folderSections');
    if (folderSections) {
        folderSections.innerHTML = `
            <div class="empty-portfolio">
                <i class="fas fa-film"></i>
                <h3>Belum Ada Project</h3>
                <p>Project akan muncul di sini setelah ditambahkan melalui admin panel</p>
            </div>
        `;
    }
}

function formatDate(dateString) {
    try {
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

// ==========================================
// VIDEO PLAYER FUNCTIONS
// ==========================================

function showVideoPlayer(title, url, platform) {
    const modal = document.getElementById('videoPlayerModal');
    const titleElement = document.getElementById('videoPlayerTitle');
    const container = document.getElementById('videoEmbedContainer');
    
    if (!modal || !titleElement || !container) {
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
    console.log('🚀 Portfolio Public dengan Folder Grouping initialized');
    
    // Tunggu Supabase library load
    setTimeout(() => {
        loadAllProjects();
    }, 800);
    
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

// Make functions available globally
window.refreshPortfolio = refreshPortfolio;
window.toggleFolder = toggleFolder;
window.showVideoPlayer = showVideoPlayer;
window.hideVideoPlayer = hideVideoPlayer;
