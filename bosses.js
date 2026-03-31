let boss = null;

/**
 * bosses.js
 * Defines multiple boss classes with distinct behaviors.
 */

// Pre-load shot image once — shared by all boss shots, prevents new Image() per shot fired
const _shotImg = new Image();
_shotImg.src = 'img/shot.png';

// Base class shared by all 10 bosses — each subclass only sets its own stats via super()
class Boss {
    constructor(name, speed, width, height, health, shotspeed, shotCooldown, magazine, FullMagazine, ReloadCooldown, imgSrc, minInterval, maxInterval) {
        this.name = name;
        this.speed = speed;
        this.width = width;
        this.height = height;
        this.health = health;
        this.maxHealth = health;
        this.shots = [];
        this.shotspeed = shotspeed;
        this.shotCooldown = shotCooldown;
        this.lastShotTime = 0;
        this.magazine = magazine;
        this.FullMagazine = FullMagazine;
        this.ReloadCooldown = ReloadCooldown;
        this.reloading = false;
        this.IsShooting = false;
        this.defeated = false;
        this.directionTimer = null;
        this.entering = true;
        this.enteringSpeed = Math.max(this.speed * 2, 10);
        this.img = new Image();
        this.img.src = imgSrc;
        this.entryX = canvas.width - this.width - 70;
        this.x = canvas.width;          // starts off-screen and slides in
        this.y = canvas.height / 2 - this.height;
        this.direction = Math.random() < 0.5 ? 1 : -1;
        this.minInterval = minInterval;
        this.maxInterval = maxInterval;
        this.lastDodge = 0;
        this.dodgeCooldown = 300;
        this.scheduleDirectionChange();
    }

    // Schedules the next direction flip — faster bosses change direction more often
    scheduleDirectionChange() {
        const interval = this.maxInterval - (this.speed / 10) * (this.maxInterval - this.minInterval);
        const randomInterval = interval * (Math.random() * 0.5 + 0.75);
        this.directionTimer = setTimeout(() => {
            if (this.defeated) return;
            this.changeDirection();
            this.scheduleDirectionChange();
        }, randomInterval);
    }

    changeDirection() {
        this.direction = Math.random() < 0.5 ? 1 : -1;
    }

    // Checks if a player shot is heading toward the boss and steers away from it
    detectAndDodgeShots(shots) {
        const now = Date.now();
        if (now - this.lastDodge < this.dodgeCooldown) return;

        const detectionBox = {
            x: this.x - 350,
            y: this.y - 100,
            width: 150 + this.width,
            height: this.height + 200,
        };

        let foundShot = null;

        for (const shot of shots) {
            if (
                shot.x + shot.width > detectionBox.x &&
                shot.x < detectionBox.x + detectionBox.width &&
                shot.y + shot.height > detectionBox.y &&
                shot.y < detectionBox.y + detectionBox.height
            ) {
                foundShot = shot;
                break;
            }
        }

        if (foundShot) {
            const bossCenterY = this.y + this.height / 2;
            const shotCenterY = foundShot.y + foundShot.height / 2;
            this.direction = shotCenterY > bossCenterY ? -1 : 1;
            this.lastDodge = now;
        }
    }

    shoot() {
        const now = Date.now();
        if (now - this.lastShotTime < this.shotCooldown || this.magazine <= 0) return;

        const shot = new Shot(this.x, this.y + this.height / 3, 30, 3, this.shotspeed);
        this.shots.push(shot);
        this.magazine -= 1;
        this.lastShotTime = now;

        // Reload after emptying magazine — slight randomness keeps burst size unpredictable
        if (this.magazine <= 0 && !this.reloading) {
            this.reloading = true;
            setTimeout(() => {
                this.magazine = this.FullMagazine + Math.floor(Math.random() * this.FullMagazine) - this.FullMagazine / 2;
                this.reloading = false;
            }, this.ReloadCooldown);
        }
    }

    updateShots() {
        this.shots = this.shots.filter(shot => {
            shot.update();
            return shot.x + shot.width > 0;
        });
    }

    update(shots) {
        // Slide-in phase: boss enters from the right edge before combat begins
        if (this.entering) {
            this.x -= this.enteringSpeed;
            if (this.x <= this.entryX) {
                this.x = this.entryX;
                this.entering = false;
            }
            return;
        }
        this.detectAndDodgeShots(shots);
        this.y += this.direction * this.speed;

        if (this.y < 0) {
            this.y = 0;
            this.maxInterval *= 1.5;
            this.direction = 1;
            setTimeout(() => { this.maxInterval /= 1.5; }, this.maxInterval);
        } else if (this.y + this.height > canvas.height) {
            this.y = canvas.height - this.height;
            this.maxInterval *= 1.5;
            this.direction = -1;
            setTimeout(() => { this.maxInterval /= 1.5; }, this.maxInterval);
        }
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.health = 0;
            this.defeated = true;
            clearTimeout(this.directionTimer);
        }
    }

    draw(ctx) {
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
        
        const barW = Math.max(this.width, 120);
        const barH = 10;
        const barX = this.x + (this.width - barW) / 2;
        const barY = this.y - 22;
        const ratio = this.health / this.maxHealth;

        // Background shadow
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);
        ctx.fillStyle = "#222";
        ctx.fillRect(barX, barY, barW, barH);

        // Health bar color shifts green → yellow → red as the boss takes damage
        ctx.fillStyle = ratio > 0.5 ? "#4cff4c" : ratio > 0.25 ? "#ffbb00" : "#ff4444";
        ctx.fillRect(barX, barY, barW * ratio, barH);

        // Border
        ctx.strokeStyle = "rgba(255,255,255,0.35)";
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barW, barH);

        // Boss name above bar
        ctx.font = "bold 13px 'Poppins', monospace";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText(this.name, this.x + this.width / 2, barY - 5);
        ctx.textAlign = "left";
    }

    drawShots(ctx) {
        for (const shot of this.shots) {
            shot.draw(ctx);
        }
    }
}

class Shot {
    constructor(x, y, width, height, speed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.img = _shotImg;
    }

    update() {
        this.x -= this.speed;
    }

    draw(ctx) {
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }
}

// ─── Boss definitions ─────────────────────────────────────────────────────────
// Each class only passes its stats to the base class constructor.
// speed | width | height | health | shotSpeed | shotCooldown | magazine | fullMag | reloadMs | img | minDirMs | maxDirMs

// Wave 1 — slow and forgiving, introduces the boss format
class Goliath extends Boss {
    constructor() {
        super("Goliath", 1, 435/2, 245/2, 50, 5, 1500, 10, 10, 3000, "img/Goliath.png", 4000, 6000);
    }
}

// Wave 2 — same speed as Goliath but shoots in small bursts
class Crawler extends Boss {
    constructor() {
        super("Crawler", 1, 449/2, 187/2, 75, 4, 1800, 3, 3, 2500, "img/Crawler.png", 4000, 6000);
    }
}

// Wave 3 — more health and faster movement, first real wall of HP
class Bulwark extends Boss {
    constructor() {
        super("Bulwark", 3, 460/2, 246/2, 150, 4, 2000, 5, 5, 4000, "img/Bulwark.png", 3000, 5000);
    }
}

// Wave 4 — very fast, changes direction quickly, fires rapid bursts
class Blitzor extends Boss {
    constructor() {
        super("Blitzor", 7.5, 411/2, 216/2, 100, 7, 1000, 7, 7, 2000, "img/Blitzor.png", 2000, 5000);
    }
}

// Wave 5 — small and fast, extremely quick shots at close range
class Dart extends Boss {
    constructor() {
        super("Dart", 7.5, 374/2, 116/2, 75, 9, 600, 6, 6, 1500, "img/Dart.png", 2000, 5000);
    }
}

// Wave 6 — high HP tank with steady movement and consistent fire
class Drifter extends Boss {
    constructor() {
        super("Drifter", 5, 453/2, 161/2, 250, 5, 1300, 5, 5, 2500, "img/Drifter.png", 3000, 4000);
    }
}

// Wave 7 — fastest boss so far, very rapid fire, hard to avoid
class Wasp extends Boss {
    constructor() {
        super("Wasp", 10, 331/2, 133/2, 150, 10, 400, 4, 4, 1200, "img/Wasp.png", 1000, 4000);
    }
}

// Wave 8 — full-size, massive HP pool, slow but relentless
class Juggernaut extends Boss {
    constructor() {
        super("Juggernaut", 3, 430/1, 276/1, 500, 3, 2500, 6, 6, 5000, "img/Juggernaut.png", 3000, 5000);
    }
}

// Wave 9 — fast with high HP, punishing shot rate
class Phantom extends Boss {
    constructor() {
        super("Phantom", 5, 439/2, 253/2, 250, 6, 900, 5, 5, 2000, "img/Phantom.png", 3000, 4000);
    }
}

// Wave 10 — final boss: most HP, fast, rapid bursts, large hitbox
class Vortex extends Boss {
    constructor() {
        super("Vortex", 7.5, 464/2, 320/2, 550, 7, 1100, 6, 6, 2200, "img/Vortex.png", 2000, 5000);
    }
}

function createBossForWave(wave) {
    switch (wave) {
        case 1:  return new Goliath();
        case 2:  return new Crawler();
        case 3:  return new Bulwark();
        case 4:  return new Blitzor();
        case 5:  return new Dart();
        case 6:  return new Drifter();
        case 7:  return new Wasp();
        case 8:  return new Juggernaut();
        case 9:  return new Phantom();
        case 10: return new Vortex();
        default: return new Goliath();
    }
}

window.Boss = Boss;
window.createBossForWave = createBossForWave;
