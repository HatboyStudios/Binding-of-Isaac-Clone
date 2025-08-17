class Blocker extends Enemy {
    constructor(id, x, y, target, max_health = 120, damage = 0, speed = 0.7, size = 28) {
        super(x, y, max_health, damage, speed, size);

        this.id = id;
        this.target = target;

        this.attack_range = 60;
        this.vision_area = 150;
        this.enemy_state = 'PATROL';

        this.patrol_center_x = x;
        this.patrol_center_y = y;
        this.patrol_radius = 75;
        this.patrol_target_x = x;
        this.patrol_target_y = y;
        this.patrol_timer = 0;
        this.patrol_interval = 120;

        this._hasHandledDeath = false;
    }

    update(canvasWidth, canvasHeight) {
        if (this.isDead()) {
            if (!this._hasHandledDeath) {
                this.handleDeath();
                this._hasHandledDeath = true;
            }
            return;
        }

        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const distance = Math.hypot(dx, dy);

        const seenPlayer = this.checkVision();

        this.handleState(distance, seenPlayer);

        switch (this.enemy_state) {
            case 'BLOCK':
                this.moveTowards(this.target.x, this.target.y, canvasWidth, canvasHeight);
                this.blockPlayer();
                break;

            case 'PATROL':
                this.patrol(canvasWidth, canvasHeight);
                break;
        }
    }

    handleState(distance, seenPlayer) {
        if (seenPlayer || distance <= this.attack_range) {
            this.enemy_state = 'BLOCK';
        } else {
            this.enemy_state = 'PATROL';
        }
    }

    checkVision() {
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const distance = Math.hypot(dx, dy);
        return distance <= this.vision_area;
    }

    patrol(canvasWidth, canvasHeight) {
        this.patrol_timer--;

        const dx = this.patrol_target_x - this.x;
        const dy = this.patrol_target_y - this.y;
        const distance_to_target = Math.hypot(dx, dy);

        if (this.patrol_timer <= 0 || distance_to_target < 15) {
            this.newTarget(canvasWidth, canvasHeight);
            this.patrol_timer = this.patrol_interval + Math.random() * 60;
        }

        this.moveTowards(
            this.patrol_target_x,
            this.patrol_target_y,
            canvasWidth,
            canvasHeight,
            this.speed * 0.75
        );
    }

    newTarget(canvasWidth, canvasHeight) {
        const margin = this.size;
        let attempts = 0;

        while (attempts < 10) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * this.patrol_radius;
            const new_x = this.patrol_center_x + Math.cos(angle) * radius;
            const new_y = this.patrol_center_y + Math.sin(angle) * radius;

            if (new_x >= margin && new_x <= canvasWidth - margin &&
                new_y >= margin && new_y <= canvasHeight - margin) {
                this.patrol_target_x = new_x;
                this.patrol_target_y = new_y;
                return;
            }
            attempts++;
        }

        this.patrol_target_x = this.x;
        this.patrol_target_y = this.y;
    }

    blockPlayer() {
        const buffer = 2;
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const distance = Math.hypot(dx, dy);

        const min_distance = this.size / 2 + this.target.size / 2 + buffer;

        if (distance < min_distance) {
            const push_x = (dx / distance) * (min_distance - distance);
            const push_y = (dy / distance) * (min_distance - distance);
            this.target.x += push_x;
            this.target.y += push_y;
        }
    }

    draw() {
        super.draw();

        noStroke();
        fill(255, 0, 0);
        rectMode(CORNER);
        square(this.x - this.size / 2, this.y - this.size / 2, this.size);

        noFill();
        stroke(0, 255, 0);
        strokeWeight(2);
        rectMode(CENTER);
        rect(this.x, this.y, this.size, this.size);

        rectMode(CORNER);
    }

    handleDeath() {
        console.log(`Blocker ${this.id} died.`);
    }
}

class TankBlocker extends Blocker {
    constructor(id, x, y, target) {
        super(id, x, y, target);
        this.max_health = 250;
        this.health = this.max_health;
        this.speed = 0.4;
        this.size = 40;
        this.patrol_radius = 50;
    }

    update(canvasWidth, canvasHeight) {
        super.update(canvasWidth, canvasHeight);
    }

    handleDeath() {
        console.log(`TankBlocker ${this.id} died.`);
    }
}

class FastBlocker extends Blocker {
    constructor(id, x, y, target) {
        super(id, x, y, target);
        this.max_health = 80;
        this.health = this.max_health;
        this.speed = 1.2;
        this.size = 20;
        this.patrol_radius = 120;
        this.patrol_interval = 80;
    }

    handleDeath() {
        console.log(`AgileBlocker ${this.id} died.`);
    }
}

class TeleportBlocker extends Blocker {
    constructor(id, x, y, target) {
        super(id, x, y, target);
        this.max_health = 80;
        this.health = this.max_health;
        this.speed = 1.2;
        this.size = 20;
        this.patrol_radius = 120;
        this.patrol_interval = 80;

        this.vision_range = 120;
        this.aggro_range = 220;

        this.teleport_range = 80;
        this.skill_cooldown_rate = 150;
        this.skill_cooldown = 0;
    }

    update(canvasWidth, canvasHeight) {
        if (this.isDead()) {
            if (!this._hasHandledDeath) {
                this.handleDeath();
                this._hasHandledDeath = true;
            }
            return;
        }

        const { dx, dy, dist } = this.distanceToTarget();

        if (this.skill_cooldown > 0) this.skill_cooldown--;

        if (dist > this.teleport_range && this.skill_cooldown <= 0) {
            this.performTeleport(dx, dy, canvasWidth, canvasHeight);
        } else {
            super.update(canvasWidth, canvasHeight);
        }
    }

    distanceToTarget() {
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        return { dx, dy, dist: Math.hypot(dx, dy) };
    }

    performTeleport(dx, dy, canvasWidth, canvasHeight) {
        const dist = Math.hypot(dx, dy);
        if (dist === 0) return;

        const dirX = dx / dist;
        const dirY = dy / dist;

        const safeDistance = this.size * 1.5;
        const teleportDist = Math.min(this.teleport_range, dist - safeDistance);
        if (teleportDist <= 0) return;

        this.x = this.target.x - dirX * safeDistance;
        this.y = this.target.y - dirY * safeDistance;

        this.x = constrain(this.x, this.size / 2, canvasWidth - this.size / 2);
        this.y = constrain(this.y, this.size / 2, canvasHeight - this.size / 2);

        this.skill_cooldown = this.skill_cooldown_rate;
    }

    draw() {
        super.draw();

        if (this.skill_cooldown <= 10) {
            push();
            noFill();
            stroke(200, 0, 255, 150);
            strokeWeight(2);
            ellipse(this.x, this.y, this.size * 2);
            pop();
        }
    }

    handleDeath() {
        console.log(`TeleportBlocker ${this.id} died.`);
    }
}

