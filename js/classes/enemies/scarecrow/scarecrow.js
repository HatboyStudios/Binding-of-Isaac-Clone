class Scarecrow extends Enemy {
    constructor(id, x, y, target, max_health = 60, damage = 10, speed = 0.4, size = 30) {
        super(x, y, max_health, damage, speed, size);
        this.id = id;
        this.target = target;

        this.summon_cooldown = 180;
        this.summon_timer = this.summon_cooldown;

        this.vision_range = 250;
        this.safe_distance = 100;

        this.crows = [];
    }

    distanceToTarget() {
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        return { dx, dy, dist: Math.hypot(dx, dy) };
    }

    moveAway(dx, dy, canvasWidth, canvasHeight) {
        const mag = Math.hypot(dx, dy);
        if (mag > 0) {
            this.x = constrain(this.x - (dx / mag) * this.speed * 5, this.size / 2, canvasWidth - this.size / 2);
            this.y = constrain(this.y - (dy / mag) * this.speed * 5, this.size / 2, canvasHeight - this.size / 2);
        }
    }

    summonCrow() {
        const { dx, dy } = this.distanceToTarget();
        const mag = Math.hypot(dx, dy);
        if (mag === 0) return;

        this.crows.push({
            x: this.x,
            y: this.y,
            dx: dx / mag,
            dy: dy / mag,
            speed: 2,
            size: 8,
            life: 180 
        });
    }

    updateCrows(canvasWidth, canvasHeight) {
        for (let i = this.crows.length - 1; i >= 0; i--) {
            const crow = this.crows[i];
            crow.x += crow.dx * crow.speed;
            crow.y += crow.dy * crow.speed;
            crow.life--;

            const dx = crow.x - this.target.x;
            const dy = crow.y - this.target.y;
            const dist = Math.hypot(dx, dy);
            if (dist < (this.target.size || 20) / 2) {
                if (this.target && typeof this.target.takeDamage === 'function') {
                    this.target.takeDamage(this.damage);
                }
                this.crows.splice(i, 1);
            continue;
            }

            if (crow.life <= 0 ||
                crow.x < 0 || crow.x > canvasWidth ||
                crow.y < 0 || crow.y > canvasHeight) {
            this.crows.splice(i, 1);
            }
        }
    }

    update(canvasWidth = 800, canvasHeight = 600) {
        const { dx, dy, dist } = this.distanceToTarget();

        if (dist < this.safe_distance) {
            this.moveAway(dx, dy, canvasWidth, canvasHeight);
        }

        if (dist <= this.vision_range) {
            this.summon_timer--;
            if (this.summon_timer <= 0) {
            this.summonCrow();
            this.summon_timer = this.summon_cooldown;
            }
        }

        this.updateCrows(canvasWidth, canvasHeight);
    }

    draw() {
        super.draw();

        fill(139, 69, 19);
        rect(this.x - this.size / 4, this.y - this.size / 2, this.size / 2, this.size);

        for (let crow of this.crows) {
            fill(0);
            ellipse(crow.x, crow.y, crow.size);
        }
    }
}
