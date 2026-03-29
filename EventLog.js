let EventBoxTimeout = null;
let typingActive = false;
let typingPaused = false; // Set this to pause/resume the typewriter without cancelling it

function pauseTypewriter() { typingPaused = true; }
function resumeTypewriter() { typingPaused = false; }

function typewriterLog(message, speed = 30, hideDelay = 5000) {
    const logBox = document.getElementById("eventLog");
    if (!logBox) return;

    typingActive = false;
    typingPaused = false;

    logBox.textContent = '';
    clearTimeout(EventBoxTimeout);
    logBox.classList.remove("hidden");

    const token = Symbol();
    typingActive = token;

    let i = 0;

    function type() {
        if (typingActive !== token) return;

        // If paused, check again in 100ms without advancing
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