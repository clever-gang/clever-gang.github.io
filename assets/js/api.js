import { GITHUB_API_URL } from './config.js';

export async function fetchRepositories() {
    const response = await fetch(GITHUB_API_URL, {
        headers: { Accept: 'application/vnd.github.v3+json' }
    });
    if (!response.ok) {
        throw new Error('Failed to fetch repositories');
    }
    const data = await response.json();
    return data;
}
