import { interpolateColor } from './utils.js';

let matrixCanvas, matrixCtx;
let matrixCols = 0;
let matrixDrops = [];
let matrixFontSize = 14;
let matrixAnimationId = null;
let animationsEnabled = true;
let initialized = false;

/* Japanese character pools (kanji / hiragana / katakana) */
const kanji = ['夢', '花', '風', '光', '影', '海', '星', '道', '心', '力', '時', '雨', '雪', '月', '森', '空', '海', '彩', '龍', '祭'];
const hiragana = ['あ', 'い', 'う', 'え', 'お', 'か', 'き', 'く', 'け', 'こ', 'さ', 'し', 'す', 'せ', 'そ', 'た', 'ち', 'つ', 'て', 'と', 'な', 'に', 'の'];
const katakana = ['ア', 'イ', 'ウ', 'エ', 'オ', 'カ', 'キ', 'ク', 'ケ', 'コ', 'サ', 'シ', 'ス', 'セ', 'ソ', 'タ', 'チ', 'ツ', 'テ', 'ト', 'ナ', 'ニ', 'ノ'];

/* perf: throttle to ~30 FPS */
const TARGET_FPS = 30;
const FRAME_INTERVAL = 1000 / TARGET_FPS;
let _lastFrameTime = 0;

function randChar() {
    const r = Math.random();
    if (r < 0.45) return kanji[Math.floor(Math.random() * kanji.length)];
    if (r < 0.75) return katakana[Math.floor(Math.random() * katakana.length)];
    return hiragana[Math.floor(Math.random() * hiragana.length)];
}

/* build a short 'word' of 1-3 Japanese characters */
function randomJapaneseWord() {
    const len = Math.random() < 0.7 ? 1 : (Math.random() < 0.6 ? 2 : 3);
    let s = '';
    for (let i = 0; i < len; i++) s += randChar();
    return s;
}

function drawMatrix(ts) {
    if (!ts) ts = performance.now();
    if (ts - _lastFrameTime < FRAME_INTERVAL) {
        matrixAnimationId = requestAnimationFrame(drawMatrix);
        return;
    }
    _lastFrameTime = ts;

    if (!animationsEnabled || !matrixCtx || !matrixCanvas) return;

    // fade previous frame slightly (no tracing lines, just soft persistence)
    matrixCtx.fillStyle = 'rgba(2,4,10,0.06)';
    matrixCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);

    const neon1 = getComputedStyle(document.body).getPropertyValue('--neon-1') || '#00e5ff';
    const neon2 = getComputedStyle(document.body).getPropertyValue('--neon-2') || '#0ea5e9';
    matrixCtx.textBaseline = 'top';

    // ensure font supports Japanese (Noto Sans JP fallback)
    matrixCtx.font = `${matrixFontSize}px "Noto Sans JP", "Hiragino Kaku Gothic ProN", "Meiryo", sans-serif`;

    // draw one short Japanese "word" per column (lighter than long tails)
    matrixCtx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < matrixCols; i++) {
        const x = i * matrixFontSize;
        const y = (matrixDrops[i] * matrixFontSize);

        // produce a short word (1-3 chars)
        const text = randomJapaneseWord();

        // color gradient per column for neon variation
        const mix = (i % 6) / 6;
        matrixCtx.fillStyle = interpolateColor(neon1.trim(), neon2.trim(), mix);

        // slight alpha variance for depth
        matrixCtx.globalAlpha = 0.95 - Math.min(0.35, Math.random() * 0.2);

        matrixCtx.fillText(text, x, y);

        // advance drop (use fractional speed for variety)
        matrixDrops[i] += 0.9 + Math.random() * 0.9;

        // reset occasionally with a small random offset to avoid uniformity
        if ((matrixDrops[i] * matrixFontSize) > window.innerHeight && Math.random() > 0.975) {
            matrixDrops[i] = -Math.floor(Math.random() * 20);
        }
    }
    matrixCtx.globalAlpha = 1;
    matrixCtx.globalCompositeOperation = 'source-over';

    matrixAnimationId = requestAnimationFrame(drawMatrix);
}

function startMatrix() {
    animationsEnabled = true;
    const particles = document.getElementById('particles');
    if (particles) particles.style.display = 'block';
    if (matrixAnimationId) cancelAnimationFrame(matrixAnimationId);
    _lastFrameTime = 0;
    matrixAnimationId = requestAnimationFrame(drawMatrix);
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

/* initParticles with guarded initialization and resize handling */
export function initParticles() {
    const container = document.getElementById('particles');
    if (!container) return;

    if (!matrixCanvas) {
        matrixCanvas = document.createElement('canvas');
        matrixCanvas.id = 'matrixCanvas';
        matrixCanvas.style.width = '100%';
        matrixCanvas.style.height = '100%';
        container.appendChild(matrixCanvas);
        matrixCtx = matrixCanvas.getContext('2d');
        matrixCtx.imageSmoothingEnabled = true;
    }

    const fit = () => {
        const dpr = window.devicePixelRatio || 1;
        matrixCanvas.width = Math.floor(window.innerWidth * dpr);
        matrixCanvas.height = Math.floor(window.innerHeight * dpr);
        matrixCtx.setTransform(1, 0, 0, 1, 0, 0);
        matrixCtx.scale(dpr, dpr);

        // font size tuned for Japanese glyphs
        matrixFontSize = Math.max(12, Math.min(28, Math.floor(window.innerWidth / 110)));
        matrixCtx.font = `${matrixFontSize}px "Noto Sans JP", "Hiragino Kaku Gothic ProN", "Meiryo", sans-serif`;

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

    if (animationsEnabled) startMatrix();
}

export function setMatrixEnabled(enabled) {
    if (enabled) {
        startMatrix();
    } else {
        stopMatrix();
    }
}
