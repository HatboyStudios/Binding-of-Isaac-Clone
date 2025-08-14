class Werewolf extends Enemy {
    constructor(id, x, y, target, max_health = 60, damage = 6, speed = 0.6, size = 30) {
        super(x, y, max_health, damage, speed, size);
        this.id = id;
        this.target = target;

        this.vision_range = 140;
        this.attack_range = 40;

        this.state = 'COWARD';
        this.attackCooldown = 30;

        this.baseSpeed = speed;
        this.baseDamage = damage;

        this.patrol_radius = 150;
        this.patrol_center_x = x;
        this.patrol_center_y = y;
        this.patrol_target_x = x;
        this.patrol_target_y = y;
        this.patrol_change_timer = 0;
        this.patrol_change_interval = 120;
        this.patrol_speed_multiplier = 0.75;
    }

    takeDamage(amount) {
        super.takeDamage(amount);

        if (this.health > 0 && this.state !== 'AGGRO') {
            this.state = 'AGGRO';
        }
    }

    moveAway(dx, dy, canvasWidth, canvasHeight) {
        const mag = Math.hypot(dx, dy);
        if (mag > 0) {
            this.x = constrain(this.x - (dx / mag) * this.speed, this.size / 2, canvasWidth - this.size / 2);
            this.y = constrain(this.y - (dy / mag) * this.speed, this.size / 2, canvasHeight - this.size / 2);
        }
    }

    moveTowards(dx, dy, canvasWidth, canvasHeight) {
        const mag = Math.hypot(dx, dy);
        if (mag > 0) {
            this.x = constrain(this.x + (dx / mag) * this.speed, this.size / 2, canvasWidth - this.size / 2);
            this.y = constrain(this.y + (dy / mag) * this.speed, this.size / 2, canvasHeight - this.size / 2);
        }
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
        this.moveTowards(dx, dy, canvasWidth, canvasHeight);
    }

    update(canvasWidth, canvasHeight) {
        if (this.attackCooldown > 0) this.attackCooldown--;

        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const distance = Math.hypot(dx, dy);

        if (this.state === 'COWARD') {
            if (distance <= this.vision_range) {
                this.moveAway(dx, dy, canvasWidth, canvasHeight);
            } else {
                this.patrol(canvasWidth, canvasHeight);
            }
        }
        else if (this.state === 'AGGRO') {
            const health_percent = Math.max(0, this.health / this.max_health);
            const power_multiplier = 1 + (1 - health_percent) * 2.5;
            this.speed = this.baseSpeed * power_multiplier;
            this.damage = this.baseDamage * power_multiplier;

            if (distance <= this.attack_range) {
                if (this.attackCooldown <= 0) {
                    this.target.takeDamage(this.damage);
                    this.attackCooldown = 30;
                }
            } else {
                this.moveTowards(dx, dy, canvasWidth, canvasHeight);
            }
        }
    }

    draw() {
        super.draw();

        if (this.state === 'AGGRO') {
            const health_percent = Math.max(0, this.health / this.max_health);
            const anger_level = 255 - health_percent * 255;
            fill(255, 255, 19);
            stroke(anger_level, 0, 0);
            square(this.x - this.size / 2, this.y - this.size / 2, this.size, 10);
        } else {
            fill(139, 69, 19);
            square(this.x - this.size / 2, this.y - this.size / 2, this.size, 10);
        }
    }
}
