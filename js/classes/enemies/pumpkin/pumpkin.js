class Pumpkin extends Enemy {
    constructor(id, x, y, target, max_health = 60, damage = 10, speed = 0.5, size = 30) {
        super(x, y, max_health, damage, speed, size);

        this.id = id;
        this.target = target;

        this.shoot_cooldown = 95;
        this.shoot_timer = this.shoot_cooldown;

        this.summon_cooldown = 480;
        this.summon_timer = this.summon_cooldown;

        this.isSummoning = false;
        this.summoning_timer = 0;
        this.summoning_duration = 90;

        this.patrol_center_x = x;
        this.patrol_center_y = y;
        this.patrol_radius = 200;
        this.patrol_target_x = x;
        this.patrol_target_y = y;
        this.patrol_timer = 0;
        this.patrol_interval = 180;

        this.vision = 140;
        this.attack_vision = 220;
        this.safe_distance = 140;

        this.patrol_cooldown = 160;
        this.patrol_spawn_rate = this.patrol_cooldown;

        this.seeds = [];

        this.ENEMY_STATE = 'PATROL';
        this.current_patrol_seeds = 0;
        this.max_patrol_seeds = 10;
    }

    move(dx, dy, canvasWidth, canvasHeight, toward = true, factor = 1) {
        const mag = Math.hypot(dx, dy);
        if (mag === 0) return;
        const sign = toward ? 1 : -1;
        this.x = constrain(this.x + (dx / mag) * this.speed * factor * sign, this.size / 2, canvasWidth - this.size / 2);
        this.y = constrain(this.y + (dy / mag) * this.speed * factor * sign, this.size / 2, canvasHeight - this.size / 2);
    }

    distanceToTarget() {
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        return { dx, dy, dist: Math.hypot(dx, dy) };
    }

    handleStates(dist) {
        if (dist <= this.attack_vision) {
            this.ENEMY_STATE = "ATTACK";
        } else {
            this.ENEMY_STATE = "PATROL";
        }
    }

    newTarget(canvasWidth, canvasHeight) {
        const margin = this.size;
        for (let attempts = 0; attempts < 15; attempts++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * this.patrol_radius;
            const newX = this.patrol_center_x + Math.cos(angle) * radius;
            const newY = this.patrol_center_y + Math.sin(angle) * radius;

            if (newX >= margin && newX <= canvasWidth - margin &&
                newY >= margin && newY <= canvasHeight - margin) {
                this.patrol_target_x = newX;
                this.patrol_target_y = newY;
                return;
            }
        }
        this.patrol_target_x = constrain(this.patrol_center_x, margin, canvasWidth - margin);
        this.patrol_target_y = constrain(this.patrol_center_y, margin, canvasHeight - margin);
    }

    lingerSeeds(direction) {
        let dx = 0, dy = 0;

        switch (direction) {
            case 'up': dy = -1; break;
            case 'down': dy = 1; break;
            case 'left': dx = -1; break;
            case 'right': dx = 1; break;
        }

        const onDestroy = () => {
            this.current_patrol_seeds = Math.max(0, this.current_patrol_seeds - 1);
        };

        const seed = new Seed(this.x, this.y, dx, dy, this.target, "LINGER", this.damage, onDestroy);
        this.seeds.push(seed);
    }

    patrol(canvasWidth, canvasHeight) {
        this.patrol_timer--;
        const dx = this.patrol_target_x - this.x;
        const dy = this.patrol_target_y - this.y;
        const dist = Math.hypot(dx, dy);

        if (this.patrol_timer <= 0 || dist < 10) {
            this.newTarget(canvasWidth, canvasHeight);
            this.patrol_timer = this.patrol_interval + Math.random() * 60;
        }

        this.move(dx, dy, canvasWidth, canvasHeight, true, 0.8);

        this.patrol_spawn_rate--;
        if (this.patrol_spawn_rate <= 0 && this.current_patrol_seeds < this.max_patrol_seeds) {
            const directions = ['up', 'down', 'left', 'right'];
            const randomDir = directions[Math.floor(Math.random() * directions.length)];
            this.lingerSeeds(randomDir);
            this.patrol_spawn_rate = this.patrol_cooldown + Math.floor(Math.random() * 30);
            this.current_patrol_seeds += 1;
        }
    }

    startSummoning() {
        this.isSummoning = true;
        this.summoning_timer = this.summoning_duration;
    }

    handleShootingSeeds() {
        const { dx, dy, dist } = this.distanceToTarget();
        if (dist === 0) return;

        const dirX = dx / dist;
        const dirY = dy / dist;

        const type = Math.random() < 0.5 ? "EXPLODE" : "";
        const seed = new Seed(this.x, this.y, dirX, dirY, this.target, type, this.damage);
        this.seeds.push(seed);

        this.shoot_timer = this.shoot_cooldown + Math.floor(Math.random() * 30);
    }

    handleSummoning() {
        if (this.isSummoning) {
            this.summoning_timer--;
            if (this.summoning_timer <= 0) {
                const seed = new Seed(this.x, this.y, 0, 0, this.target, "ALIVE", this.damage);
                this.seeds.push(seed);
                this.isSummoning = false;
                this.summon_timer = this.summon_cooldown;
            }
        }
    }

    updateSeeds(canvasWidth, canvasHeight) {
        for (let i = this.seeds.length - 1; i >= 0; i--) {
            const seed = this.seeds[i];
            seed.update(canvasWidth, canvasHeight);

            if (seed._destroy) {
                this.seeds.splice(i, 1);
            } else if (seed.isObstacle) {
                enemies.push(seed);
                this.seeds.splice(i, 1);
            }
        }
    }

    handleAttack(canvasWidth, canvasHeight) {
        const { dx, dy, dist } = this.distanceToTarget();

        if (dist < this.safe_distance) {
            this.move(dx, dy, canvasWidth, canvasHeight, false);
        } else if (dist < this.attack_vision) {
            this.move(dx, dy, canvasWidth, canvasHeight, true);
        }

        this.shoot_timer--;
        this.summon_timer--;

        if (!this.isSummoning && dist <= this.attack_vision) {
            if (this.summon_timer <= 0) {
                this.startSummoning();
            } else if (this.shoot_timer <= 0) {
                this.handleShootingSeeds();
            }
        }

        this.handleSummoning();
    }

    update(canvasWidth = 800, canvasHeight = 600) {
        const { dist } = this.distanceToTarget();

        this.handleStates(dist);

        switch (this.ENEMY_STATE) {
            case "ATTACK":
                this.handleAttack(canvasWidth, canvasHeight);
                break;
            case "PATROL":
            default:
                this.patrol(canvasWidth, canvasHeight);
        }

        this.updateSeeds(canvasWidth, canvasHeight);
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            for (let seed of this.seeds) {
                if (seed.isObstacle) {
                    enemies.push(seed);
                }
            }
            this._destroy = true;
        }
    }

    draw() {
        super.draw();

        fill(255, 165, 0);
        noStroke();
        rectMode(CENTER);
        rect(this.x, this.y, this.size, this.size);

        if (this.isSummoning) {
            push();
            noFill();
            stroke(255, 50, 50);
            strokeWeight(2);
            const pulse = map(this.summoning_timer, 0, this.summoning_duration, this.size * 2, 0);
            ellipse(this.x, this.y, pulse, pulse);
            pop();
        }

        for (let seed of this.seeds) {
            seed.draw();
        }
    }
}
