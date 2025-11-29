export function escapeHtml(str = '') {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

export function formatRepoDate(dateStr) {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = String(date.getFullYear()).slice(-2);
    return `${day}-${month}-${year}`;
}

export function animateValue(element, start, end, duration = 1000) {
    const range = end - start;
    if (!element) return;
    if (range === 0) {
        element.textContent = String(end);
        return;
    }
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

export function parseColor(input) {
    if (!input) return null;
    input = input.replace(/\s+/g, '');
    const hex = /^#?([a-f\d]{6}|[a-f\d]{3})$/i.exec(input);
    if (hex) {
        let col = hex[1];
        if (col.length === 3) col = col.split('').map(ch => ch + ch).join('');
        return [parseInt(col.substr(0, 2), 16), parseInt(col.substr(2, 2), 16), parseInt(col.substr(4, 2), 16)];
    }
    const rgb = /^rgb\((\d+),(\d+),(\d+)\)$/i.exec(input);
    if (rgb) return [parseInt(rgb[1]), parseInt(rgb[2]), parseInt(rgb[3])];
    return null;
}

export function interpolateColor(a, b, t) {
    const c1 = parseColor(a) || [0, 229, 255];
    const c2 = parseColor(b) || [14, 165, 233];
    const r = Math.round(c1[0] + (c2[0] - c1[0]) * t);
    const g = Math.round(c1[1] + (c2[1] - c1[1]) * t);
    const bl = Math.round(c1[2] + (c2[2] - c1[2]) * t);
    return `rgb(${r}, ${g}, ${bl})`;
}
