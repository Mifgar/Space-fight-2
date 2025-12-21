let EventBoxTimeout = null;
const typeVolume = TypeSoundSlider.value;

function typewriterLog(message, speed = 30, hideDelay = 5000) {
    const logBox = document.getElementById("eventLog");
    if (!logBox) return console.warn("eventLog element not found.");
    logBox.textContent = '';
    clearTimeout(EventBoxTimeout);
    logBox.classList.remove("hidden");
    let i = 0;

    function type() {
        if (i < message.length) {
            const char = message.charAt(i); // the character from the number for e.g. "hello" 1 for "h" and so on
            logBox.textContent += char;

            const sound = typeSound[Math.floor(Math.random() * typeSound.length)].cloneNode();
            sound.volume = (typeVolume > 0) ? typeVolume * (Math.random() * 1.2) : 0; 
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

