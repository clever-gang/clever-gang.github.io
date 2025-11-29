// Configuration
const GITHUB_ORG = 'clever-gang';
const GITHUB_API_URL = `https://api.github.com/orgs/${GITHUB_ORG}/repos`;

// Theme keys
const THEME_KEY = 'cg_theme'; // 'dark' or 'light'

// State
let allRepositories = [];
let currentFilter = 'all';

// Animation state
let animationsEnabled = true;

// DOM Elements
const repoGrid = document.getElementById('repoGrid');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const searchInput = document.getElementById('searchInput');
const filterButtons = document.querySelectorAll('.filter-btn');
const totalReposEl = document.getElementById('totalRepos');
const totalStarsEl = document.getElementById('totalStars');
const totalForksEl = document.getElementById('totalForks');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebarHeader = document.getElementById('sidebarHeader');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    fetchRepositories();
    setupEventListeners();
    setAnimationIcon();

    // Sidebar toggle logic
    if (sidebarToggle && sidebarHeader) {
        sidebarToggle.addEventListener('click', () => {
            const isOpen = document.body.classList.contains('sidebar-open');
            if (isOpen) {
                document.body.classList.remove('sidebar-open');
                sidebarHeader.classList.add('hide');
            } else {
                document.body.classList.add('sidebar-open');
                sidebarHeader.classList.remove('hide');
            }
        });
    }

    // Set initial sidebar state based on screen size
    function setInitialSidebarState() {
        if (window.innerWidth <= 900) {
            document.body.classList.remove('sidebar-open');
            if (sidebarHeader) sidebarHeader.classList.add('hide');
        } else {
            document.body.classList.add('sidebar-open');
            if (sidebarHeader) sidebarHeader.classList.remove('hide');
        }
    }
    setInitialSidebarState();
    window.addEventListener('resize', setInitialSidebarState);
});

// Create animated background: Matrix-style falling binary chains
let matrixCanvas, matrixCtx;
let matrixCols = 0;
let matrixDrops = [];
let matrixFontSize = 14;
let matrixAnimationId = null;

function initParticles() {
    // Remove old particle children if present
    const container = document.getElementById('particles');
    while (container.firstChild) container.removeChild(container.firstChild);

    // Create canvas
    matrixCanvas = document.createElement('canvas');
    matrixCanvas.id = 'matrixCanvas';
    matrixCanvas.style.width = '100%';
    matrixCanvas.style.height = '100%';
    container.appendChild(matrixCanvas);

    matrixCtx = matrixCanvas.getContext('2d');

    // Initialize sizes and drops
    const fit = () => {
        const dpr = window.devicePixelRatio || 1;
        matrixCanvas.width = Math.floor(window.innerWidth * dpr);
        matrixCanvas.height = Math.floor(window.innerHeight * dpr);
        matrixCtx.scale(dpr, dpr);

        // set font size relative to width slightly
        matrixFontSize = Math.max(10, Math.min(20, Math.floor(window.innerWidth / 120)));
        matrixCtx.font = `${matrixFontSize}px monospace`;

        matrixCols = Math.floor(window.innerWidth / matrixFontSize);
        matrixDrops = new Array(matrixCols).fill(0).map(() => Math.floor(Math.random() * 100));
    };

    fit();

    // Recompute on resize
    let resizeTimer;
    const onResize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            // reset scale before re-fitting
            matrixCtx.setTransform(1, 0, 0, 1, 0, 0);
            fit();
        }, 150);
    };
    window.addEventListener('resize', onResize);

    // Pause when tab hidden to save CPU
    const onVisibility = () => {
        if (document.hidden) cancelAnimationFrame(matrixAnimationId);
        else drawMatrix();
    };
    document.addEventListener('visibilitychange', onVisibility);

    // draw loop
    function drawMatrix() {
        if (!animationsEnabled) return;

        // subtle translucent fill to create trail effect
        matrixCtx.fillStyle = getComputedStyle(document.body).getPropertyValue('--background') || 'rgba(2,4,10,0.06)';
        // use a slightly transparent black to fade previous frames
        matrixCtx.fillStyle = matrixCtx.fillStyle.includes('rgb') ? matrixCtx.fillStyle : 'rgba(2,4,10,0.06)';
        matrixCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);

        // use neon color from CSS variables
        const neon1 = getComputedStyle(document.body).getPropertyValue('--neon-1') || '#00e5ff';
        const neon2 = getComputedStyle(document.body).getPropertyValue('--neon-2') || '#0ea5e9';

        matrixCtx.textBaseline = 'top';

        for (let i = 0; i < matrixCols; i++) {
            // choose binary char
            const char = Math.random() > 0.5 ? '1' : '0';

            // alternate color intensity across columns for depth
            const mix = (i % 6) / 6;
            // simple mix of the two neon colors
            matrixCtx.fillStyle = interpolateColor(neon1.trim(), neon2.trim(), mix);
            matrixCtx.fillText(char, i * matrixFontSize, matrixDrops[i] * matrixFontSize);

            // reset drop randomly after it goes off screen
            if ((matrixDrops[i] * matrixFontSize) > window.innerHeight && Math.random() > 0.975) {
                matrixDrops[i] = 0;
            }
            matrixDrops[i]++;
        }

        matrixAnimationId = requestAnimationFrame(drawMatrix);
    }

    // start drawing
    cancelAnimationFrame(matrixAnimationId);
    drawMatrix();

    // helper: simple hex color interpolation (returns rgb string)
    function interpolateColor(a, b, t) {
        // accept hex like #aabbcc or rgb(..)
        const c1 = parseColor(a) || [0, 229, 255];
        const c2 = parseColor(b) || [14, 165, 233];
        const r = Math.round(c1[0] + (c2[0] - c1[0]) * t);
        const g = Math.round(c1[1] + (c2[1] - c1[1]) * t);
        const bl = Math.round(c1[2] + (c2[2] - c1[2]) * t);
        return `rgb(${r}, ${g}, ${bl})`;
    }

    function parseColor(input) {
        if (!input) return null;
        input = input.replace(/\s+/g, '');
        // hex
        const hex = /^#?([a-f\d]{6}|[a-f\d]{3})$/i.exec(input);
        if (hex) {
            let col = hex[1];
            if (col.length === 3) col = col.split('').map(ch => ch + ch).join('');
            return [parseInt(col.substr(0, 2), 16), parseInt(col.substr(2, 2), 16), parseInt(col.substr(4, 2), 16)];
        }
        // rgb(...)
        const rgb = /^rgb\((\d+),(\d+),(\d+)\)$/i.exec(input);
        if (rgb) return [parseInt(rgb[1]), parseInt(rgb[2]), parseInt(rgb[3])];
        return null;
    }
}

// Sample demo data for when API is unavailable
const demoRepositories = [
    {
        name: 'clever-gang.github.io',
        description: 'Official organization website showcasing Clever Gang repositories and projects',
        html_url: 'https://github.com/clever-gang/clever-gang.github.io',
        stargazers_count: 5,
        forks_count: 2,
        language: 'HTML',
        updated_at: '2025-10-10T00:00:00Z',
        fork: false,
        archived: false,
        is_template: false,
        private: false
    }
];

// Fetch repositories from GitHub API
async function fetchRepositories() {
    try {
        loading.style.display = 'block';
        error.style.display = 'none';
        repoGrid.innerHTML = '';

        const response = await fetch(GITHUB_API_URL, {
            headers: {
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch repositories');
        }

        const data = await response.json();
        allRepositories = data.sort((a, b) => b.stargazers_count - a.stargazers_count);

        loading.style.display = 'none';
        updateStats();
        displayRepositories(allRepositories);

    } catch (err) {
        console.error('Error fetching repositories:', err);
        console.log('Falling back to demo data...');

        // Fallback to demo data if API fails
        allRepositories = demoRepositories;
        loading.style.display = 'none';
        error.style.display = 'none';
        updateStats();
        displayRepositories(allRepositories);
    }
}

// Update statistics
function updateStats() {
    const totalRepos = allRepositories.length;
    const totalStars = allRepositories.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    const totalForks = allRepositories.reduce((sum, repo) => sum + repo.forks_count, 0);

    animateValue(totalReposEl, 0, totalRepos, 1000);
    animateValue(totalStarsEl, 0, totalStars, 1000);
    animateValue(totalForksEl, 0, totalForks, 1000);
}

// Animate number counting
function animateValue(element, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
            element.textContent = Math.round(end);
            clearInterval(timer);
        } else {
            element.textContent = Math.round(current);
        }
    }, 16);
}

// Display repositories
function displayRepositories(repos) {
    repoGrid.innerHTML = '';

    // Special flag card for 'daxxtropezz' search
    if (
        searchInput &&
        typeof searchInput.value === 'string' &&
        searchInput.value.trim().toLowerCase() === 'daxxtropezz'
    ) {
        const flagCard = document.createElement('div');
        flagCard.className = 'repo-card flag-card';
        flagCard.innerHTML = `
            <div class="repo-header">
                <div class="repo-icon">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                        <circle cx="16" cy="16" r="14" stroke="#00e5ff" stroke-width="2.5"/>
                        <text x="16" y="21" text-anchor="middle" font-size="16" fill="#00e5ff" font-family="Orbitron">🎉</text>
                    </svg>
                </div>
                <div class="repo-language">Secret</div>
            </div>
            <a href="https://daxxtropezz.vercel.app/" target="_blank" class="repo-name glitch" data-text="daxxtropezz">daxxtropezz</a>
            <p class="repo-description">
                <a href="https://daxxtropezz.vercel.app/" target="_blank" style="color:#00e5ff;font-weight:700;">Portfolio</a> &nbsp;|&nbsp;
                <a href="https://daxxtropezz.github.io/" target="_blank" style="color:#6d28d9;font-weight:700;">OS-CTF</a>
            </p>
            <div class="repo-stats">
                <span class="stat" style="color:#10b981;font-weight:700;">
                    congratulations! you have found the flag!
                </span>
            </div>
        `;
        repoGrid.appendChild(flagCard);
        return;
    }

    if (repos.length === 0) {
        repoGrid.innerHTML = '<p style="text-align: center; color: var(--text-secondary); grid-column: 1 / -1;">No repositories found.</p>';
        return;
    }

    repos.forEach((repo, index) => {
        const card = createRepoCard(repo, index);
        repoGrid.appendChild(card);
    });
}

// Create repository card
function createRepoCard(repo, index) {
    const card = document.createElement('div');
    card.className = 'repo-card';
    card.style.animationDelay = `${index * 0.05}s`;

    const icon = getRepoIcon(repo);
    const description = repo.description || 'No description available';
    const language = repo.language || 'Unknown';
    const stars = repo.stargazers_count;
    const forks = repo.forks_count;
    // Format date as DD-MMM-YY
    const updated = formatRepoDate(repo.updated_at);

    let badges = '';
    if (repo.fork) badges += '<span class="badge fork">Fork</span>';
    if (repo.archived) badges += '<span class="badge archived">Archived</span>';
    if (repo.is_template) badges += '<span class="badge template">Template</span>';

    // SVG icons for stats
    const starSvg = `
        <svg class="stat-icon" viewBox="0 0 20 20" fill="none" width="18" height="18">
            <polygon points="10,2 12.5,7.5 18,8 14,12 15,18 10,15 5,18 6,12 2,8 7.5,7.5"
                stroke="#00e5ff" stroke-width="1.5" fill="none"/>
        </svg>
    `;
    const forkSvg = `
        <svg class="stat-icon" viewBox="0 0 20 20" fill="none" width="18" height="18">
            <path d="M10 16V8" stroke="#0ea5e9" stroke-width="1.5"/>
            <circle cx="10" cy="16" r="2" stroke="#00e5ff" stroke-width="1.2" fill="none"/>
            <circle cx="6" cy="4" r="2" stroke="#00e5ff" stroke-width="1.2" fill="none"/>
            <circle cx="14" cy="4" r="2" stroke="#00e5ff" stroke-width="1.2" fill="none"/>
            <path d="M6 6v2a4 4 0 0 0 4 4h0a4 4 0 0 0 4-4V6" stroke="#0ea5e9" stroke-width="1.2"/>
        </svg>
    `;
    const dateSvg = `
        <svg class="stat-icon" viewBox="0 0 20 20" fill="none" width="18" height="18">
            <circle cx="10" cy="10" r="8" stroke="#00e5ff" stroke-width="1.2" fill="none"/>
            <path d="M10 5v5l3 3" stroke="#0ea5e9" stroke-width="1.2"/>
        </svg>
    `;

    // Place repo-language beside repo-icon
    card.innerHTML = `
        <div class="repo-header">
            <div class="repo-icon">${icon}</div>
            ${language !== 'Unknown' ? `<div class="repo-language">${language}</div>` : ''} 
        </div>
        <a href="${repo.html_url}" target="_blank" class="repo-name glitch" data-text="${escapeHtml(repo.name)}">${repo.name}</a>
        <p class="repo-description">${description}</p>
        <div class="repo-stats">
            ${stars > 0 ? `
            <span class="stat">
                ${starSvg}
                <span>${stars}</span>
            </span>` : ''}
            ${forks > 0 ? `
            <span class="stat">
                ${forkSvg}
                <span>${forks}</span>
            </span>` : ''}
            <span class="stat">
                ${dateSvg}
                <span>${updated}</span>
            </span>
        </div>
        <div class="repo-badges">${badges}</div>
    `;

    return card;
}

// Format date as DD-MMM-YY
function formatRepoDate(dateStr) {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = String(date.getFullYear()).slice(-2);
    return `${day}-${month}-${year}`;
}

// small HTML escape utility for safe data-text injection
function escapeHtml(str = '') {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

// Get icon for repository
function getRepoIcon(repo) {
    // Forked repo: trident
    if (repo.fork) return `
        <svg viewBox="0 0 32 32" fill="none">
            <path d="M16 28V10" stroke="#00e5ff" stroke-width="2.2"/>
            <path d="M10 16c0 3.3 2.7 6 6 6s6-2.7 6-6" stroke="#0ea5e9" stroke-width="2.2"/>
            <path d="M16 4v6m0-6l-4 6m4-6l4 6" stroke="#00e5ff" stroke-width="2.2"/>
        </svg>
    `;
    // Template repo: clipboard
    if (repo.is_template) return `
        <svg viewBox="0 0 32 32" fill="none">
            <rect x="8" y="8" width="16" height="20" rx="3" stroke="#10b981" stroke-width="2.2"/>
            <rect x="12" y="4" width="8" height="6" rx="2" stroke="#0ea5e9" stroke-width="2.2"/>
        </svg>
    `;
    // Archived repo: box
    if (repo.archived) return `
        <svg viewBox="0 0 32 32" fill="none">
            <rect x="6" y="10" width="20" height="14" rx="3" stroke="#f59e0b" stroke-width="2.2"/>
            <rect x="10" y="6" width="12" height="6" rx="2" stroke="#f59e0b" stroke-width="2.2"/>
        </svg>
    `;

    const name = repo.name.toLowerCase();
    // API/backend: gear
    if (name.includes('api') || name.includes('backend')) return `
        <svg viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="7" stroke="#0ea5e9" stroke-width="2.2"/>
            <g stroke="#00e5ff" stroke-width="2">
                <line x1="16" y1="3" x2="16" y2="7"/>
                <line x1="16" y1="25" x2="16" y2="29"/>
                <line x1="3" y1="16" x2="7" y2="16"/>
                <line x1="25" y1="16" x2="29" y2="16"/>
                <line x1="7.5" y1="7.5" x2="10.5" y2="10.5"/>
                <line x1="21.5" y1="21.5" x2="24.5" y2="24.5"/>
                <line x1="7.5" y1="24.5" x2="10.5" y2="21.5"/>
                <line x1="21.5" y1="10.5" x2="24.5" y2="7.5"/>
            </g>
        </svg>
    `;
    // Web/frontend: globe
    if (name.includes('web') || name.includes('frontend')) return `
        <svg viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="12" stroke="#00e5ff" stroke-width="2.2"/>
            <ellipse cx="16" cy="16" rx="12" ry="5" stroke="#0ea5e9" stroke-width="2.2"/>
            <ellipse cx="16" cy="16" rx="5" ry="12" stroke="#0ea5e9" stroke-width="2.2"/>
        </svg>
    `;
    // Mobile/app: phone
    if (name.includes('mobile') || name.includes('app')) return `
        <svg viewBox="0 0 32 32" fill="none">
            <rect x="9" y="5" width="14" height="22" rx="3" stroke="#00e5ff" stroke-width="2.2"/>
            <circle cx="16" cy="25" r="1.5" fill="#0ea5e9"/>
        </svg>
    `;
    // Docs/guide: book
    if (name.includes('doc') || name.includes('guide')) return `
        <svg viewBox="0 0 32 32" fill="none">
            <rect x="7" y="7" width="18" height="18" rx="3" stroke="#00e5ff" stroke-width="2.2"/>
            <line x1="16" y1="7" x2="16" y2="25" stroke="#0ea5e9" stroke-width="2.2"/>
        </svg>
    `;
    // Bot: robot
    if (name.includes('bot')) return `
        <svg viewBox="0 0 32 32" fill="none">
            <rect x="9" y="13" width="14" height="10" rx="3" stroke="#00e5ff" stroke-width="2.2"/>
            <circle cx="12" cy="18" r="1.5" fill="#0ea5e9"/>
            <circle cx="20" cy="18" r="1.5" fill="#0ea5e9"/>
            <rect x="13" y="7" width="6" height="6" rx="2" stroke="#00e5ff" stroke-width="2.2"/>
        </svg>
    `;
    // Data/database: disk
    if (name.includes('data') || name.includes('database')) return `
        <svg viewBox="0 0 32 32" fill="none">
            <ellipse cx="16" cy="10" rx="10" ry="5" stroke="#00e5ff" stroke-width="2.2"/>
            <rect x="6" y="10" width="20" height="12" rx="5" stroke="#0ea5e9" stroke-width="2.2"/>
            <ellipse cx="16" cy="22" rx="10" ry="5" stroke="#00e5ff" stroke-width="2.2"/>
        </svg>
    `;
    // Test: flask
    if (name.includes('test')) return `
        <svg viewBox="0 0 32 32" fill="none">
            <rect x="13" y="6" width="6" height="12" rx="2" stroke="#0ea5e9" stroke-width="2.2"/>
            <path d="M13 18c0 3 6 3 6 0" stroke="#00e5ff" stroke-width="2.2"/>
        </svg>
    `;

    // Default: folder
    return `
        <svg viewBox="0 0 22 22" fill="none" width="22" height="22">
            <rect x="2" y="7" width="18" height="8" rx="2" stroke="#00e5ff" stroke-width="1.5"/>
            <path d="M2 7l3-4h5l3 4" stroke="#0ea5e9" stroke-width="1.5"/>
        </svg>
    `;
}

// Matrix animation control
function setMatrixEnabled(enabled) {
    animationsEnabled = enabled;
    const particles = document.getElementById('particles');
    if (particles) {
        particles.style.display = enabled ? 'block' : 'none';
    }
    if (enabled) {
        drawMatrix();
    } else {
        cancelAnimationFrame(matrixAnimationId);
    }
}

// Replace theme icon with play/pause
function setAnimationIcon() {
    if (!themeIcon) return;
    if (animationsEnabled) {
        // Play icon
        themeIcon.innerHTML = `
            <svg viewBox="0 0 32 32" width="28" height="28" fill="none">
                <polygon points="10,6 26,16 10,26" stroke="#00e5ff" stroke-width="2.5" fill="none"/>
            </svg>
        `;
    } else {
        // Pause icon
        themeIcon.innerHTML = `
            <svg viewBox="0 0 32 32" width="28" height="28" fill="none">
                <rect x="8" y="8" width="4" height="16" rx="2" stroke="#00e5ff" stroke-width="2.5" fill="none"/>
                <rect x="20" y="8" width="4" height="16" rx="2" stroke="#00e5ff" stroke-width="2.5" fill="none"/>
            </svg>
        `;
    }
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredRepos = filterRepositories(allRepositories).filter(repo =>
            repo.name.toLowerCase().includes(searchTerm) ||
            (repo.description && repo.description.toLowerCase().includes(searchTerm)) ||
            (repo.language && repo.language.toLowerCase().includes(searchTerm))
        );
        displayRepositories(filteredRepos);
    });

    // Filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentFilter = button.dataset.filter;

            const filteredRepos = filterRepositories(allRepositories);
            const searchTerm = searchInput.value.toLowerCase();

            const finalRepos = searchTerm
                ? filteredRepos.filter(repo =>
                    repo.name.toLowerCase().includes(searchTerm) ||
                    (repo.description && repo.description.toLowerCase().includes(searchTerm)) ||
                    (repo.language && repo.language.toLowerCase().includes(searchTerm))
                )
                : filteredRepos;

            displayRepositories(finalRepos);
        });
    });

    // Theme toggle button
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            animationsEnabled = !animationsEnabled;
            setMatrixEnabled(animationsEnabled);
            setAnimationIcon();
            setRepoCardAnimationsEnabled(animationsEnabled);
        });
    }
}

// Filter repositories based on current filter
function filterRepositories(repos) {
    switch (currentFilter) {
        case 'public':
            return repos.filter(repo => !repo.private);
        case 'forked':
            return repos.filter(repo => repo.fork);
        default:
            return repos;
    }
}

// Add smooth scroll behavior
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Add intersection observer for card animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && animationsEnabled) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe cards when they're added
const observeCards = () => {
    document.querySelectorAll('.repo-card').forEach(card => {
        observer.observe(card);
    });
};

// Re-observe cards when repositories are displayed
const originalDisplayRepositories = displayRepositories;
displayRepositories = function (...args) {
    originalDisplayRepositories.apply(this, args);
    setTimeout(() => {
        observeCards();
        setRepoCardAnimationsEnabled(animationsEnabled);
    }, 100);
};

// Repo card animation control
function setRepoCardAnimationsEnabled(enabled) {
    document.querySelectorAll('.repo-card').forEach(card => {
        if (enabled) {
            card.style.transition = '';
            card.style.opacity = '';
            card.style.transform = '';
        } else {
            card.style.transition = 'none';
            card.style.opacity = '1';
            card.style.transform = 'none';
        }
    });
};
