let boss = null;

/**
 * bosses.js
 * Defines multiple boss classes with distinct behaviors.
 */

// Base Boss class with basic properties and methods
class Boss {
    constructor(name, speed, width, height, health, imgSrc) {
        this.name = name;
        this.speed = speed;
        this.width = width; 
        this.height = height; 
        this.health = health;
        this.defeated = false;
        this.img = new Image();
        this.img.src = imgSrc; 
        this.x = canvas.width - this.width - 70; // Initial x position
        this.y = canvas.height/2 - this.height; // Initial y position
        this.direction = 1; // 1 for down, -1 for up
        this.changeDirectionInterval = 1000; // Change direction every second

        setInterval(() => {
            this.changeDirection();
        }, this.changeDirectionInterval);
    }
    changeDirection() {
        // Randomly choose to move up or down
        this.direction = Math.random() < 0.5 ? 1 : -1; // 50% chance to go up or down
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.health = 0;
            this.defeated = true;
            console.log(this.name + " has been defeated!");
        }
    }

    update() {
        this.y += this.direction * this.speed;

        if (this.y < 0) {
            this.y = 0; 
        } else if (this.y + this.height > canvas.height) {
            this.y = canvas.height - this.height; 
        }
    }
    draw(ctx) {
        ctx.font = "1em poppins";
        ctx.fillStyle = "red";
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height); 
        ctx.fillText(this.name + " HP: " + this.health, this.x + 10, this.y + this.height + 30);
    }
}

// Boss definitions based on the provided traits
class Goliath extends Boss {
    constructor() {
        super("Goliath", 0, 61*2, 33*2, 10, "img/Goliath.png");
    }
}

class Crawler extends Boss {
    constructor() {
        super("Crawler", 1, "small", 8);
    }
}

class Bulwark extends Boss {
    constructor() {
        super("Bulwark", 1, "huge", 15);
    }

}

class Blitzor extends Boss {
    constructor() {
        super("Blitzor", 4, "huge", 10);
    }

}

class Dart extends Boss {
    constructor() {
        super("Dart", 5, "small", 5);
    }

}

class Drifter extends Boss {
    constructor() {
        super("Drifter", 3, "medium", 12);
    }

}

class Wasp extends Boss {
    constructor() {
        super("Wasp", 6, "tiny", 3);
    }

}

class Juggernaut extends Boss {
    constructor() {
        super("Juggernaut", 1, "very big", 20);
    }

}

class Phantom extends Boss {
    constructor() {
        super("Phantom", 4, "small", 8);
    }

}

class Vortex extends Boss {
    constructor() {
        super("Vortex", 5, "medium", 15);
    }

}

// Factory function to create a boss based on the current wave number
function createBossForWave(wave) {
    switch (wave) {
        case 1: return new Goliath();
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
