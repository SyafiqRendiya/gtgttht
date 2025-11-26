/**
 * Vexernoss Portfolio Manager
 * Advanced Version with Real Thumbnails & Video Player
 */

// ==========================================
// SUPABASE CONFIGURATION
// ==========================================
const SUPABASE_URL = 'https://eabhpznktrytcwvrjagu.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhYmhwem5rdHJ5dGN3dnJqYWd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk2MjU2NzcsImV4cCI6MjAyNTIwMTY3N30.UkX4_xKoD8m9_1fJd2M0Nkwo1k1MGAq8uJjC3xJ8J5E';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ==========================================
// GLOBAL VARIABLES
// ==========================================
let currentEditingId = null;

// ==========================================
// MODAL MANAGEMENT
// ==========================================

function showAddForm() {
    const modal = document.getElementById('addProjectModal');
    if (!modal) return;
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    setTimeout(() => {
        modal.style.opacity = '1';
        modal.style.visibility = 'visible';
    }, 10);
}

function hideAddForm() {
    const modal = document.getElementById('addProjectModal');
    if (!modal) return;
    
    modal.style.opacity = '0';
    modal.style.visibility = 'hidden';
    
    setTimeout(() => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        resetForm();
    }, 300);
}

function showEditForm(project) {
    currentEditingId = project.id;
    
    document.getElementById('editProjectId').value = project.id;
    document.getElementById('editProjectTitle').value = project.title;
    document.getElementById('editProjectDescription').value = project.description;
    document.getElementById('editProjectUrl').value = project.url;
    
    const modal = document.getElementById('editProjectModal');
    if (!modal) return;
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    setTimeout(() => {
        modal.style.opacity = '1';
        modal.style.visibility = 'visible';
    }, 10);
}

function hideEditForm() {
    const modal = document.getElementById('editProjectModal');
    if (!modal) return;
    
    modal.style.opacity = '0';
    modal.style.visibility = 'hidden';
    
    setTimeout(() => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        currentEditingId = null;
    }, 300);
}

function resetForm() {
    const titleInput = document.getElementById('projectTitle');
    const descInput = document.getElementById('projectDescription');
    const urlInput = document.getElementById('projectUrl');
    
    if (titleInput) titleInput.value = '';
    if (descInput) descInput.value = '';
    if (urlInput) urlInput.value = '';
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
// REAL THUMBNAIL FUNCTIONS
// ==========================================

// TikTok Thumbnail - Using oEmbed
async function getTikTokThumbnail(url) {
    try {
        const response = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`);
        const data = await response.json();
        return data.thumbnail_url || null;
    } catch (error) {
        console.log('TikTok thumbnail failed, using default');
        return 'https://images.unsplash.com/photo-1611605698335-8b1569810432?w=400&h=500&fit=crop';
    }
}

// Instagram Thumbnail - Using Microlink API
async function getInstagramThumbnail(url) {
    try {
        const response = await fetch(`https://api.microlink.io?url=${encodeURIComponent(url)}`);
        const data = await response.json();
        return data.data?.image?.url || null;
    } catch (error) {
        console.log('Instagram thumbnail failed, using default');
        return 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=500&fit=crop';
    }
}

// Facebook Thumbnail - Basic fallback
async function getFacebookThumbnail(url) {
    return 'https://images.unsplash.com/photo-1633675254053-d96c7668c3b8?w=400&h=300&fit=crop';
}

// Twitter Thumbnail - Basic fallback  
async function getTwitterThumbnail(url) {
    return 'https://images.unsplash.com/photo-1611605698335-8b1569810432?w=400&h=300&fit=crop';
}

// Extract YouTube ID from URL
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

// Detect platform and get REAL thumbnail
async function detectPlatform(url) {
    // YouTube - REAL Thumbnail
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const videoId = extractYouTubeId(url);
        return {
            name: 'YouTube',
            icon: 'fab fa-youtube',
            thumbnail: videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=225&fit=crop'
        };
    }
    
    // Instagram - REAL Thumbnail
    if (url.includes('instagram.com') || url.includes('instagr.am')) {
        const thumbnail = await getInstagramThumbnail(url);
        return {
            name: 'Instagram',
            icon: 'fab fa-instagram',
            thumbnail: thumbnail
        };
    }
    
    // TikTok - REAL Thumbnail
    if (url.includes('tiktok.com')) {
        const thumbnail = await getTikTokThumbnail(url);
        return {
            name: 'TikTok',
            icon: 'fab fa-tiktok',
            thumbnail: thumbnail
        };
    }
    
    // Facebook
    if (url.includes('facebook.com') || url.includes('fb.com')) {
        const thumbnail = await getFacebookThumbnail(url);
        return {
            name: 'Facebook',
            icon: 'fab fa-facebook',
            thumbnail: thumbnail
        };
    }
    
    // Twitter
    if (url.includes('twitter.com') || url.includes('x.com')) {
        const thumbnail = await getTwitterThumbnail(url);
        return {
            name: 'Twitter',
            icon: 'fab fa-twitter',
            thumbnail: thumbnail
        };
    }
    
    // Default/Unknown
    return {
        name: 'Website',
        icon: 'fas fa-globe',
        thumbnail: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=225&fit=crop'
    };
}

// ==========================================
// SUPABASE CRUD OPERATIONS
// ==========================================

// Save project to database with REAL thumbnails
async function saveProject() {
    const title = document.getElementById('projectTitle')?.value.trim();
    const description = document.getElementById('projectDescription')?.value.trim();
    const url = document.getElementById('projectUrl')?.value.trim();
    
    // Validation
    if (!title || !description || !url) {
        alert('Harap isi semua field!');
        return;
    }
    
    const saveBtn = document.getElementById('saveBtn');
    const originalText = saveBtn.innerHTML;
    
    // Show loading state
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengambil Thumbnail...';
    saveBtn.disabled = true;
    
    try {
        // Detect platform and get REAL thumbnail
        const platformInfo = await detectPlatform(url);
        let imageUrl = platformInfo.thumbnail;
        
        console.log('🖼️ Thumbnail URL:', imageUrl);
        
        // Save to Supabase
        const { data, error } = await supabase
            .from('Portfolio')
            .insert([
                { 
                    title: title,
                    description: description, 
                    url: url,
                    image_url: imageUrl,
                    platform: platformInfo.name,
                    platform_icon: platformInfo.icon,
                    created_at: new Date().toISOString()
                }
            ]);
        
        if (error) throw error;
        
        // Success
        hideAddForm();
        alert(`✅ Project berhasil ditambahkan dari ${platformInfo.name}!`);
        loadPortfolioProjects();
        
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Gagal menambah project: ' + error.message);
    } finally {
        // Reset button state
        saveBtn.innerHTML = originalText;
        saveBtn.disabled = false;
    }
}

// Update project
async function updateProject() {
    const id = document.getElementById('editProjectId')?.value;
    const title = document.getElementById('editProjectTitle')?.value.trim();
    const description = document.getElementById('editProjectDescription')?.value.trim();
    const url = document.getElementById('editProjectUrl')?.value.trim();
    
    if (!title || !description || !url) {
        alert('Harap isi semua field!');
        return;
    }
    
    const updateBtn = document.getElementById('updateBtn');
    const originalText = updateBtn.innerHTML;
    
    updateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
    updateBtn.disabled = true;
    
    try {
        // Get new platform info if URL changed
        const platformInfo = await detectPlatform(url);
        
        const { data, error } = await supabase
            .from('Portfolio')
            .update({
                title: title,
                description: description,
                url: url,
                image_url: platformInfo.thumbnail,
                platform: platformInfo.name,
                platform_icon: platformInfo.icon,
                updated_at: new Date().toISOString()
            })
            .eq('id', id);
        
        if (error) throw error;
        
        hideEditForm();
        alert('✅ Project berhasil diupdate!');
        loadPortfolioProjects();
        
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Gagal update project: ' + error.message);
    } finally {
        updateBtn.innerHTML = originalText;
        updateBtn.disabled = false;
    }
}

// Delete project
async function deleteProject(id, title) {
    if (!confirm(`Yakin hapus project "${title}"?`)) return;
    
    try {
        const { error } = await supabase
            .from('Portfolio')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        
        alert('✅ Project berhasil dihapus!');
        loadPortfolioProjects();
        
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Gagal menghapus project: ' + error.message);
    }
}

// ==========================================
// PORTFOLIO DISPLAY FUNCTIONS
// ==========================================

// Load projects from database
async function loadPortfolioProjects() {
    try {
        // Coba kedua kemungkinan ID
        const portfolioGrid = document.getElementById('portfolioGridAdmin') || document.getElementById('portfolioGrid');
        
        if (!portfolioGrid) {
            console.error('Element portfolio grid tidak ditemukan!');
            return;
        }
        
        console.log('🔄 Memuat project dari database...');
        
        const { data: projects, error } = await supabase
            .from('Portfolio')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Error dari Supabase:', error);
            throw error;
        }
        
        console.log('📊 Project yang ditemukan:', projects);
        
        portfolioGrid.innerHTML = '';
        
        if (projects && projects.length > 0) {
            // Update stats
            updateStats(projects);
            
            // Add projects to grid
            projects.forEach(project => {
                const projectElement = createProjectElement(project);
                portfolioGrid.appendChild(projectElement);
            });
            
            console.log(`✅ ${projects.length} project berhasil dimuat`);
        } else {
            console.log('📭 Tidak ada project ditemukan');
            showEmptyState();
        }
        
    } catch (error) {
        console.error('Error loading portfolio:', error);
        showEmptyState();
    }
}

// Update statistics
function updateStats(projects) {
    const total = projects.length;
    const youtube = projects.filter(p => p.platform === 'YouTube').length;
    const tiktok = projects.filter(p => p.platform === 'TikTok').length;
    const instagram = projects.filter(p => p.platform === 'Instagram').length;
    
    // Update elements jika ada
    const totalEl = document.getElementById('totalProjects');
    const youtubeEl = document.getElementById('youtubeProjects');
    const tiktokEl = document.getElementById('tiktokProjects');
    const instagramEl = document.getElementById('instagramProjects');
    
    if (totalEl) totalEl.textContent = total;
    if (youtubeEl) youtubeEl.textContent = youtube;
    if (tiktokEl) tiktokEl.textContent = tiktok;
    if (instagramEl) instagramEl.textContent = instagram;
}

// Create project HTML element with action buttons - FIXED
function createProjectElement(project) {
    const element = document.createElement('div');
    element.className = 'portfolio-item-admin';
    
    // Tentukan link/button berdasarkan platform
    let actionButton;
    
    if (project.platform === 'YouTube' || project.platform === 'TikTok') {
        // Untuk YouTube dan TikTok, buat tombol play
        const buttonText = project.platform === 'YouTube' ? 'Play Video' : 'Play TikTok';
        const buttonIcon = project.platform === 'YouTube' ? 'fa-play-circle' : 'fa-play';
        
        actionButton = `
            <button class="portfolio-link" 
                    onclick="showVideoPlayer('${project.title.replace(/'/g, "\\'")}', '${project.url}', '${project.platform}')"
                    style="background: none; border: none; cursor: pointer; color: var(--accent-primary); font-family: inherit;">
                <i class="fas ${buttonIcon}"></i> ${buttonText}
            </button>
        `;
    } else {
        // Untuk platform lain (Instagram, Facebook, Twitter, Website), buka di tab baru
        actionButton = `
            <a href="${project.url}" target="_blank" class="portfolio-link">
                <i class="${project.platform_icon}"></i> View on ${project.platform}
            </a>
        `;
    }
    
    element.innerHTML = `
        <div class="platform-badge">
            <i class="${project.platform_icon}"></i>
        </div>
        
        <div class="item-actions">
            <button class="btn btn-warning btn-sm" onclick="showEditForm(${JSON.stringify(project).replace(/"/g, '&quot;')})">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-danger btn-sm" onclick="deleteProject(${project.id}, '${project.title.replace(/'/g, "\\'")}')">
                <i class="fas fa-trash"></i>
            </button>
        </div>
        
        <div class="portfolio-img-admin">
            <img src="${project.image_url}" alt="${project.title}" loading="lazy" 
                 onerror="this.src='https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=225&fit=crop'">
        </div>
        
        <div class="portfolio-content-admin">
            <h3>${project.title}</h3>
            <p>${project.description}</p>
            <div class="portfolio-meta-admin">
                ${actionButton}
                <div class="portfolio-date-admin">
                    ${formatDate(project.created_at)}
                </div>
            </div>
        </div>
    `;
    return element;
}

// Show empty state
function showEmptyState() {
    // Coba kedua kemungkinan ID
    const portfolioGrid = document.getElementById('portfolioGridAdmin') || document.getElementById('portfolioGrid');
    if (!portfolioGrid) return;
    
    portfolioGrid.innerHTML = `
        <div class="empty-state-admin">
            <i class="fas fa-film"></i>
            <h3>Belum Ada Project</h3>
            <p>Klik tombol "Tambah Project Baru" untuk menambah project pertama Anda.</p>
        </div>
    `;
    
    // Reset stats
    updateStats([]);
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// ==========================================
// EVENT LISTENERS
// ==========================================

// Close modals when clicking outside
document.addEventListener('click', function(e) {
    if (e.target.id === 'addProjectModal') hideAddForm();
    if (e.target.id === 'editProjectModal') hideEditForm();
    if (e.target.id === 'videoPlayerModal') hideVideoPlayer();
});

// Close modals with ESC key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        hideAddForm();
        hideEditForm();
        hideVideoPlayer();
    }
});

// Close modals when clicking outside - UPDATED
document.addEventListener('click', function(e) {
    if (e.target.id === 'addProjectModal') hideAddForm();
    if (e.target.id === 'editProjectModal') hideEditForm();
    if (e.target.id === 'videoPlayerModal') hideVideoPlayer();
});

// Close modals with ESC key - UPDATED
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        hideAddForm();
        hideEditForm();
        hideVideoPlayer();
    }
});

// ==========================================
// INITIALIZATION
// ==========================================

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Portfolio Manager initialized');
    loadPortfolioProjects();
});