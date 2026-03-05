// engine.js

/** 
 * STATE MANAGEMENT 
 * We track the video state to sync UI and DOM 
 */
const state = {
    video: document.getElementById('main-video'),
    isPlaying: false,
    scale: 100,
    posX: 0,
    posY: 0,
    rotation: 0,
    opacity: 100
};

// 1. FILE LOADER SYSTEM
document.getElementById('file-upload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const url = URL.createObjectURL(file);
        state.video.src = url;
        // Auto-play logic
        state.video.onloadedmetadata = () => {
            document.querySelector('.time-display').innerText = `00:00 / ${formatTime(state.video.duration)}`;
        };
        console.log("Video Loaded:", file.name);
    }
});

// 2. PLAYBACK ENGINE
const playBtn = document.getElementById('play-toggle');
const playhead = document.querySelector('.playhead');

playBtn.addEventListener('click', togglePlay);
state.video.addEventListener('click', togglePlay); // Click video to play/pause

function togglePlay() {
    if (state.video.paused) {
        state.video.play();
        playBtn.classList.replace('fa-play-circle', 'fa-pause-circle');
        requestAnimationFrame(updateLoop);
    } else {
        state.video.pause();
        playBtn.classList.replace('fa-pause-circle', 'fa-play-circle');
    }
}

// The Heartbeat: Runs every frame video is playing
function updateLoop() {
    if (!state.video.paused) {
        const pct = (state.video.currentTime / state.video.duration) * 100;
        
        // Update Timecode
        document.getElementById('time-display').innerText = 
            `${formatTime(state.video.currentTime)} / ${formatTime(state.video.duration)}`;
            
        // Move Playhead (Simple CSS Left %)
        playhead.style.left = `${pct}%`; 
        
        requestAnimationFrame(updateLoop);
    }
}

// 3. REACTIVE PROPERTIES (The "Edit" Functionality)
// We attach listeners to all sliders with specific data-binding

function updateTransform() {
    // Compose the CSS Transform string
    state.video.style.transform = `
        translate(${state.posX}px, ${state.posY}px) 
        scale(${state.scale / 100}) 
        rotate(${state.rotation}deg)
    `;
    state.video.style.opacity = state.opacity / 100;
}

// Bind Sliders
document.querySelectorAll('.prop-slider').forEach(slider => {
    slider.addEventListener('input', (e) => {
        const prop = e.target.dataset.prop; // You need to add data-prop="scale" to HTML sliders
        const val = parseFloat(e.target.value);
        
        // Update State
        state[prop] = val;
        
        // Update UI Value Text
        e.target.previousElementSibling.querySelector('.value-display').innerText = val;
        
        // Apply to Video
        updateTransform();
    });
});

// 4. HELPER: Time Formatter
function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
}

// 5. ADD TEXT FUNCTIONALITY (CapCut Style)
// Call this function when "Text" tool is clicked
function addTextLayer() {
    const overlay = document.createElement('div');
    overlay.className = 'overlay-text active';
    overlay.contentEditable = true;
    overlay.innerText = "Double Click to Edit";
    
    // Simple Drag Logic
    let isDragging = false;
    overlay.addEventListener('mousedown', () => isDragging = true);
    window.addEventListener('mouseup', () => isDragging = false);
    window.addEventListener('mousemove', (e) => {
        if (isDragging) {
            overlay.style.left = `${e.clientX - overlay.offsetWidth/2}px`;
            overlay.style.top = `${e.clientY - overlay.offsetHeight/2}px`;
        }
    });
    
    document.getElementById('overlay-layer').appendChild(overlay);
}
