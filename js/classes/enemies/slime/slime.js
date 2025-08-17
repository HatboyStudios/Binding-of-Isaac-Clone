class Slime extends Enemy {
    constructor(id, x, y, target, max_health = 60, damage = 25, speed = 1, size = 40, canSplit = true) {
        super(x, y, max_health, damage, speed, size);

        this.id = id;
        this.target = target;
        this.canSplit = canSplit;

        this.attack_range = 45;
        this.aggro_range = 200;

        this.ENEMY_STATE = 'PATROL';

        this.attack_cooldown = 0;
        this.attack_rate = 60;

        this.patrol_radius = 150;
        this.patrol_center_x = x;
        this.patrol_center_y = y;
        this.patrol_target_x = x;
        this.patrol_target_y = y;
        this.patrol_change_timer = 0;
        this.patrol_change_interval = 120;
    }

    targetDistance() {
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        return { dx, dy, dist: Math.hypot(dx, dy) };
    }

    findNewTarget(canvasWidth, canvasHeight) {
        let attempts = 0;
        const margin = this.size;

        while (attempts < 10) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * this.patrol_radius;
            const px = this.patrol_center_x + Math.cos(angle) * radius;
            const py = this.patrol_center_y + Math.sin(angle) * radius;

            if (px >= margin && px <= canvasWidth - margin && py >= margin && py <= canvasHeight - margin) {
                this.patrol_target_x = px;
                this.patrol_target_y = py;
                return;
            }

            attempts++;
        }

        this.patrol_target_x = constrain(this.patrol_center_x, margin, canvasWidth - margin);
        this.patrol_target_y = constrain(this.patrol_center_y, margin, canvasHeight - margin);
    }

    patrol(canvasWidth = 800, canvasHeight = 600) {
        this.patrol_change_timer--;
        const dx = this.patrol_target_x - this.x;
        const dy = this.patrol_target_y - this.y;
        const dist = Math.hypot(dx, dy);

        if (this.patrol_change_timer <= 0 || dist < 10) {
            this.findNewTarget(canvasWidth, canvasHeight);
            this.patrol_change_timer = this.patrol_change_interval + Math.random() * 60;
        }

        this.move(dx, dy, canvasWidth, canvasHeight, true, 1);
    }

    handleAttack(dist) {
        if (dist <= this.attack_range) {
            if (this.attack_cooldown <= 0) {
                this.target.takeDamage(this.damage);
                this.attack_cooldown = this.attack_rate;
            }
        } else {
            const { dx, dy } = this.targetDistance();
            this.move(dx, dy, canvasWidth, canvasHeight, true, 1);
        }
    }

    handleStates(dist) {
        if (dist <= this.attack_range) {
            this.ENEMY_STATE = "ATTACK";
        } else if (dist <= this.aggro_range) {
            this.ENEMY_STATE = "AGGRO";
        } else {
            this.ENEMY_STATE = "PATROL";
        }
    }

    update(canvasWidth, canvasHeight) {
        if (this.isDead()) {
            if (!this._hasHandledDeath) {
                this.handleDeath();
                this._hasHandledDeath = true;
            }
            return;
        }

        if (this.attack_cooldown > 0) this.attack_cooldown--;

        const { dx, dy, dist } = this.targetDistance();

        this.handleStates(dist);

        switch (this.ENEMY_STATE) {
            case "ATTACK":
                this.handleAttack(dist);
                break;
            case "AGGRO":
                this.move(dx, dy, canvasWidth, canvasHeight, true, 1);
                break;
            case "PATROL":
            default:
                this.patrol(canvasWidth, canvasHeight);
        }
    }

    draw() {
        super.draw();
        fill(this.canSplit ? color(50, 200, 50) : color(100, 100, 255));
        noStroke();
        rect(this.x, this.y, this.size, this.size);
        rectMode(CENTER);
    }

    handleDeath() {
        if (!this.canSplit) return;

        console.log(`Slime ${this.id} died and is spawning mini slimes`);

        for (let i = 0; i < 4; i++) {
            const angle = (Math.PI * 2 * i) / 4;
            const spawnX = this.x + Math.cos(angle) * 20;
            const spawnY = this.y + Math.sin(angle) * 20;

            const miniSlime = new Slime(
                `mini-${this.id}-${i}`,
                spawnX,
                spawnY,
                this.target,
                20,
                5,
                1.5, 
                20,
                false 
            );

            enemies.push(miniSlime);
        }
    }
}

class FastSlime extends Slime {
    constructor(id, x, y, target) {
        super(id, x, y, target, 40, 15, 2, 30);
    }

    draw() {
        super.draw();
        fill(0, 255, 0);
    }
}

class TankSlime extends Slime {
    constructor(id, x, y, target) {
        super(id, x, y, target, 120, 40, 0.6, 50, false);
    }

    draw() {
        super.draw();
        fill(0, 100, 200);
    }
}