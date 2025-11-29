import { interpolateColor } from './utils.js';

let matrixCanvas, matrixCtx;
let matrixCols = 0;
let matrixDrops = [];
let matrixFontSize = 14;
let matrixAnimationId = null;
let animationsEnabled = true;

export function initParticles() {
    const container = document.getElementById('particles');
    if (!container) return;

    while (container.firstChild) container.removeChild(container.firstChild);

    matrixCanvas = document.createElement('canvas');
    matrixCanvas.id = 'matrixCanvas';
    matrixCanvas.style.width = '100%';
    matrixCanvas.style.height = '100%';
    container.appendChild(matrixCanvas);

    matrixCtx = matrixCanvas.getContext('2d');

    const fit = () => {
        const dpr = window.devicePixelRatio || 1;
        matrixCanvas.width = Math.floor(window.innerWidth * dpr);
        matrixCanvas.height = Math.floor(window.innerHeight * dpr);
        matrixCtx.setTransform(1, 0, 0, 1, 0, 0);
        matrixCtx.scale(dpr, dpr);

        matrixFontSize = Math.max(10, Math.min(20, Math.floor(window.innerWidth / 120)));
        matrixCtx.font = `${matrixFontSize}px monospace`;

        matrixCols = Math.floor(window.innerWidth / matrixFontSize) || 1;
        matrixDrops = new Array(matrixCols).fill(0).map(() => Math.floor(Math.random() * 100));
    };

    fit();

    let resizeTimer;
    const onResize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            matrixCtx.setTransform(1, 0, 0, 1, 0, 0);
            fit();
        }, 150);
    };
    window.addEventListener('resize', onResize);

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) cancelAnimationFrame(matrixAnimationId);
        else drawMatrix();
    });

    function drawMatrix() {
        if (!animationsEnabled) return;

        matrixCtx.fillStyle = 'rgba(2,4,10,0.06)';
        matrixCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);

        const neon1 = getComputedStyle(document.body).getPropertyValue('--neon-1') || '#00e5ff';
        const neon2 = getComputedStyle(document.body).getPropertyValue('--neon-2') || '#0ea5e9';
        matrixCtx.textBaseline = 'top';

        for (let i = 0; i < matrixCols; i++) {
            const char = Math.random() > 0.5 ? '1' : '0';
            const mix = (i % 6) / 6;
            matrixCtx.fillStyle = interpolateColor(neon1.trim(), neon2.trim(), mix);
            matrixCtx.fillText(char, i * matrixFontSize, matrixDrops[i] * matrixFontSize);

            if ((matrixDrops[i] * matrixFontSize) > window.innerHeight && Math.random() > 0.975) {
                matrixDrops[i] = 0;
            }
            matrixDrops[i]++;
        }

        matrixAnimationId = requestAnimationFrame(drawMatrix);
    }

    cancelAnimationFrame(matrixAnimationId);
    drawMatrix();
}

export function setMatrixEnabled(enabled) {
    animationsEnabled = enabled;
    const particles = document.getElementById('particles');
    if (particles) particles.style.display = enabled ? 'block' : 'none';
    if (enabled) {
        if (!matrixCanvas) initParticles();
    } else {
        cancelAnimationFrame(matrixAnimationId);
    }
}
