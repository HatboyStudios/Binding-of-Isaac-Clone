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