class Cultist extends Enemy {
    constructor(id, x, y, target, max_health = 100, damage = 25, speed = 1.75, size = 30) {
        super(x, y, max_health, damage, speed, size);
        this.id = id;
        this.target = target;

        this.vision_range = 140;
        this.aggro_range = 200;
        this.attack_range = 40;
        this.ENEMY_STATE = "PATROL";

        this.attack_rate = 60;
        this.attack_cooldown = 0;
        this.min_attack_distance = 30;

        this.patrol_radius = 360;
        this.patrol_center_x = x;
        this.patrol_center_y = y;
        this.patrol_target_x = x;
        this.patrol_target_y = y;
        this.patrol_timer = 0;
        this.patrol_interval = 180;
    }

    targetDistance() {
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        return {dx, dy, dist: Math.hypot(dx, dy)}
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
    }

    handleMeleeAttack(canvasWidth, canvasHeight) {
        const { dx, dy, dist } = this.targetDistance();

        if (dist > this.min_attack_distance) {
            this.move(dx, dy, canvasWidth, canvasHeight, true, 1);
        }

        if (dist <= this.attack_range && this.attack_cooldown <= 0) {
            this.target.takeDamage(this.damage);
            this.attack_cooldown = this.attack_rate;
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
        if (this.dodgeCooldownTimer > 0) this.dodgeCooldownTimer--;

        const { dx, dy, dist } = this.targetDistance();
        this.handleStates(dist);

        switch (this.ENEMY_STATE) {
            case "ATTACK":
                this.handleMeleeAttack(canvasWidth, canvasHeight);
                break;
            case "AGGRO":
                this.move(dx, dy, canvasWidth, canvasHeight, true, 1);
                break;
            case "PATROL":
            default:
                this.patrol(canvasWidth, canvasHeight);
                break;
        }
    }

    handleStates(dist) {
        if (dist <= this.attack_range) {
            this.ENEMY_STATE = "ATTACK";
        } else if (dist <= this.vision_range) {
            this.ENEMY_STATE = "AGGRO"
        } else {
            this.ENEMY_STATE = "PATROL"
        }
    } 

    draw() {
        super.draw();
        fill(0);
        noStroke();
        rectMode(CENTER);
        rect(this.x, this.y, this.size, this.size);
    }

    handleDeath() {
        console.log(`Cultist ${this.id} died.`);
    }
}

class RapidCultist extends Cultist {
    constructor(id, x, y, target) {
        super(id, x, y, target, 60, 15, 2, 25);
        this.attack_rate = 20; 
    }

    draw() {
        super.draw();
        fill(255, 100, 50);
        rect(this.x, this.y, this.size, this.size);
    }

    handleDeath() {
        console.log(`RapidCultist ${this.id} died.`);
    }
}

class TankCultist extends Cultist {
    constructor(id, x, y, target) {
        super(id, x, y, target, 200, 35, 0.5, 40); 
        this.patrol_radius = 100;
    }

    draw() {
        super.draw();
        fill(50, 50, 150);
        rect(this.x, this.y, this.size, this.size);
    }

    handleDeath() {
        console.log(`TankCultist ${this.id} died.`);
    }
}

class MartyrCultist extends Cultist {
    constructor(id, x, y, target) {
        super(id, x, y, target, 70, 0, 1.0, 30);
        this.explode_range = 40;
        this.explode_warning_time = 30;
        this.has_exploded = false;
        this.explosion_damage = 35;
        this.speed = 1.9;
    }

    distanceToTarget() {
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        return { dx, dy, dist: Math.hypot(dx, dy) };
    }

    moveTowardsTarget(canvasWidth, canvasHeight) {
        const { dx, dy, dist } = this.distanceToTarget();
        if (dist === 0) return;

        const dirX = dx / dist;
        const dirY = dy / dist;

        this.x += dirX * this.speed;
        this.y += dirY * this.speed;

        this.x = constrain(this.x, this.size / 2, canvasWidth - this.size / 2);
        this.y = constrain(this.y, this.size / 2, canvasHeight - this.size / 2);
    }

    triggerExplosion() {
        if (!this.has_exploded) {
            this.has_exploded = true;
            console.log(`MartyrCultist ${this.id} exploded!`);
            this.target.takeDamage(this.explosion_damage);
            this.health = 0;
        }
    }

    update(canvasWidth, canvasHeight) {
        if (this.isDead() || this.has_exploded) {
            if (!this._hasHandledDeath) {
                this.handleDeath();
                this._hasHandledDeath = true;
            }
            return;
        }

        const { dx, dy, dist } = this.distanceToTarget();

        this.moveTowardsTarget(canvasWidth, canvasHeight);

        if (dist <= this.explode_range) {
            this.triggerExplosion();
        }
    }

    draw() {
        super.draw();
        fill(255, 50, 50);
        rect(this.x, this.y, this.size, this.size);
    }

    handleDeath() {
        console.log(`MartyrCultist ${this.id} died.`);
    }
}

class ShooterCultist extends Cultist {
    constructor(id, x, y, target) {
        super(id, x, y, target, 70, 10, 1, 30);
        this.shoot_cooldown = 60;
        this.shoot_timer = this.shoot_cooldown;

        const rarity = getRandomKey(WeaponTiers);
        const material = getRandomKey(MaterialTiers);
        const effect = getRandomEffect();

        this.weapon = new AutoPistol(this, undefined, 5, undefined, 12, 40, rarity, material, effect);
        this.vision_range = 300;
        this.safe_distance = 120;
    }

    update(canvasWidth, canvasHeight) {
        if (this.isDead()) {
            if (!this._hasHandledDeath) {
                this.handleDeath();
                this._hasHandledDeath = true;
            }
            return;
        }

        const { dx, dy, dist } = this.targetDistance();
        if (dist <= this.vision_range) {
            if (dist < this.safe_distance) {
                this.move(dx, dy, canvasWidth, canvasHeight, false);
            } else {
                this.move(dx, dy, canvasWidth, canvasHeight, true);
            }

            this.shoot_timer--;
            if (this.shoot_timer <= 0) {
                if (this.weapon.ammo_manager.current_ammo > 0) {
                    this.weapon.fire({ x: dx, y: dy });
                } else if (this.weapon.ammo_manager.total_ammo > 0) {
                    this.weapon.reload();
                }
                this.shoot_timer = this.shoot_cooldown;
            }
        } else {
            this.patrol(canvasWidth, canvasHeight);
        }
    }

    draw() {
        super.draw();
        fill(0, 200, 255);
        rect(this.x, this.y, this.size, this.size);
    }

    handleDeath() {
        console.log(`ShooterCultist ${this.id} died.`);
    }
}
