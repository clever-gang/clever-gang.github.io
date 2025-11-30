import { escapeHtml, formatRepoDate, animateValue } from './utils.js';
import { translations } from './translations.js'; // <-- new import

export const DOM = {
    repoGrid: document.getElementById('repoGrid'),
    loading: document.getElementById('loading'),
    error: document.getElementById('error'),
    searchInput: document.getElementById('searchInput'),
    filterButtons: document.querySelectorAll('.filter-btn'),
    totalReposEl: document.getElementById('totalRepos'),
    totalStarsEl: document.getElementById('totalStars'),
    totalForksEl: document.getElementById('totalForks'),
    themeToggle: document.getElementById('themeToggle'),
    themeIcon: document.getElementById('themeIcon'),
    sidebarToggle: document.getElementById('sidebarToggle'),
    sidebarHeader: document.getElementById('sidebarHeader'),
    langToggle: document.getElementById('langToggle'),
    langLabel: document.getElementById('langLabel')
};

// add module-level flag to remember desired repo-name glitch state
let repoAnimationsEnabled = true;

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

export function updateStats(allRepositories = []) {
    const totalRepos = allRepositories.length;
    const totalStars = allRepositories.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
    const totalForks = allRepositories.reduce((sum, repo) => sum + (repo.forks_count || 0), 0);

    animateValue(DOM.totalReposEl, 0, totalRepos, 1000);
    animateValue(DOM.totalStarsEl, 0, totalStars, 1000);
    animateValue(DOM.totalForksEl, 0, totalForks, 1000);
}

export function displayRepositories(repos = [], searchValue = '') {
    const repoGrid = DOM.repoGrid;
    repoGrid.innerHTML = '';

    if (typeof searchValue === 'string' && searchValue.trim().toLowerCase() === 'daxxtropezz') {
        const flagCard1 = document.createElement('div');
        const flagCard2 = document.createElement('div');
        flagCard1.className = 'repo-card flag-card';
        flagCard1.innerHTML = `
            <div class="repo-header">
                <div class="repo-icon">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                        <circle cx="16" cy="16" r="14" stroke="#00e5ff" stroke-width="2.5"/>
                        <text x="16" y="21" text-anchor="middle" font-size="16" fill="#00e5ff" font-family="Orbitron">🎉</text>
                    </svg>
                </div>
                <div class="repo-language">Secret 1</div>
            </div>
            <p class="repo-description">
                <a href="https://daxxtropezz.vercel.app/" target="_blank" draggable="false" style="color:#00e5ff;font-weight:700;">My Profile</a>
            </p>
            <div class="repo-stats">
                <span class="stat" style="color:#10b981;font-weight:700;">
                    Well done! You have found the flag! 🚩
                </span>
            </div>
        `;
        flagCard2.className = 'repo-card flag-card';
        flagCard2.innerHTML = `
            <div class="repo-header">
                <div class="repo-icon">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                        <circle cx="16" cy="16" r="14" stroke="#ff0000ff" stroke-width="2.5"/>
                        <text x="16" y="21" text-anchor="middle" font-size="16" fill="#ff0000ff" font-family="Orbitron">🎉</text>
                    </svg>
                </div>
                <div class="repo-language">Secret 2</div>
            </div> 
            <p class="repo-description"> 
                <a href="https://daxxtropezz.github.io/?utm_source=clever-gang.github.io" target="_blank" draggable="false" style="color:#6d28d9;font-weight:700;">Operating System Game</a>
            </p>
            <div class="repo-stats">
                <span class="stat" style="color:#10b981;font-weight:700;">
                    I wonder what is in this game 🤔
                </span>
            </div>
        `;
        repoGrid.appendChild(flagCard1);
        repoGrid.appendChild(flagCard2);
        observeCards();
        // ensure flag cards respect current animation state (remove data-text/class if disabled)
        setRepoCardAnimationsEnabled(repoAnimationsEnabled);
        return;
    }

    if (!repos || repos.length === 0) {
        repoGrid.innerHTML = '<p style="text-align: center; color: var(--text-secondary); grid-column: 1 / -1;">No repositories found.</p>';
        return;
    }

    repos.forEach((repo, index) => {
        const card = createRepoCard(repo, index);
        repoGrid.appendChild(card);
    });

    observeCards();

    // apply current repo-name/data-text state to newly created cards
    setRepoCardAnimationsEnabled(repoAnimationsEnabled);
}

export function createRepoCard(repo, index = 0) {
    const card = document.createElement('div');
    card.className = 'repo-card';
    card.style.animationDelay = `${index * 0.05}s`;

    const icon = getRepoIcon(repo);
    const description = repo.description || 'No description available';
    const language = repo.language || 'Unknown';
    const stars = repo.stargazers_count || 0;
    const forks = repo.forks_count || 0;
    const updated = formatRepoDate(repo.updated_at);

    let badges = '';
    if (repo.fork) badges += '<span class="badge fork">Fork</span>';
    if (repo.archived) badges += '<span class="badge archived">Archived</span>';
    if (repo.is_template) badges += '<span class="badge template">Template</span>';

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

    card.innerHTML = `
        <div class="repo-header">
            <div class="repo-icon">${icon}</div>
            ${language !== 'Unknown' ? `<div class="repo-language">${language}</div>` : ''} 
        </div>
        <a href="${repo.html_url}" target="_blank" draggable="false" class="repo-name glitch" data-text="${escapeHtml(repo.name)}">${repo.name}</a>
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

export function setRepoCardAnimationsEnabled(enabled) {
    // store the desired state
    repoAnimationsEnabled = !!enabled;

    // toggle transitions / opacity for cards (existing behavior)
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

    // operate on elements that currently have .glitch OR that were previously disabled (have data-orig-text)
    const glitchElements = document.querySelectorAll('.glitch, [data-orig-text]');

    glitchElements.forEach(el => {
        if (!enabled) {
            // preserve original data-text if present, then remove it and the glitch class
            if (el.hasAttribute('data-text')) {
                el.setAttribute('data-orig-text', el.getAttribute('data-text'));
                el.removeAttribute('data-text');
            }
            el.classList.remove('glitch');
        } else {
            // restore original data-text if we saved it, otherwise ensure it's present
            if (el.hasAttribute('data-orig-text')) {
                el.setAttribute('data-text', el.getAttribute('data-orig-text'));
                el.removeAttribute('data-orig-text');
            } else if (!el.hasAttribute('data-text')) {
                // fallback: set data-text to the visible text
                el.setAttribute('data-text', el.textContent || '');
            }
            el.classList.add('glitch');
        }
    });
}

export function observeCards() {
    document.querySelectorAll('.repo-card').forEach(card => {
        observer.observe(card);
    });
}

// local helper icon generator used by UI
function getRepoIcon(repo) {
    if (!repo) return '';
    if (repo.fork) return `
        <svg viewBox="0 0 32 32" fill="none">
            <path d="M16 28V10" stroke="#00e5ff" stroke-width="2.2"/>
            <path d="M10 16c0 3.3 2.7 6 6 6s6-2.7 6-6" stroke="#0ea5e9" stroke-width="2.2"/>
            <path d="M16 4v6m0-6l-4 6m4-6l4 6" stroke="#00e5ff" stroke-width="2.2"/>
        </svg>
    `;
    if (repo.is_template) return `
        <svg viewBox="0 0 32 32" fill="none">
            <rect x="8" y="8" width="16" height="20" rx="3" stroke="#10b981" stroke-width="2.2"/>
            <rect x="12" y="4" width="8" height="6" rx="2" stroke="#0ea5e9" stroke-width="2.2"/>
        </svg>
    `;
    if (repo.archived) return `
        <svg viewBox="0 0 32 32" fill="none">
            <rect x="6" y="10" width="20" height="14" rx="3" stroke="#f59e0b" stroke-width="2.2"/>
            <rect x="10" y="6" width="12" height="6" rx="2" stroke="#f59e0b" stroke-width="2.2"/>
        </svg>
    `;

    const name = (repo.name || '').toLowerCase();
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
    if (name.includes('web') || name.includes('frontend')) return `
        <svg viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="12" stroke="#00e5ff" stroke-width="2.2"/>
            <ellipse cx="16" cy="16" rx="12" ry="5" stroke="#0ea5e9" stroke-width="2.2"/>
            <ellipse cx="16" cy="16" rx="5" ry="12" stroke="#0ea5e9" stroke-width="2.2"/>
        </svg>
    `;
    if (name.includes('mobile') || name.includes('app')) return `
        <svg viewBox="0 0 32 32" fill="none">
            <rect x="9" y="5" width="14" height="22" rx="3" stroke="#00e5ff" stroke-width="2.2"/>
            <circle cx="16" cy="25" r="1.5" fill="#0ea5e9"/>
        </svg>
    `;
    if (name.includes('doc') || name.includes('guide')) return `
        <svg viewBox="0 0 32 32" fill="none">
            <rect x="7" y="7" width="18" height="18" rx="3" stroke="#00e5ff" stroke-width="2.2"/>
            <line x1="16" y1="7" x2="16" y2="25" stroke="#0ea5e9" stroke-width="2.2"/>
        </svg>
    `;
    if (name.includes('bot')) return `
        <svg viewBox="0 0 32 32" fill="none">
            <rect x="9" y="13" width="14" height="10" rx="3" stroke="#00e5ff" stroke-width="2.2"/>
            <circle cx="12" cy="18" r="1.5" fill="#0ea5e9"/>
            <circle cx="20" cy="18" r="1.5" fill="#0ea5e9"/>
            <rect x="13" y="7" width="6" height="6" rx="2" stroke="#00e5ff" stroke-width="2.2"/>
        </svg>
    `;
    if (name.includes('data') || name.includes('database')) return `
        <svg viewBox="0 0 32 32" fill="none">
            <ellipse cx="16" cy="10" rx="10" ry="5" stroke="#00e5ff" stroke-width="2.2"/>
            <rect x="6" y="10" width="20" height="12" rx="5" stroke="#0ea5e9" stroke-width="2.2"/>
            <ellipse cx="16" cy="22" rx="10" ry="5" stroke="#00e5ff" stroke-width="2.2"/>
        </svg>
    `;
    if (name.includes('test')) return `
        <svg viewBox="0 0 32 32" fill="none">
            <rect x="13" y="6" width="6" height="12" rx="2" stroke="#0ea5e9" stroke-width="2.2"/>
            <path d="M13 18c0 3 6 3 6 0" stroke="#00e5ff" stroke-width="2.2"/>
        </svg>
    `;

    return `
        <svg viewBox="0 0 22 22" fill="none" width="22" height="22">
            <rect x="2" y="7" width="18" height="8" rx="2" stroke="#00e5ff" stroke-width="1.5"/>
            <path d="M2 7l3-4h5l3 4" stroke="#0ea5e9" stroke-width="1.5"/>
        </svg>
    `;
}

/* translations: minimal set for UI strings we change */
let currentLang = localStorage.getItem('cg_lang') || 'en';

/* setLanguage updates visible UI text (title, subtitle, placeholders, filter labels, stat labels, loading/error) */
export function setLanguage(lang = 'en') {
    currentLang = lang === 'jp' ? 'jp' : (lang === 'de' ? 'de' : 'en');
    localStorage.setItem('cg_lang', currentLang);

    const t = translations[currentLang];

    // title main/sub (data-text attributes used by .glitch pseudo-elements)
    const titleMain = document.querySelector('.title-main');
    const titleSub = document.querySelector('.title-sub');
    if (titleMain) {
        titleMain.dataset.text = t.titleMain;
        titleMain.textContent = t.titleMain;
    }
    if (titleSub) {
        titleSub.dataset.text = t.titleSub;
        titleSub.textContent = t.titleSub;
    }

    // subtitle
    const subtitleEl = document.querySelector('.subtitle');
    if (subtitleEl) subtitleEl.textContent = t.subtitle;

    // search placeholder
    if (DOM.searchInput) DOM.searchInput.placeholder = t.searchPlaceholder;

    // filter buttons (preserve dataset.filter values)
    if (DOM.filterButtons && DOM.filterButtons.length) {
        DOM.filterButtons.forEach((btn, idx) => {
            btn.textContent = t.filters[idx] || btn.textContent;
        });
    }

    // stat labels in header (ordered)
    const statLabels = document.querySelectorAll('.stats-container .stat-label');
    if (statLabels && statLabels.length >= 3) {
        statLabels[0].textContent = t.stats[0];
        statLabels[1].textContent = t.stats[1];
        statLabels[2].textContent = t.stats[2];
    }

    // loading / error texts
    if (DOM.loading) {
        const p = DOM.loading.querySelector('p');
        if (p) p.textContent = t.loading;
    }
    if (DOM.error) {
        const p = DOM.error.querySelector('p');
        if (p) p.textContent = t.error;
    }

    // update small flag content (if search-flag behavior used elsewhere)
    // update lang label on button if present
    if (DOM.langLabel) DOM.langLabel.textContent = currentLang === 'jp' ? 'JP' : (currentLang === 'de' ? 'DE' : 'EN');
}

/* ensure initial language reflected on load */
setLanguage(currentLang);
