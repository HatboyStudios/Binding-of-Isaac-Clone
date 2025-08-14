class Shooter extends Enemy {
    constructor(id, x, y, target, max_health = 60, damage = 10, speed = 0.5, size = 30) {
        super(x, y, max_health, damage, speed, size);
        this.id = id;
        this.target = target;

        this.shoot_cooldown = 60; 
        this.shoot_timer = this.shoot_cooldown;

        this.vision_range = 300;   
        this.safe_distance = 120;  

        this.bullets = [];

        this.patrol_center_x = x;
        this.patrol_center_y = y;
        this.patrol_radius = 200;
        this.patrol_target_x = x;
        this.patrol_target_y = y;
        this.patrol_timer = 0;
        this.patrol_interval = 180;

        this.ENEMY_STATE = 'PATROL';
    }

    distanceToTarget() {
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        return { dx, dy, dist: Math.hypot(dx, dy) };
    }

    move(dx, dy, canvasWidth, canvasHeight, toward = true, factor = 1) {
        const mag = Math.hypot(dx, dy);
        if (mag === 0) return;
        const sign = toward ? 1 : -1;
        this.x = constrain(this.x + (dx / mag) * this.speed * factor * sign, this.size / 2, canvasWidth - this.size / 2);
        this.y = constrain(this.y + (dy / mag) * this.speed * factor * sign, this.size / 2, canvasHeight - this.size / 2);
    }

    createBullets() {
        const { dx, dy } = this.distanceToTarget();
        const mag = Math.hypot(dx, dy);
        if (mag === 0) return;

        this.bullets.push({
            x: this.x,
            y: this.y,
            dx: dx / mag,
            dy: dy / mag,
            speed: 3,
            size: 8,
            life: 180
        });
    }

    updateBullets(canvasWidth, canvasHeight) {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.x += bullet.dx * bullet.speed;
            bullet.y += bullet.dy * bullet.speed;
            bullet.life--;

            const dx = bullet.x - this.target.x;
            const dy = bullet.y - this.target.y;
            const dist = Math.hypot(dx, dy);
            if (dist < (this.target.size || 20) / 2) {
                if (this.target && typeof this.target.takeDamage === 'function') {
                    this.target.takeDamage(this.damage);
                }
                this.bullets.splice(i, 1);
                continue;
            }

            if (bullet.life <= 0 || bullet.x < 0 || bullet.x > canvasWidth || bullet.y < 0 || bullet.y > canvasHeight) {
                this.bullets.splice(i, 1);
            }
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

    handleAggro(canvasWidth, canvasHeight) {
        const { dx, dy, dist } = this.distanceToTarget();

        if (dist < this.safe_distance) {
            this.move(dx, dy, canvasWidth, canvasHeight, false); 
        } else if (dist < this.vision_range) {
            this.move(dx, dy, canvasWidth, canvasHeight, true);
        }

        if (dist <= this.vision_range) {
            this.shoot_timer--;
            if (this.shoot_timer <= 0) {
                this.createBullets();
                this.shoot_timer = this.shoot_cooldown;
            }
        }
    }

    update(canvasWidth = 800, canvasHeight = 600) {
        const { dist } = this.distanceToTarget();

        if (dist <= this.vision_range) {
            this.ENEMY_STATE = 'AGGRESSIVE';
        } else {
            this.ENEMY_STATE = 'PATROL';
        }

        switch (this.ENEMY_STATE) {
            case 'AGGRESSIVE':
                this.handleAggro(canvasWidth, canvasHeight);
                break;

            case 'PATROL':
            default:
                this.patrol(canvasWidth, canvasHeight);
                break;
        }

        this.updateBullets(canvasWidth, canvasHeight);
    }

    draw() {
        super.draw();

        fill(0, 200, 255);
        noStroke();
        rectMode(CENTER);
        rect(this.x, this.y, this.size, this.size);

        for (let bullet of this.bullets) {
            fill(0);
            ellipse(bullet.x, bullet.y, bullet.size);
        }
    }
}
