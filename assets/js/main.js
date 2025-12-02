import { demoRepositories } from './config.js';
import { fetchRepositories as apiFetch } from './api.js';
import { initParticles, setMatrixEnabled } from './particles.js';
import * as UI from './ui.js';

let allRepositories = [];
let currentFilter = 'all';
let animationsEnabled = true;

document.addEventListener('DOMContentLoaded', async () => {
    initParticles();
    setupSidebarToggle();
    setupSearchAndFilters();
    setupThemeToggle();
    setAnimationIcon();

    setupLanguageToggle(); // wire language toggle early so UI text reflects choice

    setupCopyProtection(); // <-- new: disable right-click / select / copy globally

    setupDataHrefLinks(); // ensure data-href links open correctly (prevents browser status preview)

    await loadRepositories();

    // initial sidebar state
    function setInitialSidebarState() {
        if (window.innerWidth <= 900) {
            document.body.classList.remove('sidebar-open');
            if (UI.DOM.sidebarHeader) UI.DOM.sidebarHeader.classList.add('hide');
        } else {
            document.body.classList.add('sidebar-open');
            if (UI.DOM.sidebarHeader) UI.DOM.sidebarHeader.classList.remove('hide');
        }
    }
    setInitialSidebarState();
    window.addEventListener('resize', setInitialSidebarState);
});

async function loadRepositories() {
    const { loading, error } = UI.DOM;
    loading.style.display = 'block';
    error.style.display = 'none';
    UI.DOM.repoGrid.innerHTML = '';

    try {
        const data = await apiFetch();
        allRepositories = data.sort((a, b) => b.stargazers_count - a.stargazers_count);
    } catch (e) {
        console.warn('API fetch failed, using demo data', e);
        allRepositories = demoRepositories;
    } finally {
        UI.DOM.loading.style.display = 'none';
        UI.DOM.error.style.display = 'none';
        UI.updateStats(allRepositories);
        UI.displayRepositories(filterRepositories(allRepositories), UI.DOM.searchInput?.value || '');
    }
}

function setupSearchAndFilters() {
    const { searchInput, filterButtons } = UI.DOM;
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = filterRepositories(allRepositories).filter(repo =>
                repo.name.toLowerCase().includes(term) ||
                (repo.description && repo.description.toLowerCase().includes(term)) ||
                (repo.language && repo.language.toLowerCase().includes(term))
            );
            UI.displayRepositories(filtered, e.target.value);
        });
    }

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentFilter = button.dataset.filter;
            const filtered = filterRepositories(allRepositories);
            const term = UI.DOM.searchInput ? UI.DOM.searchInput.value.toLowerCase() : '';
            const finalRepos = term
                ? filtered.filter(repo =>
                    repo.name.toLowerCase().includes(term) ||
                    (repo.description && repo.description.toLowerCase().includes(term)) ||
                    (repo.language && repo.language.toLowerCase().includes(term))
                )
                : filtered;
            UI.displayRepositories(finalRepos, term);
        });
    });
}

function setupThemeToggle() {
    const { themeToggle } = UI.DOM;
    if (!themeToggle) return;
    themeToggle.addEventListener('click', () => {
        animationsEnabled = !animationsEnabled;
        setMatrixEnabled(animationsEnabled);
        setAnimationIcon();
        UI.setRepoCardAnimationsEnabled(animationsEnabled);
    });
}

function setAnimationIcon() {
    const el = UI.DOM.themeIcon;
    if (!el) return;
    if (animationsEnabled) {
        el.innerHTML = `
            <svg viewBox="0 0 32 32" width="28" height="28" fill="none">
                <polygon points="10,6 26,16 10,26" stroke="#00e5ff" stroke-width="2.5" fill="none"/>
            </svg>
        `;
    } else {
        el.innerHTML = `
            <svg viewBox="0 0 32 32" width="28" height="28" fill="none">
                <rect x="8" y="8" width="4" height="16" rx="2" stroke="#00e5ff" stroke-width="2.5" fill="none"/>
                <rect x="20" y="8" width="4" height="16" rx="2" stroke="#00e5ff" stroke-width="2.5" fill="none"/>
            </svg>
        `;
    }
}

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

function setupSidebarToggle() {
    const { sidebarToggle, sidebarHeader } = UI.DOM;
    if (!sidebarToggle || !sidebarHeader) return;
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

/* language toggle wiring */
function setupLanguageToggle() {
    const btn = UI.DOM.langToggle;
    const label = UI.DOM.langLabel;
    if (!btn) return;

    // initialize aria-label and ensure label reflects stored language
    const initial = localStorage.getItem('cg_lang') || 'en';
    btn.setAttribute('aria-label', `Language: ${initial.toUpperCase()}`);
    if (label) label.textContent = initial === 'jp' ? 'JP' : (initial === 'de' ? 'DE' : 'EN');

    // cycle through en -> jp -> de -> en
    btn.addEventListener('click', () => {
        const current = localStorage.getItem('cg_lang') || 'en';
        const next = current === 'en' ? 'jp' : (current === 'jp' ? 'de' : 'en');
        UI.setLanguage(next);
        btn.setAttribute('aria-label', `Language: ${next.toUpperCase()}`);
        // ui.setLanguage already updates DOM.langLabel, but keep label in sync defensively
        if (label) label.textContent = next === 'jp' ? 'JP' : (next === 'de' ? 'DE' : 'EN');
    });
}

/* New: copy/selection/contextmenu protection (respects inputs and contenteditable) */
function isEditableTarget(target) {
    if (!target) return false;
    if (target.closest) {
        return !!target.closest('input, textarea, select, [contenteditable], [contenteditable="true"]');
    }
    return false;
}

function setupCopyProtection() {
    // disable right-click context menu globally except on editable controls
    document.addEventListener('contextmenu', (e) => {
        if (isEditableTarget(e.target)) return;
        e.preventDefault();
    }, { passive: false });

    // prevent mouse-driven selection start globally except on editable controls
    document.addEventListener('selectstart', (e) => {
        if (isEditableTarget(e.target)) return;
        e.preventDefault();
    }, { passive: false });

    // block copy/cut events globally except when originating from editable controls
    document.addEventListener('copy', (e) => {
        if (isEditableTarget(e.target)) return;
        e.preventDefault();
    }, { passive: false });

    document.addEventListener('cut', (e) => {
        if (isEditableTarget(e.target)) return;
        e.preventDefault();
    }, { passive: false });

    // block common keyboard shortcuts: Ctrl/Cmd+A, Ctrl/Cmd+C, Ctrl/Cmd+X (but allow in inputs)
    document.addEventListener('keydown', (e) => {
        const key = (e.key || '').toLowerCase();
        const ctrlOrCmd = e.ctrlKey || e.metaKey;
        if (!ctrlOrCmd) return;

        // allow shortcuts in editable targets
        if (isEditableTarget(e.target)) return;

        if (key === 'a' || key === 'c' || key === 'x') {
            e.preventDefault();
            e.stopPropagation();
        }
    }, { passive: false });
}

/* Ensure elements using data-href behave like links so the browser won't display the hovered URL preview */
function setupDataHrefLinks() {
    // click handler: supports modifier keys (ctrl/meta to open new tab) and respects target="_blank"
    document.addEventListener('click', (e) => {
        const el = e.target.closest && e.target.closest('a[data-href]');
        if (!el) return;
        const url = el.dataset.href;
        if (!url) return;
        const modifier = e.ctrlKey || e.metaKey;
        const targetBlank = el.getAttribute('target') === '_blank';
        try {
            if (modifier || targetBlank) {
                window.open(url, '_blank', 'noopener');
            } else {
                window.location.href = url;
            }
        } catch (err) {
            // fallback
            window.open(url, '_blank');
        }
        e.preventDefault();
        e.stopPropagation();
    }, { passive: false });

    // keyboard activation for focused data-href anchors (Enter/Space)
    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const active = document.activeElement;
        if (active && active.matches && active.matches('a[data-href]')) {
            const url = active.dataset.href;
            if (url) {
                window.open(url, '_blank', 'noopener');
                e.preventDefault();
                e.stopPropagation();
            }
        }
    }, { passive: false });
}
