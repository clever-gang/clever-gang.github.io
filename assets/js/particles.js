import { interpolateColor } from './utils.js';

let matrixCanvas, matrixCtx;
let matrixCols = 0;
let matrixDrops = [];
let matrixFontSize = 14;
let matrixAnimationId = null;
let animationsEnabled = true;
let initialized = false;

/* draw loop moved to module scope so it can be started/stopped reliably */
function drawMatrix() {
    if (!animationsEnabled || !matrixCtx || !matrixCanvas) return;

    // semi-transparent overlay to fade previous frame
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

function startMatrix() {
    animationsEnabled = true;
    const particles = document.getElementById('particles');
    if (particles) particles.style.display = 'block';
    // ensure we don't have an outstanding frame
    if (matrixAnimationId) cancelAnimationFrame(matrixAnimationId);
    // start the draw loop
    drawMatrix();
}

function stopMatrix() {
    animationsEnabled = false;
    if (matrixAnimationId) {
        cancelAnimationFrame(matrixAnimationId);
        matrixAnimationId = null;
    }
    const particles = document.getElementById('particles');
    if (particles) particles.style.display = 'none';
}

/* initParticles now guards against re-initialization and wires up resize/visibility handlers once */
export function initParticles() {
    const container = document.getElementById('particles');
    if (!container) return;

    // create canvas only once
    if (!matrixCanvas) {
        matrixCanvas = document.createElement('canvas');
        matrixCanvas.id = 'matrixCanvas';
        matrixCanvas.style.width = '100%';
        matrixCanvas.style.height = '100%';
        container.appendChild(matrixCanvas);
        matrixCtx = matrixCanvas.getContext('2d');
    }

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

    if (!initialized) {
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
            if (document.hidden) {
                stopMatrix();
            } else {
                startMatrix();
            }
        });

        initialized = true;
    }

    // start the animation
    if (animationsEnabled) startMatrix();
}

/* setMatrixEnabled now reliably starts/stops the loop */
export function setMatrixEnabled(enabled) {
    if (enabled) {
        startMatrix();
    } else {
        stopMatrix();
    }
}
