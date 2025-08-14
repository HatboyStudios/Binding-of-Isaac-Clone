class Vine extends Enemy {
    constructor(id, x, y, target, damage = 10, speed = 0, size = 40, max_health = 40) {
        super(x, y, max_health, damage, speed, size);

        this.id = id;
        this.target = target;

        this.attack_radius = 90;
        this.attack_cooldown = 80;
        this.attack_timer = 0;

        this.valid_attack_directions = ['up', 'down', 'left', 'right'];
        this.ENEMY_STATE = "idle";

        this.attack_duration = 20;
        this.attack_anim_timer = 0;

        this.current_attack_direction = null;
        this.no_collision_push = true;
    }

    update() {
        if (this.isDead()) {
            if (!this._hasHandledDeath) {
                this.handleDeath();
                this._hasHandledDeath = true;
            }
            return;
        }

        const { dx, dy, dist } = this.distanceToTarget();

        this.handleStates(dist);

        if (this.ENEMY_STATE === "ATTACK") {
            this.vineWhip(dx, dy);
        }

        this.attack_timer = Math.max(0, this.attack_timer - 1);
        if (this.attack_anim_timer > 0) {
            this.attack_anim_timer--;
            if (this.attack_anim_timer <= 0) {
                this.current_attack_direction = null;
            }
        }
    }

    handleStates(dist) {
        if (dist <= this.attack_radius && this.attack_timer <= 0) {
            this.ENEMY_STATE = "ATTACK";
        } else {
            this.ENEMY_STATE = "idle";
        }
    }

    vineWhip(dx, dy) {
        const angle = Math.atan2(dy, dx);

        let direction = null;

        if (Math.abs(angle) < Math.PI / 4) {
            direction = 'right';
        } else if (Math.abs(angle) > 3 * Math.PI / 4) {
            direction = 'left';
        } else if (angle < 0) {
            direction = 'up';
        } else {
            direction = 'down';
        }

        if (this.valid_attack_directions.includes(direction)) {
            this.current_attack_direction = direction;
            this.attack_anim_timer = this.attack_duration;
            const whipLength = this.size * 2.5;
            const whipThickness = this.size;

            let hitbox = {
                x: this.x,
                y: this.y,
                w: 0,
                h: 0
            };

            switch (direction) {
                case 'up':
                    hitbox.x = this.x - whipThickness / 2;
                    hitbox.y = this.y - whipLength;
                    hitbox.w = whipThickness;
                    hitbox.h = whipLength;
                    break;
                case 'down':
                    hitbox.x = this.x - whipThickness / 2;
                    hitbox.y = this.y;
                    hitbox.w = whipThickness;
                    hitbox.h = whipLength;
                    break;
                case 'left':
                    hitbox.x = this.x - whipLength;
                    hitbox.y = this.y - whipThickness / 2;
                    hitbox.w = whipLength;
                    hitbox.h = whipThickness;
                    break;
                case 'right':
                    hitbox.x = this.x;
                    hitbox.y = this.y - whipThickness / 2;
                    hitbox.w = whipLength;
                    hitbox.h = whipThickness;
                    break;
            }

            if (this.rectsIntersect(hitbox, this.target)) {
                this.target.takeDamage(this.damage);
            }

            this.attack_timer = this.attack_cooldown;
        }

        this.ENEMY_STATE = "idle";
    }

    rectsIntersect(a, b) {
        return (
            a.x < b.x + b.size &&
            a.x + a.w > b.x - b.size &&
            a.y < b.y + b.size &&
            a.y + a.h > b.y - b.size
        );
    }

    distanceToTarget() {
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        return { dx, dy, dist: Math.hypot(dx, dy) };
    }

    draw() {
        super.draw();

        fill(50, 200, 50);
        noStroke();
        rect(this.x, this.y, this.size, this.size);
        rectMode(CENTER);

        if (this.attack_anim_timer > 0 && this.current_attack_direction) {
            push();
            stroke(255, 0, 0, 120);
            strokeWeight(1);
            noFill();

            const whipLength = this.size * 2.5;
            const whipThickness = this.size;

            let x = this.x, y = this.y, w = 0, h = 0;

            switch (this.current_attack_direction) {
                case 'up':
                    x = this.x - whipThickness / 2;
                    y = this.y - whipLength;
                    w = whipThickness;
                    h = whipLength;
                    break;
                case 'down':
                    x = this.x - whipThickness / 2;
                    y = this.y;
                    w = whipThickness;
                    h = whipLength;
                    break;
                case 'left':
                    x = this.x - whipLength;
                    y = this.y - whipThickness / 2;
                    w = whipLength;
                    h = whipThickness;
                    break;
                case 'right':
                    x = this.x;
                    y = this.y - whipThickness / 2;
                    w = whipLength;
                    h = whipThickness;
                    break;
            }

            rectMode(CORNER);
            rect(x, y, w, h);
            pop();
        }
    }

    handleDeath() {
        console.log(`Vine ${this.id} died.`);
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this._destroy = true;
        }
    }
}
