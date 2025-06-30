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

// Wave system variables
const maxWaves = 10; // Maximum number of waves
let currentWave = 1;


let Ufo_Cooldown = 5000;
let currentUfo_Cooldown = 5000;
let UfoHealth = 1;
let UfoSpeed = 10;

let ShotSpeed = 10;
let Shot_Cooldown = 500;

let PowerUp_Cooldown = 10000;
let lastPowerupState = false;

// Sounds
let togglesound = true;
let shotSound = new Audio("sounds/laser.mp3"); shotSound.volume = 0.05;
let backgroundmusic = new Audio("sounds/backgroundmusic.mp3"); backgroundmusic.volume = 0.02; // 0.02
let hitSound = new Audio("sounds/hit.mp3"); hitSound.volume = 0.4;
let ButtonSound = new Audio("sounds/ButtonSound.mp3"); ButtonSound.volume = 0.4;
let deathSound = new Audio("sounds/death.mp3"); deathSound.volume = 0.45;

const GameData = {
    musicVolume: backgroundmusic.volume,
    shotVolume: shotSound.volume,
    hitVolume: hitSound.volume,
    menuVolume: ButtonSound.volume,
    Sound: togglesound,
    TotalKills: 0,
    BestScore: 0,
};

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
let hearts = [];

// Event listeners for keyboard input
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
    backgroundmusic.loop = true;
    loadData();
    loadImages();
    draw();
}

// Show the main menu
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

// Start the wave system
function startWave() {
    console.log(`Wave ${currentWave} started! Boss will arrive shortly...`);

    setTimeout(() => {
        boss = createBossForWave(currentWave);
        console.log(`Boss ${boss.name} has arrived!`);
    }, 1 * 60 * 100);
}


function nextWave() {
    if (currentWave < maxWaves) {
        currentWave++;
        UfoHealth++
        currentUfo_Cooldown = Ufo_Cooldown
        clearInterval(Ufo_Interval);
        Ufo_Interval = setInterval(createUfos, currentUfo_Cooldown);
        startWave();
    } else {
        console.log("All waves completed!");
        endlessMode();
    }
}

// Key event for starting the next wave
document.addEventListener('keydown', (e) => {
    if (e.key === 'e') {
        if (boss && boss.defeated) {
            nextWave();
        } else if (boss) {
            console.log("Defeat the boss before proceeding!");
    }
}});
function endlessMode() {
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
    } else if (!gameRunning && !inSettings) {
        document.getElementById("MainMenu").classList.add("hidden");
        document.getElementById("score").classList.remove("hidden");
        document.getElementById("canvas").style.filter = "none";
        gameRunning = true;
        startRound();
    }
}

// Volume control
const MusicSlider = document.getElementById("MainMusicSlider");
const ShotSoundSlider = document.getElementById("ShotSoundSlider");
const HitSoundSlider = document.getElementById("HitSoundSlider");
const MenuSoundSlider = document.getElementById("MenuSoundSlider");

const MusicSliderValue = document.getElementById("MusicSlider-value");
const ShotSliderValue = document.getElementById("ShotSlider-value");
const HitSliderValue = document.getElementById("HitSlider-value");
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
    backgroundmusic.volume = document.getElementById("MainMusicSlider").value;
    shotSound.volume = document.getElementById("ShotSoundSlider").value;
    hitSound.volume = document.getElementById("HitSoundSlider").value;
    ButtonSound.volume = document.getElementById("MenuSoundSlider").value;

    GameData.musicVolume = backgroundmusic.volume;
    GameData.shotVolume = shotSound.volume;
    GameData.hitVolume = hitSound.volume;
    GameData.menuVolume = ButtonSound.volume;
    saveData();

    SliderGradient(MusicSlider, MusicSliderValue, "#4de2f2");
    SliderGradient(ShotSoundSlider, ShotSliderValue, "#4de2f2");
    SliderGradient(HitSoundSlider, HitSliderValue, "#4de2f2");
    SliderGradient(MenuSoundSlider, MenuSliderValue, "#4de2f2");
}
MusicSlider.addEventListener("input", updateVolume, {passive: true});
ShotSoundSlider.addEventListener("input", updateVolume, {passive: true});
HitSoundSlider.addEventListener("input", updateVolume, {passive: true});
MenuSoundSlider.addEventListener("input", updateVolume, {passive: true});

function toggleSound() {
    if (togglesound) {
        backgroundmusic.muted = true;
        shotSound.muted = true;
        ButtonSound.muted = true;
        hitSound.muted = true;
        deathSound.muted = true;
        SoundMuteButton.style.backgroundImage = "url('../img/Mute1.png')";
        togglesound = false;
        GameData.Sound = togglesound;
        saveData();
    } else {
        backgroundmusic.muted = false;
        shotSound.muted = false;
        ButtonSound.muted = false;
        hitSound.muted = false;
        deathSound.muted = false;
        SoundMuteButton.style.backgroundImage = "url('../img/Sound1.png')";
        togglesound = true;
        GameData.Sound = togglesound;
        saveData();
    }
}
SoundMuteButton.onclick = function () { toggleSound() }

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
FullscreenButton.onclick = function () { toggleFullscreen() }

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

function toggleMobileLayout() {
    if (MobileLayoutcheck.checked) {
        Handy_Oben.style.display = "block";
        Handy_Unten.style.display = "block";
        Handy_shot.style.display = "block";
    } else {
        Handy_Oben.style.display = "none";
        Handy_Unten.style.display = "none";
        Handy_shot.style.display = "none";
    }
}

document.getElementById("startBtn").onclick = function () {
    document.getElementById("MainMenu").classList.add("hidden");
    document.getElementById("score").classList.remove("hidden");
    document.getElementById("canvas").style.filter = "none";
    gameRunning = true;
    if (player.health <= 0) { player.health = player.maxhealth };
    startRound();
}

function startRound() {
    if (gameRunning && !alreadyExecuted) {
        backgroundmusic.play();
        setInterval(update, 1000 / 25);
        Ufo_Interval = setInterval(createUfos, currentUfo_Cooldown);
        setInterval(checkCollision, 1000 / 25);
        Shot_Interval = setInterval(createShots, Shot_Cooldown);
        PowerUp_Interval = setInterval(createPowerup, PowerUp_Cooldown);
        alreadyExecuted = true;
        startWave(); // Start the first wave
    }
    toggleMobileLayout();
}

function createUfos() {
    if (gameRunning) {
        let ufo = {
            x: canvas.width + 100,
            y: Math.random() * (canvas.height - 50),
            width: 100,
            height: 45,
            src: 'img/ufo.png',
            img: new Image(),
            health: UfoHealth,
            speed: Math.random() * (UfoSpeed) + 5 // Random speed between 5 and UfoSpeed + 5
        }
        ufo.img.src = ufo.src;
        ufos.push(ufo);

        if (currentUfo_Cooldown > 500) {
            currentUfo_Cooldown *= 0.95;
        }
        clearInterval(Ufo_Interval);
        Ufo_Interval = setInterval(createUfos, currentUfo_Cooldown);
    }
}

function createShots() {
    if (gameRunning && KEY_SPACE) {
        shotSound.play();
        let shot = {
            x: player.x + player.width,
            y: player.y + player.height / 2,
            width: 30,
            height: 3,
            src: 'img/shot.png',
            img: new Image(),
            speed: ShotSpeed,
            damage: 1,
        };
        shot.img.src = shot.src;
        shots.push(shot);
    }
}

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
        powerup.img.src = powerup.src; // PowerUp image is loaded
        powerups.push(powerup);
        PowerUp_Cooldown = Math.random() * (PowerUp_Cooldown) + 5000
        clearInterval(PowerUp_Interval);
        PowerUp_Interval = setInterval(createPowerup, PowerUp_Cooldown);
    }
}

function BossShooting() {
        if (boss && !boss.defeated) {
            boss_Shot_Interval = setInterval(() => {
                boss.shoot()
            }, boss.shotCooldown);
        }
}

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

                setTimeout(() => { // adding a short invincibility with animation
                    player.invincible = false;
                    player.blink = false;
                    clearInterval(blinkInterval);
                }, 1000);

                if (player.health <= 0) {
                    if (score > GameData.BestScore) {
                        GameData.BestScore = score;
                        saveData();
                    }
                    score = 0;
                    ufos = []; // Clears all ufos and shots
                    shots = [];
                    deathSound.play();
                    gameRunning = false;
                    showMainMenu();
                    currentUfo_Cooldown = 5000;
                    clearInterval(Ufo_Interval);
                    Ufo_Interval = setInterval(createUfos, currentUfo_Cooldown);
                }
            }
            if (ufo.x < canvas.width * -1 + 500) { // the ufo can go 500px off screen
                ufos = ufos.filter((u) => u != ufo);
            }

            shots.forEach(function (shot) {
                if (
                    shot.x < ufo.x + ufo.width &&
                    shot.x + shot.width > ufo.x &&
                    shot.y < ufo.y + ufo.height &&
                    shot.y + shot.height > ufo.y
                ) {
                    hitSound.play();
                    ufo.health -= shot.damage
                    score += 10;
                    shots = shots.filter((s) => s != shot);
                    if (ufo.health <= 0) {
                        GameData.TotalKills++;
                        ufo.img.src = "img/boom.png";
                        ufo.speed = 0;
                        setTimeout(() => {
                            ufos = ufos.filter((u) => u != ufo);
                        }, 200);
                    }
                }
                if (boss && !boss.defeated) {
                    if (
                        shot.x < boss.x + boss.width &&
                        shot.x + shot.width > boss.x &&
                        shot.y < boss.y + boss.height &&
                        shot.y + shot.height > boss.y
                    ) {
                        GameData.TotalKills++;
                        hitSound.play();
                        boss.takeDamage(shot.damage);  
                        shots = shots.filter((s) => s !== shot);
                    }
                }

                if (shot.x > canvas.width) {
                    shots = shots.filter((s) => s != shot);
                }
            })})
            powerups.forEach(function (powerup) {
                if (player.x < powerup.x + powerup.width &&
                    player.x + player.width > powerup.x &&
                    player.y < powerup.y + powerup.height &&
                    player.y + player.height > powerup.y
                ) {
                    powerups = powerups.filter((p) => p != powerup);
                    player.powerup = true;
                    ShotSpeed *= 1;
                    setTimeout(() => {
                        player.powerup = false;
                    }, 5000);
                }})
                
        if (boss && !boss.defeated) {
            boss.shots.forEach(function (bossShot) {
        if (
            player.x < bossShot.x + bossShot.width &&
            player.x + player.width > bossShot.x &&
            player.y < bossShot.y + bossShot.height &&
            player.y + player.height > bossShot.y
        ) {
            // Only take damage if not invincible
            if (!player.invincible) {
                player.health--;
                player.invincible = true;
                player.blink = true;

                const blinkInterval = setInterval(() => {
                    player.blink = !player.blink;
                }, 100);

                setTimeout(() => {
                    player.invincible = false;
                    player.blink = false;
                    clearInterval(blinkInterval);
                }, 1000);

                // Remove the boss shot after hit
                boss.shots = boss.shots.filter(s => s !== bossShot);

                if (player.health <= 0) {
                    score = 0;
                    ufos = [];
                    shots = [];
                    deathSound.play();
                    gameRunning = false;
                    showMainMenu();
                    currentUfo_Cooldown = 5000;
                    clearInterval(Ufo_Interval);
                    Ufo_Interval = setInterval(createUfos, currentUfo_Cooldown);
                }}}});
            }
        }
    }

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
                shotSound.playbackRate = 2;
            } else {
                Shot_Cooldown = 500;
                shotSound.playbackRate = 1;
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

        if (boss && !boss.defeated) {
            boss.update(shots);
            boss.updateShots();
            BossShooting();
        }
}}

function updateScore() {
    document.getElementById("score").innerHTML = "Score: " + score;
}

function loadImages() {
    backgroundImage.src = 'img/background.png';
    player.img = new Image;
    player.img.src = player.src;
}

const heartImage = new Image();
heartImage.src = 'img/heart.png'; // your heart icon


function updateHearts() {
    hearts = [];
    for (let i = 0; i < player.health; i++) {
        hearts.push({
            x: player.x + i * 25 + 15,
            y: player.y + 50,
            width: 20,
            height: 20,
        });
    }
}

function drawHearts() {
    hearts.forEach((heart) => {
        ctx.drawImage(heartImage, heart.x, heart.y, heart.width, heart.height);
    });
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

    if (boss && !boss.defeated) {
        boss.draw(ctx);
        boss.drawShots(ctx);
    }


    updateHearts();
    drawHearts();

    updateScore();
    requestAnimationFrame(draw);

    if (player.invincible && player.blink) return;
    ctx.drawImage(player.img, player.x, player.y, player.width, player.height);
}

function saveData() {
    console.log(GameData);
    localStorage.setItem('GameData', JSON.stringify(GameData));
}

function loadData() {
    const saved = localStorage.getItem('GameData');
    if (saved) {
        const data = JSON.parse(saved);
        Object.assign(GameData, parsed);
        GameData.score = data.score ?? 0;
    }
    // Apply loaded settings to audio and sliders
    backgroundmusic.volume = GameData.musicVolume;
    shotSound.volume = GameData.shotVolume;
    hitSound.volume = GameData.hitVolume;
    ButtonSound.volume = GameData.menuVolume;
    backgroundmusic.muted = shotSound.muted = ButtonSound.muted = hitSound.muted = deathSound.muted = GameData.muted;

    // Update slider UI if needed
    MusicSlider.value = GameData.musicVolume;
    ShotSoundSlider.value = GameData.shotVolume;
    HitSoundSlider.value = GameData.hitVolume;
    MenuSoundSlider.value = GameData.menuVolume;
}

window.addEventListener('beforeunload', saveData);