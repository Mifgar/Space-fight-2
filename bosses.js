let boss = null;

/**
 * bosses.js
 * Defines multiple boss classes with distinct behaviors.
 */

// Base Boss class with basic properties and methods
class Boss {
    constructor(name, speed, width, height, health, shotspeed, shotCooldown, imgSrc, minInterval, maxInterval) {
        this.name = name;
        this.speed = speed;
        this.width = width; 
        this.height = height; 
        this.health = health;
        this.shotspeed = shotspeed;
        this.shotCooldown = shotCooldown;
        this.defeated = false;
        this.img = new Image();
        this.img.src = imgSrc; 
        this.x = canvas.width - this.width - 70; // Initial x position
        this.y = canvas.height/2 - this.height; // Initial y position
        this.direction = Math.random() < 0.5 ? 1 : -1; // 1 for down, -1 for up
        this.minInterval = minInterval;
        this.maxInterval = maxInterval;
        this.lastDodge = 0;
        this.dodgeCooldown = 300;
        this.scheduleDirectionChange();
    }

    scheduleDirectionChange() {
        // Calculate interval influenced by speed (faster speed = smaller interval)
        const interval = this.maxInterval - (this.speed / 10) * (this.maxInterval - this.minInterval);
        // Add some randomness:
        const randomInterval = interval * (Math.random() * 0.5 + 0.75);
        setTimeout(() => {
            this.changeDirection();
            this.scheduleDirectionChange(); // re-schedule next change
        }, randomInterval);
    }
    changeDirection() {
        this.direction = Math.random() < 0.5 ? 1 : -1;
    }


detectAndDodgeShots(shots) {
    const now = Date.now();
    if (now - this.lastDodge < this.dodgeCooldown) return;

    // Define a detection box in front of the boss
    const detectionBox = {
        x: this.x - 350,
        y: this.y - 100,
        width: 150+ this.width,
        height: this.height + 200,
    };

    let foundShot = null;

    // Find first shot in detection box
    for (const shot of shots) {
        if (
            shot.x + shot.width > detectionBox.x &&
            shot.x < detectionBox.x + detectionBox.width &&
            shot.y + shot.height > detectionBox.y &&
            shot.y < detectionBox.y + detectionBox.height
        ) {
            foundShot = shot;
            break; // only one dodge per detection
        }
    }

    if (foundShot) {
        const bossCenterY = this.y + this.height / 2;
        const shotCenterY = foundShot.y + foundShot.height / 2;

        // If shot is below boss, move up. If above, move down.
        this.direction = shotCenterY > bossCenterY ? -1 : 1;

        this.lastDodge = now;
    }
}

    update(shots) {
        this.detectAndDodgeShots(shots);

        this.y += this.direction * this.speed;

        if (this.y < 0) {
            this.y = 0;
            this.maxInterval *= 1.5;
            this.direction = 1;
            setTimeout(() => {
                this.maxInterval /= 1.5
            }, this.maxInterval);
        } else if (this.y + this.height > canvas.height) {
            this.y = canvas.height - this.height;
            this.maxInterval *= 1.5;
            this.direction = -1;
            setTimeout(() => {
                this.maxInterval /= 1.5
            }, this.maxInterval);
        }
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.health = 0;
            this.defeated = true;
            console.log(this.name + " has been defeated!");
        }
    }
    draw(ctx) {
        ctx.font = "1em poppins";
        ctx.fillStyle = "red";
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height); 
        ctx.fillText(this.name + " HP: " + this.health, this.x + 10, this.y + this.height + 30);
        // Debugging Detection Area
        // ctx.strokeStyle = "rgba(255, 0, 0, 0.5)"; 
        // ctx.strokeRect(this.x - 350, this.y - 100, 350+ this.width, this.height + 200);
    }
}

// Boss definitions based on the provided traits
class Goliath extends Boss {
    constructor() {
        super("Goliath", 1, 435/2, 245/2, 50, 0, 0, "img/Goliath.png", 4000, 6000);
    }
}

class Crawler extends Boss {
    constructor() {
        super("Crawler", 1, 460/2, 246/2, 75, 0, 0, "img/Crawler.png", 4000, 6000);
    }
}

class Bulwark extends Boss {
    constructor() {
        super("Bulwark", 3, 460/2, 246/2, 150, 0, 0, "img/Bulwark.png", 3000, 5000);

    }
}

class Blitzor extends Boss {
    constructor() {
        super("Blitzor", 7.5, 460/2, 246/2, 100, 0, 0, "img/Blitzor.png", 2000, 5000);
    }
}

class Dart extends Boss {
    constructor() {
        super("Dart", 7.5, 374/2, 116/2, 75, 0, 0, "img/Dart.png", 2000, 5000);
    }
}

class Drifter extends Boss {
    constructor() {
        super("Drifter", 5, 453/2, 161/2, 250, 0, 0, "img/Drifter.png", 3000, 4000);
    }
}

class Wasp extends Boss {
    constructor() {
        super("Wasp", 10, 331/2, 133/2, 150, 0, 0, "img/Wasp.png", 1000, 4000);

    }
}

class Juggernaut extends Boss {
    constructor() {
        super("Juggernaut", 3, 430/1, 276/1, 500, 0, 0, "img/Juggernaut.png", 3000, 5000);
    }
}

class Phantom extends Boss {
    constructor() {
        super("Phantom", 5, 439/2, 253/2, 250, 0, 0, "img/Phantom.png", 3000, 4000);
    }
}

class Vortex extends Boss {
    constructor() {
        super("Vortex", 7.5, 464/2, 320/2, 550, 0, 0, "img/Vortex.png", 2000, 5000);
    }
}

// Factory function to create a boss based on the current wave number
function createBossForWave(wave) {
    switch (wave) {
        case 1: return new Juggernaut();
        case 2: return new Crawler();
        case 3: return new Bulwark();
        case 4: return new Blitzor();
        case 5: return new Dart();
        case 6: return new Drifter();
        case 7: return new Wasp();
        case 8: return new Juggernaut();
        case 9: return new Phantom();
        case 10: return new Vortex();
        default: return new Goliath(); // Fallback to the first boss
    }
}

// Export objects to global scope if needed (for non-module environments)
window.Boss = Boss;
window.createBossForWave = createBossForWave;
