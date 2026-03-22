let EventBoxTimeout = null;

function typewriterLog(message, speed = 30, hideDelay = 5000) {
    const logBox = document.getElementById("eventLog");
    if (!logBox) return;

    logBox.textContent = '';
    clearTimeout(EventBoxTimeout);
    logBox.classList.remove("hidden");
    let i = 0;

    function type() {
        if (i < message.length) {
            const char = message.charAt(i);
            logBox.textContent += char;

            const typeVolume = parseFloat(TypeSoundSlider.value);
            const sound = typeSound[Math.floor(Math.random() * typeSound.length)].cloneNode();
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

