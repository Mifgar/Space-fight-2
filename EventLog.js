let EventBoxTimeout = null;
let typingActive = false;
let typingPaused = false; // Pauses typing mid-message without losing progress (used when main menu opens)

function pauseTypewriter() { typingPaused = true; }
function resumeTypewriter() { typingPaused = false; }

// Displays a message in the HUD with a typewriter effect, then hides it after hideDelay ms
function typewriterLog(message, speed = 30, hideDelay = 5000) {
    const logBox = document.getElementById("eventLog");
    if (!logBox) return;

    typingActive = false;
    typingPaused = false;

    logBox.textContent = '';
    clearTimeout(EventBoxTimeout);
    logBox.classList.remove("hidden");

    // Unique Symbol per call — if a new message starts, the old typing loop sees a different token and stops
    const token = Symbol();
    typingActive = token;

    let i = 0;

    function type() {
        if (typingActive !== token) return;

        // Paused (e.g. menu open): wait and retry without advancing the character index
        if (typingPaused) {
            setTimeout(type, 100);
            return;
        }

        if (i < message.length) {
            const char = message.charAt(i);
            logBox.textContent += char;

            const typeVolume = parseFloat(TypeSoundSlider.value);
            const sound = typeSound[Math.floor(Math.random() * typeSound.length)].cloneNode();
            sound.muted = !togglesound;
            sound.volume = Math.min(typeVolume * (Math.random() * 0.4 + 0.6), 1.0);
            sound.play().catch(() => {});

            i++;
            setTimeout(type, speed + Math.random() * 50);
        } else {
            EventBoxTimeout = setTimeout(() => {
                logBox.classList.add("hidden");
            }, hideDelay);
        }
    }

    type();
}