let inSettings = false;
let alreadyExecuted = false;

let Handy_Oben = document.getElementById("Handy_Oben");
let Handy_Unten = document.getElementById("Handy_Unten");
let Handy_shot = document.getElementById("Handy_shot");

let KEY_SPACE = false; // 32
let KEY_UP = false; // 38
let KEY_DOWN = false; // 40
let KEY_ESCAPE = false; // 27
let canvas;
let ctx;
let backgroundImage = new Image();
let gameRunning = true;
let score = 0;

let Ufo_Cooldown = 5000;
let UfoHealth = 1;
let UfoSpeed = 10;
let UfoHpIncreaseScore = 100;

let ShotSpeed = 10;
let Shot_Cooldown = 500;

let PowerUp_Cooldown = 10000;
let lastPowerupState = false;

// Sounds
let togglesound = true;
let laserSound = new Audio("sounds/laser.mp3"); laserSound.volume = 0.05;
let Hintergrundmusik = new Audio("sounds/Hintergrundmusik.mp3"); Hintergrundmusik.volume = 0.02; // 0.02
let hitSound = new Audio("sounds/hit.mp3"); hitSound.volume = 0.4;
let deathSound = new Audio("sounds/death.mp3"); deathSound.volume = 0.45;
let ButtonSound = new Audio("sounds/ButtonSound.mp3"); ButtonSound.volume = 0.4;
let musicOn = true;

let player = {
    x: 50,
    y: 350,
    width: 100,
    height: 50,
    src: 'img/rocket.png',
    maxhealth: 3,
    health: 3,
    invincible: false,
    blink: false,
    powerup: false,
}


let shots = [];
let ufos = [];
let powerups = [];

document.onkeydown = function (e) {
    if (e.key === " ") { // Spacebar
        KEY_SPACE = true;
    }
    if (e.key === "ArrowUp" || e.key === "w") { // Up arrow or "W"
        KEY_UP = true;
    }
    if (e.key === "ArrowDown" || e.key === "s") { // Down arrow or "S"
        KEY_DOWN = true;
    }
    if (e.key === "Escape") {
        KEY_ESCAPE = true;
        ESCAPE_PRESSED();
    }
};

document.onkeyup = function (e) {
    if (e.key === " ") { // Spacebar
        KEY_SPACE = false;
    }
    if (e.key === "ArrowUp" || e.key === "w") { // Up arrow or "W"
        KEY_UP = false;
    }
    if (e.key === "ArrowDown" || e.key === "s") { // Down arrow or "S"
        KEY_DOWN = false;
    }
    if (e.key === "Escape") {
        KEY_ESCAPE = false;
    }
};

Handy_Oben.addEventListener("touchstart", function () {
    KEY_UP = true;
}, {passive: true});
Handy_Oben.addEventListener("touchend", function () {
    KEY_UP = false;
}, {passive: true});
Handy_Unten.addEventListener("touchstart", function () {
    KEY_DOWN = true;
}, {passive: true});
Handy_Unten.addEventListener("touchend", function () {
    KEY_DOWN = false;
}, {passive: true});
Handy_shot.addEventListener("touchstart", function () {
    KEY_SPACE = true;
}, {passive: true});
Handy_shot.addEventListener("touchend", function () {
    KEY_SPACE = false;
}, {passive: true});
    
Handy_Oben.addEventListener("mousedown", function () {
    KEY_UP = true;
}, {passive: true});
Handy_Oben.addEventListener("mouseup", function () {
    KEY_UP = false;
}, {passive: true});
Handy_Unten.addEventListener("mousedown", function () {
    KEY_DOWN = true;
}, {passive: true});
Handy_Unten.addEventListener("mouseup", function () {
    KEY_DOWN = false;
}, {passive: true});
Handy_shot.addEventListener("mousedown", function () {
    KEY_SPACE = true;
}, {passive: true});
Handy_shot.addEventListener("mouseup", function () {
    KEY_SPACE = false;
}, {passive: true});

function startGame() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    gameRunning = true;
    Hintergrundmusik.play();
    Hintergrundmusik.loop = true;
    loadImages();
    draw();
}

function showMainMenu() {
    document.getElementById("MainMenu").classList.remove("hidden");
    document.getElementById("canvas").style.filter = "blur(5px)";
    gameRunning = false;

    Handy_Oben.style.display = "none";
    Handy_Unten.style.display = "none";
    Handy_shot.style.display = "none";

    startBtn.addEventListener("click", () => {
        ButtonSound.play();
    }, {passive: true});

    settingsBtn.addEventListener("click", () => {
        ButtonSound.play();
    }, {passive: true});

    backBtn.addEventListener("click", () => {
        ButtonSound.play();
    }, {passive: true});
}

document.getElementById("settingsBtn").onclick = function () {
    document.getElementById("volumeMenu").classList.remove("hidden");
    inSettings = true;
};

document.getElementById("backBtn").onclick = function () {
    document.getElementById("volumeMenu").classList.add("hidden");
    inSettings = false;
};

function ESCAPE_PRESSED() {
    if (inSettings) {
        document.getElementById("volumeMenu").classList.add("hidden");
        inSettings = false;
        console.log("Settings closed");
    } else if (gameRunning) {
        showMainMenu();
        gameRunning = false;
        console.log("Game closed");
    } else if (!gameRunning && !inSettings) {
        console.log("Menu closed");
        document.getElementById("MainMenu").classList.add("hidden");
        document.getElementById("score").classList.remove("hidden");
        document.getElementById("canvas").style.filter = "none";
        gameRunning = true;
        startRound();
    }}



const MusicSlider = document.getElementById("MainMusicSlider");
const ShotSoundSlider = document.getElementById("ShotSoundSlider");
const MenuSoundSlider = document.getElementById("MenuSoundSlider");

const MusicSliderValue = document.getElementById("MusicSlider-value");
const ShotSliderValue = document.getElementById("ShotSlider-value");
const MenuSliderValue = document.getElementById("MenuSlider-value");


function SliderGradient(slider, valueDisplay, color = "orange", bgColor = "#2c2f4a") {
    const min = parseFloat(slider.min);
    const max = parseFloat(slider.max);
    const val = parseFloat(slider.value);
    const percent = ((val - min) / (max - min)) * 100;
    
    slider.style.background = `linear-gradient(to right, ${color} 0%, ${color} ${percent}%, ${bgColor} ${percent}%, ${bgColor} 100%)`;
    
    const displayPercent = ((val - min) / (max - min)) * 100;
    valueDisplay.textContent = Math.round(displayPercent) + "%";
}
    

function updateVolume() {
    Hintergrundmusik.volume = document.getElementById("MainMusicSlider").value;
    laserSound.volume = document.getElementById("ShotSoundSlider").value;
    ButtonSound.volume = document.getElementById("MenuSoundSlider").value;

    SliderGradient(MusicSlider, MusicSliderValue, "#4de2f2");
    SliderGradient(ShotSoundSlider, ShotSliderValue, "#4de2f2");
    SliderGradient(MenuSoundSlider, MenuSliderValue, "#4de2f2");
}
    MusicSlider.addEventListener("input", updateVolume, {passive: true});
    ShotSoundSlider.addEventListener("input", updateVolume, {passive: true});
    MenuSoundSlider.addEventListener("input", updateVolume, {passive: true});

function toggleSound() {
    if (togglesound) {
        Hintergrundmusik.muted = true;
        laserSound.muted = true;
        ButtonSound.muted = true;
        hitSound.muted = true;
        deathSound.muted = true;
        SoundMuteButton.style.backgroundImage = "url('../img/Mute1.png')";
        togglesound = false;
}   else {
        Hintergrundmusik.muted = false;
        laserSound.muted = false;
        ButtonSound.muted = false;
        hitSound.muted = false;
        deathSound.muted = false;
        SoundMuteButton.style.backgroundImage = "url('../img/Sound1.png')";
        togglesound = true;
    }}
SoundMuteButton.onclick = function () {toggleSound()}

document.getElementById("SettingsButton").onclick = function () {
    showMainMenu();
    document.getElementById("volumeMenu").classList.remove("hidden");
    inSettings = true;
};


function toggleFullscreen() {
    const elem = document.getElementById("GameScreen");
    if (document.fullscreenElement) {
        document.exitFullscreen?.();
        document.webkitExitFullscreen?.();
        document.msExitFullscreen?.();
    } else {
        elem.requestFullscreen?.();
        elem.webkitRequestFullscreen?.();
        elem.msRequestFullscreen?.();
    }
}
FullscreenButton.onclick = function () {toggleFullscreen()}

MobileLayoutcheck.onclick = function () {
    const elements = document.getElementsByClassName("mobile--layout");
    const isVisible = MobileLayoutcheck.checked;

    for (let i = 0; i < elements.length; i++) {
        if (isVisible) {
            elements[i].classList.remove("hidden");
        } else {
            elements[i].classList.add("hidden");
        }
    }
};



document.getElementById("startBtn").onclick = function () {
    document.getElementById("MainMenu").classList.add("hidden");
    document.getElementById("score").classList.remove("hidden");
    document.getElementById("canvas").style.filter = "none";
    gameRunning = true;
    if (player.health <= 0) {player.health = player.maxhealth}
    startRound();
}

function startRound() {
    if (gameRunning && !alreadyExecuted) {
        Handy_Oben.style.display = "block";
        Handy_Unten.style.display = "block";
        Handy_shot.style.display = "block";
        setInterval(update, 1000 / 25);
        Ufo_Interval = setInterval(createUfos, Ufo_Cooldown);
        setInterval(checkCollision, 1000 / 25);
        Shot_Interval = setInterval(createShots, Shot_Cooldown);
        PowerUp_Interval = setInterval(createPowerup, PowerUp_Cooldown);
        alreadyExecuted = true;
        
    }}




function createUfos() {
    if (gameRunning) {
        let ufo = {
            x: canvas.width + 100,
            y: Math.random() * (canvas.height - 50),
            width: 100,
            height: 40,
            src: 'img/ufo.png',
            img: new Image(),
            health: UfoHealth,
            speed: Math.random() * (UfoSpeed) + 5 // Random speed between 5 and UfoSpeed + 5
        }
        ufo.img.src = ufo.src;
        ufos.push(ufo);
        while (score >= UfoHpIncreaseScore) {
            UfoHealth++;
            UfoHpIncreaseScore *=3;
        }

        if (Ufo_Cooldown > 500) {
            Ufo_Cooldown *= 0.95; 
        }
        let randomVariation = Math.random() * 100 - 50; // Random value between -50 and +50
        Ufo_Cooldown = Math.max(500, Ufo_Cooldown + randomVariation); // Ensure cooldown doesn't go below 500
        clearInterval(Ufo_Interval);
        Ufo_Interval = setInterval(createUfos, Ufo_Cooldown);
    }}

function createShots() {
    if (gameRunning && KEY_SPACE) {
            laserSound.play();
            let shot = {
                x: player.x + player.width,
                y: player.y + player.height / 2,
                width: 30,
                height: 3,
                src: 'img/shot.png',
                img: new Image(),
                speed: ShotSpeed,
            };
            shot.img.src = shot.src;
            shots.push(shot);
}}
function createPowerup() {
    if (gameRunning) {
        let powerup = {
        x: 1300,
        y: Math.random() * 750,
        width: 50,
        height: 50,
        src: "../img/crate.jpg",
        img: new Image(),
    }
    powerup.img.src = powerup.src; // PowerUp-bild wird geladen
    powerups.push(powerup);
    PowerUp_Cooldown = Math.random() * (PowerUp_Cooldown) + 5000
    clearInterval(PowerUp_Interval);
    PowerUp_Interval = setInterval(createPowerup, PowerUp_Cooldown);
}}
        


function checkCollision() {
    if (!player.invincible) {
    ufos.forEach(function (ufo) {
    if (player.x < ufo.x + ufo.width &&
        player.x + player.width > ufo.x &&
        player.y < ufo.y + ufo.height &&
        player.y + player.height > ufo.y
    ) {
        ufos = ufos.filter((u) => u != ufo);
        UfoHealth = 0;
        player.health--;
        player.invincible = true;
        player.blink = true;
        
        const blinkInterval = setInterval(() => { // adding a blink animation
                player.blink = !player.blink;
        }, 100);

        setTimeout(() => { // adding an short invincibility with animation
            player.invincible = false;
            player.blink = false;
            clearInterval(blinkInterval);
        }, 1000);

        if (player.health <= 0) {
            score = 0;
            ufos = []; // Clears all ufos and ↓ shots
            shots = [];
            deathSound.play();
            gameRunning = false;
            showMainMenu();
            Ufo_Cooldown = 5000;
            clearInterval(Ufo_Interval);
            Ufo_Interval = setInterval(createUfos, Ufo_Cooldown);
            
      }}
            
        shots.forEach(function (shot) {
            if (
                shot.x < ufo.x + ufo.width &&
                shot.x + shot.width > ufo.x &&
                shot.y < ufo.y + ufo.height &&
                shot.y + shot.height > ufo.y
            ) {
                hitSound.play();
                ufo.health--;
                score += 10;
                shots = shots.filter((s) => s != shot);
                if (ufo.health <= 0) {
                    ufo.img.src = "img/boom.png";
                    ufo.speed = 0;
                    setTimeout(() => {
                        ufos = ufos.filter((u) => u != ufo);
                    }, 200);
                }
            }
        })
        powerups.forEach(function (powerup){
            
        if (player.x < powerup.x + powerup.width &&
            player.x + player.width > powerup.x &&
            player.y < powerup.y + powerup.height &&
            player.y + player.height > powerup.y
    )       {
            powerups = powerups.filter((p) => p != powerup);
            player.powerup = true;
            ShotSpeed *= 1;
            setTimeout(() => {
                player.powerup = false;;
            }, 5000);
            }
        })
})}};
        


function update() {
    if (gameRunning) {
        if (KEY_UP && player.y > 0) {
            player.y -= 5;
        }
        if (KEY_DOWN && player.y + player.height < canvas.height) {
            player.y += 5;
        }
    
        ufos.forEach(function (ufo) {
            ufo.x -= ufo.speed;
        })
        if (player.powerup !== lastPowerupState) {
            clearInterval(Shot_Interval);
            if (player.powerup) {
                Shot_Cooldown = 250;
                laserSound.playbackRate = 2;
            } else {
                Shot_Cooldown = 500;
                laserSound.playbackRate = 1;
                ShotSpeed = 10;
            }
            Shot_Interval = setInterval(createShots, Shot_Cooldown);
            lastPowerupState = player.powerup; // On Off Switch lastPowerupState is Negative to the powerup 
        }
        shots.forEach(function (shot) {
                shot.x += shot.speed;
        })
        powerups.forEach(function (powerup) {
          powerup.x -= 15;
        });
}}

function updateScore() {
    document.getElementById("score").innerHTML = "Score: " + score;
}

function loadImages() {
    backgroundImage.src = 'img/background.png';
    player.img = new Image;
    player.img.src = player.src;
}


function draw() {
    ctx.drawImage(backgroundImage, 0, 0);

    
    ufos.forEach(function (ufo) {
        ctx.drawImage(ufo.img, ufo.x, ufo.y, ufo.width, ufo.height);
    });
    shots.forEach(function (shot) {
        ctx.drawImage(shot.img, shot.x, shot.y, shot.width, shot.height);
    });
    powerups.forEach(function (powerup) {
        ctx.drawImage(powerup.img, powerup.x, powerup.y, powerup.width, powerup.height);
    });

    updateScore();
    requestAnimationFrame(draw);

    if (player.invincible && player.blink) return;
    ctx.drawImage(player.img, player.x, player.y, player.width, player.height);
}