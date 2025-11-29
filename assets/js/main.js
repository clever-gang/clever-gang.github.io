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
