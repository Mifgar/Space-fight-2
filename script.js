let inSettings = false;
let alreadyExecuted = false;
let bossJustDefeated = false; // Tracks if we already showed the "press E" hint this wave

let gameOver = false;

// Explicit DOM references — no more implicit ID globals
const Handy_Oben = document.getElementById("Handy_Oben");
const Handy_Unten = document.getElementById("Handy_Unten");
const Handy_shot = document.getElementById("Handy_shot");
const SoundMuteButton = document.getElementById("SoundMuteButton");
const FullscreenButton = document.getElementById("FullscreenButton");
const MobileLayoutcheck = document.getElementById("MobileLayoutcheck");
const startBtn = document.getElementById("startBtn");
const settingsBtn = document.getElementById("settingsBtn");
const backBtn = document.getElementById("backBtn");
const restartBtn = document.getElementById("restartBtn");

let KEY_SPACE = false;
let KEY_UP = false;
let KEY_DOWN = false;
let KEY_ESCAPE = false;
let canvas;
let ctx;
let rafId = null; // Stores the requestAnimationFrame id so it can be cancelled if needed
let backgroundImage = new Image();
let gameRunning = true;
let score = 0;
let scoreMult = 1;
let killStreak = 0;

// Wave system
const maxWaves = 10;
let currentWave = 1;

// All intervals declared upfront — no more implicit globals
let Ufo_Interval;
let Shot_Interval;
let PowerUp_Interval;
let boss_Shot_Interval = null;

let Ufo_Cooldown = 5000;
let currentUfo_Cooldown = 5000;
let UfoHealth = 1;
let UfoSpeed = 10;

let ShotSpeed = 10;
let Shot_Cooldown = 500;

let PowerUp_Cooldown = 10000;
let lastPowerupState = false;
let bossActivitys = false;

// Sounds
let togglesound = true;
const Sounds = {
    shot: new Audio("sounds/laser.mp3"),
    music: new Audio("sounds/music.mp3"),
    hit: new Audio("sounds/hit.mp3"),
    button: new Audio("sounds/ButtonSound.mp3"),
    death: new Audio("sounds/death.mp3"),
    type: new Audio("sounds/type.mp3"),
    softType: new Audio("sounds/soft-type.mp3"),
    hardType: new Audio("sounds/hard-type.mp3"),
};
const typeSound = [
    Sounds.type,
    Sounds.softType,
    Sounds.hardType
];

// Initial volume values
Sounds.shot.volume = 0.05;
Sounds.music.volume = 0.02;
Sounds.hit.volume = 0.4;
Sounds.button.volume = 0.4;
Sounds.death.volume = 0.45;

const GameData = {
    musicVolume: Sounds.music.volume,
    shotVolume: Sounds.shot.volume,
    hitVolume: Sounds.hit.volume,
    menuVolume: Sounds.button.volume,
    typeVolume: typeSound[0].volume,
    Sound: togglesound,
    muted: false,
    TotalKills: 0,
    currentKills: 0,
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
    speed: 5,
    invincible: false,
    blink: false,
    powerup: false,
};

let shots = [];
let ufos = [];
let powerups = [];

// Keyboard input
document.onkeydown = function (e) {
    if (e.key === " ") KEY_SPACE = true;
    if (e.key === "ArrowUp" || e.key === "w") KEY_UP = true;
    if (e.key === "ArrowDown" || e.key === "s") KEY_DOWN = true;
    if (e.key === "Escape") {
        KEY_ESCAPE = true;
        ESCAPE_PRESSED();
    }
};

document.onkeyup = function (e) {
    if (e.key === " ") KEY_SPACE = false;
    if (e.key === "ArrowUp" || e.key === "w") KEY_UP = false;
    if (e.key === "ArrowDown" || e.key === "s") KEY_DOWN = false;
    if (e.key === "Escape") KEY_ESCAPE = false;
};

// Touch controls
Handy_Oben.addEventListener("touchstart", () => { KEY_UP = true; }, { passive: true });
Handy_Oben.addEventListener("touchend", () => { KEY_UP = false; }, { passive: true });
Handy_Unten.addEventListener("touchstart", () => { KEY_DOWN = true; }, { passive: true });
Handy_Unten.addEventListener("touchend", () => { KEY_DOWN = false; }, { passive: true });
Handy_shot.addEventListener("touchstart", () => { KEY_SPACE = true; }, { passive: true });
Handy_shot.addEventListener("touchend", () => { KEY_SPACE = false; }, { passive: true });

Handy_Oben.addEventListener("mousedown", () => { KEY_UP = true; }, { passive: true });
Handy_Oben.addEventListener("mouseup", () => { KEY_UP = false; }, { passive: true });
Handy_Unten.addEventListener("mousedown", () => { KEY_DOWN = true; }, { passive: true });
Handy_Unten.addEventListener("mouseup", () => { KEY_DOWN = false; }, { passive: true });
Handy_shot.addEventListener("mousedown", () => { KEY_SPACE = true; }, { passive: true });
Handy_shot.addEventListener("mouseup", () => { KEY_SPACE = false; }, { passive: true });

// Button sounds — declared once here, not inside showMainMenu (that caused stacking)
startBtn.addEventListener("click", () => { Sounds.button.play(); }, { passive: true });
settingsBtn.addEventListener("click", () => { Sounds.button.play(); }, { passive: true });
backBtn.addEventListener("click", () => { Sounds.button.play(); }, { passive: true });
restartBtn.addEventListener("click", () => {
  Sounds.button.play();
  document.getElementById("gameOverScreen").style.display = "none";
  document.getElementById("score").classList.remove("hidden");
  document.getElementById("canvas").style.filter = "none";
  gameRunning = true;
  resetGame();
  startRound();
}, { passive: true });

function startGame() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    canvas.style.imageRendering = "pixelated";
    gameRunning = true;
    Sounds.music.loop = true;
    loadData();
    loadImages();
    draw();
}

function showMainMenu() {
    document.getElementById("MainMenu").classList.remove("hidden");
    document.getElementById("canvas").style.filter = "blur(5px)";
    gameRunning = false;
    pauseTypewriter();

    Handy_Oben.style.display = "none";
    Handy_Unten.style.display = "none";
    Handy_shot.style.display = "none";
}

function startWave() {
    typewriterLog(`Wave ${currentWave} started! Boss will arrive shortly...`, 100);

    setTimeout(() => {
        boss = createBossForWave(currentWave);
        bossJustDefeated = false;

        // Boss shooting interval started once here — not inside update() every frame
        clearInterval(boss_Shot_Interval);
        boss_Shot_Interval = setInterval(() => {
            if (bossActivitys) boss.shoot();
        }, boss.shotCooldown);

        typewriterLog(`${boss.name} has arrived!`, 100, 5000);
    }, 6000); //tune this to 30000
}

function nextWave() {
    // Clean up current boss before moving on
    clearInterval(boss_Shot_Interval);
    boss_Shot_Interval = null;
    boss = null;
    bossActivitys = false;
    bossJustDefeated = false;

    if (currentWave < maxWaves) {
        currentWave++;
        UfoHealth++;
        currentUfo_Cooldown = Ufo_Cooldown;
        clearInterval(Ufo_Interval);
        Ufo_Interval = setInterval(createUfos, currentUfo_Cooldown);
        startWave();
    } else {
        gameRunning = false;
        showGameOverScreen(true);
        gameOver = true;
    }
}

// Press E to advance after boss is defeated
document.addEventListener('keydown', (e) => {
    if (e.key === 'e' && boss && boss.defeated) {
        nextWave();
    }
});

settingsBtn.onclick = function () {
    document.getElementById("settingsMenu").classList.remove("hidden");
    inSettings = true;
};

backBtn.onclick = function () {
    document.getElementById("settingsMenu").classList.add("hidden");
    inSettings = false;
};

function ESCAPE_PRESSED() {
    if (inSettings) {
        document.getElementById("settingsMenu").classList.add("hidden");
        inSettings = false;
    } else if (gameRunning) {
        showMainMenu();
        gameRunning = false;
    } else if (!gameRunning && !inSettings) {
        document.getElementById("MainMenu").classList.add("hidden");
        document.getElementById("score").classList.remove("hidden");
        document.getElementById("canvas").style.filter = "none";
        gameRunning = true;
        resumeTypewriter();
        startRound();
    }
}

// Volume sliders
const MusicSlider = document.getElementById("MainMusicSlider");
const ShotSoundSlider = document.getElementById("ShotSoundSlider");
const HitSoundSlider = document.getElementById("HitSoundSlider");
const MenuSoundSlider = document.getElementById("MenuSoundSlider");
const TypeSoundSlider = document.getElementById("TypeSoundSlider");

const MusicSliderValue = document.getElementById("MusicSlider-value");
const ShotSliderValue = document.getElementById("ShotSlider-value");
const HitSliderValue = document.getElementById("HitSlider-value");
const MenuSliderValue = document.getElementById("MenuSlider-value");
const TypeSliderValue = document.getElementById("TypeSlider-value");

function SliderGradient(slider, valueDisplay, color = "orange", bgColor = "#2c2f4a") {
    const min = parseFloat(slider.min);
    const max = parseFloat(slider.max);
    const val = parseFloat(slider.value);
    const percent = ((val - min) / (max - min)) * 100;
    slider.style.background = `linear-gradient(to right, ${color} 0%, ${color} ${percent}%, ${bgColor} ${percent}%, ${bgColor} 100%)`;
    valueDisplay.textContent = Math.round(percent) + "%";
}

function updateVolume() {
    Sounds.music.volume = MusicSlider.value;
    Sounds.shot.volume = ShotSoundSlider.value;
    Sounds.hit.volume = HitSoundSlider.value;
    Sounds.button.volume = MenuSoundSlider.value;

    const typeVolume = TypeSoundSlider.value;
    typeSound.forEach(sound => { sound.volume = typeVolume; });

    GameData.musicVolume = Sounds.music.volume;
    GameData.shotVolume = Sounds.shot.volume;
    GameData.hitVolume = Sounds.hit.volume;
    GameData.menuVolume = Sounds.button.volume;
    GameData.typeVolume = typeVolume;
    saveData();

    SliderGradient(MusicSlider, MusicSliderValue, "#4de2f2");
    SliderGradient(ShotSoundSlider, ShotSliderValue, "#4de2f2");
    SliderGradient(HitSoundSlider, HitSliderValue, "#4de2f2");
    SliderGradient(MenuSoundSlider, MenuSliderValue, "#4de2f2");
    SliderGradient(TypeSoundSlider, TypeSliderValue, "#4de2f2");
}

MusicSlider.addEventListener("input", updateVolume, { passive: true });
ShotSoundSlider.addEventListener("input", updateVolume, { passive: true });
HitSoundSlider.addEventListener("input", updateVolume, { passive: true });
MenuSoundSlider.addEventListener("input", updateVolume, { passive: true });
TypeSoundSlider.addEventListener("input", updateVolume, { passive: true });

function toggleSound() {
    togglesound = !togglesound;
    Object.values(Sounds).forEach(sound => { sound.muted = !togglesound; });
    SoundMuteButton.style.backgroundImage = togglesound ? "url('../img/Sound1.png')" : "url('../img/Mute1.png')";
    GameData.Sound = togglesound;
    GameData.muted = !togglesound;
    saveData();
}
SoundMuteButton.onclick = function () { toggleSound(); };

document.getElementById("SettingsButton").onclick = function () {
    showMainMenu();
    document.getElementById("settingsMenu").classList.remove("hidden");
    if (gameOver) document.getElementById("startMenu").classList.add("hidden");
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
FullscreenButton.onclick = function () { toggleFullscreen(); };

MobileLayoutcheck.onclick = function () { toggleMobileLayout(); };

function toggleMobileLayout() {
    const show = MobileLayoutcheck.checked;
    Handy_Oben.style.display = show ? "block" : "none";
    Handy_Unten.style.display = show ? "block" : "none";
    Handy_shot.style.display = show ? "block" : "none";
}

startBtn.onclick = function () {
    document.getElementById("MainMenu").classList.add("hidden");
    document.getElementById("score").classList.remove("hidden");
    document.getElementById("canvas").style.filter = "none";
    gameRunning = true;
    startRound();
    resumeTypewriter();
};

// Resets all game state for a clean new run — called every time Start is pressed
function resetGame() {
    document.getElementById("gameOverScreen").style.display = "none";
    currentWave = 1;
    boss = null;
    bossActivitys = false;
    bossJustDefeated = false;
    shots = [];
    ufos = [];
    powerups = [];
    score = 0;
    scoreMult = 1;
    killStreak = 0;
    player.health = player.maxhealth;
    player.speed = 5;
    player.invincible = false;
    player.blink = false;
    player.powerup = false;
    lastPowerupState = false;
    UfoHealth = 1;
    UfoSpeed = 10;
    currentUfo_Cooldown = Ufo_Cooldown;
    Shot_Cooldown = 500;
    ShotSpeed = 10;
    Sounds.shot.playbackRate = 1;

    clearInterval(boss_Shot_Interval);
    boss_Shot_Interval = null;
}

function startRound() {
    if (!alreadyExecuted) {
        // First run: create all intervals and kick off wave 1
        Sounds.music.play();
        setInterval(update, 1000 / 25);
        Ufo_Interval = setInterval(createUfos, currentUfo_Cooldown);
        setInterval(checkCollision, 1000 / 25);
        Shot_Interval = setInterval(createShots, Shot_Cooldown);
        PowerUp_Interval = setInterval(createPowerup, PowerUp_Cooldown);
        alreadyExecuted = true;
    } else {
        // Resume from pause OR new game after death — wave is already running or reset by startBtn
        Sounds.music.play();
        clearInterval(Ufo_Interval);
        Ufo_Interval = setInterval(createUfos, currentUfo_Cooldown);
    }
    startWave();
    toggleMobileLayout();
}

function createUfos() {
    if (gameRunning) {
        let ufo = {
            x: canvas.width + 100,
            y: Math.random() * (canvas.height - 50),
            width: 100,
            height: 45,
            img: _ufoImg,
            health: UfoHealth,
            speed: Math.random() * UfoSpeed + 5
        };
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
        Sounds.shot.play();
        let shot = {
            x: player.x + player.width,
            y: player.y + player.height / 2,
            width: 30,
            height: 3,
            img: _playerShotImg,
            speed: ShotSpeed,
            damage: 1,
        };
        shots.push(shot);
    }
}

function createPowerup() {
    if (gameRunning) {
        // 30% chance of a health drop, 70% speed boost
        const type = Math.random() < 0.3 ? "health" : "shotSpeed";
        let powerup = {
            x: 1300,
            y: Math.random() * 750,
            width: 50,
            height: 50,
            img: type === "health" ? heartImage : _crateImg,
            type: type,
        };
        powerups.push(powerup);
        PowerUp_Cooldown = Math.random() * PowerUp_Cooldown + 5000;
        clearInterval(PowerUp_Interval);
        PowerUp_Interval = setInterval(createPowerup, PowerUp_Cooldown);
    }
}

// Helper: AABB rectangle overlap check — removes duplicated collision math
function rectOverlap(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

// Helper: applies damage to player with invincibility + blink — was copy-pasted twice before
function damagePlayer() {
    player.health--;
    scoreMult = 1;
    killStreak = 0;
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

    if (player.health <= 0) handlePlayerDeath();
}

function handlePlayerDeath() {
  Sounds.death.play();
  gameRunning = false;
  currentKills = 0;
  showGameOverScreen(false);
  gameOver = true;
}

function showGameOverScreen(isVictory) {
  if (score > GameData.BestScore) {
      GameData.BestScore = score;
      saveData();
  }
  document.getElementById("goTitle").textContent = isVictory ? "VICTORY!" : "GAME OVER";
  document.getElementById("goScore").textContent = "Score: " + score;
  document.getElementById("goBestScore").textContent = "Best: " + GameData.BestScore;
  document.getElementById("goKills").textContent = "Kills: " + GameData.currentKills;
  document.getElementById("goWave").textContent = isVictory
      ? "All " + maxWaves + " waves cleared!"
      : "Wave " + currentWave + " of " + maxWaves;
  document.getElementById("gameOverScreen").style.display = "flex";
  document.getElementById("canvas").style.filter = "blur(5px)";
}

function checkCollision() {
    if (!gameRunning) return;

    // Player body collides with UFO
    ufos.forEach(function (ufo) {
        if (!player.invincible && rectOverlap(player, ufo)) {
            ufos = ufos.filter(u => u !== ufo);
            damagePlayer();
        }
        // UFO goes off-screen
        if (ufo.x < -500) {
            ufos = ufos.filter(u => u !== ufo);
        }
    });

    // Player shots — checked in its own loop so boss is always hittable,
    // even when no UFOs are on screen (was a hidden bug: shots were inside ufos.forEach)
    shots.forEach(function (shot) {
        // Shot hits UFO
        const hitUfo = ufos.find(ufo => rectOverlap(shot, ufo));
        if (hitUfo) {
            Sounds.hit.play();
            hitUfo.health -= shot.damage;
            score += 10 * scoreMult;
            shots = shots.filter(s => s !== shot);
            if (hitUfo.health <= 0) {
                GameData.TotalKills++;
                GameData.currentKills++;
                killStreak++;
                scoreMult = Math.min(1 + Math.floor(killStreak / 5), 5);
                hitUfo.img = _boomImg;
                hitUfo.speed = 0;
                // 10% chance to drop a pickup at the kill location
                if (Math.random() < 0.05) {
                    const dropType = Math.random() < 0.4 ? "health" : "speed";
                    powerups.push({
                        x: hitUfo.x,
                        y: hitUfo.y,
                        width: 35,
                        height: 35,
                        img: dropType === "health" ? heartImage : _crateImg,
                        type: dropType,
                    });
                }
                setTimeout(() => { ufos = ufos.filter(u => u !== hitUfo); }, 200);
            }
            return;
        }

        // Shot hits Boss
        if (bossActivitys && rectOverlap(shot, boss)) {
            Sounds.hit.play();
            boss.takeDamage(shot.damage);
            shots = shots.filter(s => s !== shot);
            return;
        }

        // Shot leaves screen
        if (shot.x > canvas.width) {
            shots = shots.filter(s => s !== shot);
        }
    });

    // Boss shots hit player
    if (bossActivitys) {
        boss.shots.forEach(function (bossShot) {
            if (!player.invincible && rectOverlap(player, bossShot)) {
                boss.shots = boss.shots.filter(s => s !== bossShot);
                damagePlayer();
            }
        });
    }

    // Powerup collection
    powerups.forEach(function (powerup) {
        if (rectOverlap(player, powerup)) {
            powerups = powerups.filter(p => p !== powerup);
            player.powerup = true;
            ShotSpeed *= 1.5;
            if (powerup.type === "health") {
              if (player.health < player.maxhealth) {
                  player.health++;
                  typewriterLog("1 Heart restored!", 80, 3000);
              } else {
                  typewriterLog("Health already full!", 80, 2000);
              }
          } else {
              player.powerup = true;
              ShotSpeed = 15; // fixed value — was *= 1.5 which accumulated on repeat pickups
              setTimeout(() => { player.powerup = false; }, 5000);
              typewriterLog("Speed boost! 5 seconds!", 80, 3000);
          }
            setTimeout(() => { player.powerup = false; }, 5000);
        }
    });
}

function update() {
    bossActivitys = (boss !== null && !boss.defeated && !boss.entering && gameRunning);

    if (gameRunning) {
        if (KEY_UP && player.y > 0) player.y -= player.speed;
        if (KEY_DOWN && player.y + player.height < canvas.height) player.y += player.speed;

        ufos.forEach(function (ufo) {
            ufo.x -= ufo.speed;
        });

        if (player.powerup !== lastPowerupState) {
            clearInterval(Shot_Interval);
            if (player.powerup) {
                Shot_Cooldown = 250;
                Sounds.shot.playbackRate = 2;
            } else {
                Shot_Cooldown = 500;
                Sounds.shot.playbackRate = 1;
                ShotSpeed = 10;
            }
            Shot_Interval = setInterval(createShots, Shot_Cooldown);
            lastPowerupState = player.powerup;
        }

        shots.forEach(function (shot) {
            shot.x += shot.speed;
        });

        powerups.forEach(function (powerup) {
            powerup.x -= 15;
        });
        powerups = powerups.filter(p => p.x + p.width > 0);

        if (boss && !boss.defeated) {
            boss.update(shots);
            if (bossActivitys) boss.updateShots();
        }

        // Detect boss defeat once and show the E-key hint via the event log
        if (boss && boss.defeated && !bossJustDefeated) {
            bossJustDefeated = true;
            const bonus = currentWave * 100;
            score += bonus;
            if (currentWave < maxWaves) {
                typewriterLog(`${boss.name} defeated! +${bonus} pts. Press E for next wave.`, 80, 8000);
            } else {
                typewriterLog(`${boss.name} defeated! +${bonus} pts. Press E for results!`, 80, 10000);
            }
        }
        updateScore();
    }
}

function updateScore() {
    document.getElementById("score").innerHTML = "Score: " + score;
}

function loadImages() {
    backgroundImage.src = 'img/background.png';
    player.img = new Image();
    player.img.src = player.src;
}

const heartImage = new Image();
heartImage.src = 'img/heart.png';

// Pre-load all sprites once at startup — prevents new Image() on every enemy/shot spawn
const _ufoImg = new Image();       _ufoImg.src = 'img/ufo.png';
const _boomImg = new Image();      _boomImg.src = 'img/boom.png';
const _crateImg = new Image();     _crateImg.src = 'img/crate.jpg';
const _playerShotImg = new Image(); _playerShotImg.src = 'img/shot.png';


function drawHearts() {
    for (let i = 0; i < player.health; i++) {
        ctx.drawImage(heartImage, player.x + i * 25 + 15, player.y + 50, 20, 20);
    }
}

function draw() {
    // clearRect ensures no ghost frames if background image ever fails to load
    ctx.clearRect(0, 0, canvas.width, canvas.height);
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
      if (bossActivitys) boss.drawShots(ctx);
  }
    drawHearts();

    // Player draw moved before RAF — blink check is now a simple conditional, not an early return
    if (!player.invincible || !player.blink) {
        ctx.drawImage(player.img, player.x, player.y, player.width, player.height);
    }

    // Wave counter HUD (top-right)
    ctx.font = "bold 24px 'Pixelify Sans', monospace";
    ctx.fillStyle = "rgba(255,255,255,0.65)";
    ctx.textAlign = "right";
    ctx.fillText(`Wave ${currentWave} / ${maxWaves}`, canvas.width - 12, 80);
    ctx.textAlign = "left";

    // Kill-streak multiplier (top-left, under score element)
    if (scoreMult > 1) {
        const hue = 60 - (scoreMult - 2) * 12; // gold → orange → red as streak grows
        ctx.font = "bold 18px 'Pixelify Sans', monospace";
        ctx.fillStyle = `hsl(${hue}, 100%, 58%)`;
        ctx.fillText(`x${scoreMult} STREAK!`, 12, 50);
    }

    // "Press E" canvas hint when boss is defeated and waiting for input
    if (bossJustDefeated && boss && boss.defeated) {
        const hint = currentWave < maxWaves ? "Press E for next wave" : "Press E for results";
        ctx.font = "bold 20px 'Pixelify Sans', monospace";
        ctx.textAlign = "center";
        const alpha = 0.55 + 0.45 * Math.sin(Date.now() / 400);
        ctx.fillStyle = `rgba(77, 226, 242, ${alpha})`;
        ctx.fillText(hint, canvas.width / 2, canvas.height - 30);
        ctx.textAlign = "left";
    }
    rafId = requestAnimationFrame(draw);
}

function saveData() {
    try {
        localStorage.setItem('GameData', JSON.stringify(GameData));
    } catch (e) {
        // Storage unavailable (private mode, full storage, etc.) — fail silently
    }
}

function loadData() {
    try {
        const saved = localStorage.getItem('GameData');
        if (saved) {
            const data = JSON.parse(saved);
            Object.assign(GameData, data);
        }
    } catch (e) {
        // Corrupt or unavailable storage — use defaults
    }

    // Apply loaded settings
    Sounds.music.volume = GameData.musicVolume;
    Sounds.shot.volume = GameData.shotVolume;
    Sounds.hit.volume = GameData.hitVolume;
    Sounds.button.volume = GameData.menuVolume;
    typeSound.forEach(sound => { sound.volume = GameData.typeVolume; });

    // Restore mute state — was reading GameData.muted which didn't exist before
    togglesound = GameData.Sound;
    const isMuted = GameData.muted ?? false;
    Object.values(Sounds).forEach(sound => { sound.muted = isMuted; });
    SoundMuteButton.style.backgroundImage = isMuted ? "url('../img/Mute1.png')" : "url('../img/Sound1.png')";

    // Update slider UI
    MusicSlider.value = GameData.musicVolume;
    ShotSoundSlider.value = GameData.shotVolume;
    HitSoundSlider.value = GameData.hitVolume;
    MenuSoundSlider.value = GameData.menuVolume;
    TypeSoundSlider.value = GameData.typeVolume;
}

window.addEventListener('beforeunload', saveData);
