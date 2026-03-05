// STATE MANAGEMENT
const state = {
    video: document.getElementById('main-video'),
    isPlaying: false,
    scale: 100,
    posX: 0,
    posY: 0,
    rotation: 0,
    opacity: 100,
    blendMode: 'normal'
};

// DOM ELEMENTS
const playBtn = document.getElementById('play-toggle');
const timeDisplay = document.getElementById('time-display');
const playhead = document.getElementById('playhead');
const sliders = document.querySelectorAll('.prop-slider');
const overlayLayer = document.getElementById('overlay-layer');

// 1. FILE UPLOAD HANDLER
document.getElementById('file-upload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const url = URL.createObjectURL(file);
        state.video.src = url;
        // Reset state
        state.video.style.transform = 'none';
        playBtn.classList.replace('fa-pause-circle', 'fa-play-circle');
        console.log(`Loaded: ${file.name}`);
    }
});

// 2. PLAYBACK ENGINE
playBtn.addEventListener('click', togglePlay);
state.video.addEventListener('click', togglePlay);

function togglePlay() {
    if (state.video.paused) {
        state.video.play();
        playBtn.classList.replace('fa-play-circle', 'fa-pause-circle');
        state.isPlaying = true;
        requestAnimationFrame(updateLoop);
    } else {
        state.video.pause();
        playBtn.classList.replace('fa-pause-circle', 'fa-play-circle');
        state.isPlaying = false;
    }
}

// MAIN RENDER LOOP
function updateLoop() {
    if (!state.video.paused) {
        // Update Timecode
        const current = state.video.currentTime;
        const total = state.video.duration || 0;
        timeDisplay.innerText = `${formatTime(current)} / ${formatTime(total)}`;

        // Move Playhead (Visual simulation)
        // In a real app, this would map to pixels. Here we map 0-100% of track width
        const progress = (current / total) * 100;
        playhead.style.left = `calc(${progress}% + 60px)`; // 60px is header offset

        requestAnimationFrame(updateLoop);
    }
}

function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
}

// 3. REACTIVE PROPERTIES (The "Edit" Logic)
sliders.forEach(slider => {
    slider.addEventListener('input', (e) => {
        const prop = e.target.dataset.prop;
        const val = parseFloat(e.target.value);
        
        // Update Internal State
        state[prop] = val;
        
        // Update UI Text
        const display = e.target.previousElementSibling.querySelector('.value-display');
        if (display) {
            const suffix = prop === 'rotation' ? '°' : (prop === 'opacity' || prop === 'scale' ? '%' : 'px');
            display.innerText = val + suffix;
        }
        
        // Apply to Video DOM
        updateVideoStyles();
    });
});

document.getElementById('blend-mode').addEventListener('change', (e) => {
    state.video.style.mixBlendMode = e.target.value;
});

function updateVideoStyles() {
    state.video.style.transform = `
        translate(${state.posX}px, ${state.posY}px) 
        scale(${state.scale / 100}) 
        rotate(${state.rotation}deg)
    `;
    state.video.style.opacity = state.opacity / 100;
}

// 4. TEXT LAYER SYSTEM
document.getElementById('add-text-btn').addEventListener('click', addTextLayer);

function addTextLayer() {
    const el = document.createElement('div');
    el.contentEditable = true;
    el.className = 'overlay-text active';
    el.innerText = 'DOUBLE CLICK EDIT';
    
    // Initial Position
    el.style.left = '50%';
    el.style.top = '50%';
    
    // Drag Functionality
    let isDragging = false;
    let startX, startY;

    el.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX - el.offsetLeft;
        startY = e.clientY - el.offsetTop;
        // Set active style
        document.querySelectorAll('.overlay-text').forEach(t => t.classList.remove('active'));
        el.classList.add('active');
    });

    window.addEventListener('mousemove', (e) => {
        if (isDragging) {
            el.style.left = `${e.clientX - startX}px`;
            el.style.top = `${e.clientY - startY}px`;
        }
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
    });

    overlayLayer.appendChild(el);
}
