class Seed extends Enemy {
    constructor(x, y, dx, dy, target, type, damage = 10, onDestroy = null, speed = 3, size = 8, max_health = 10) {
        super(x, y, max_health, damage, speed, size);

        this.dx = dx;
        this.dy = dy;
        this.target = target;
        this.type = type;

        this.speed = speed;
        this.size = size;
        this.life = 600;

        this.startX = x;
        this.startY = y;

        this.isObstacle = false;
        this.health = max_health;

        this.blast_radius = 120;
        this.damage_increase = damage * 1.2;

        this.onDestroy = onDestroy;
    }

    explode() {
        for (let enemy of enemies) {
            if (enemy === this) continue;

            const is_self = typeof enemy.takeDamage === 'function' && enemy !== this;
            const blast = Math.hypot(this.x - enemy.x, this.y - enemy.y) <= this.blast_radius;

            if (is_self && blast) {
                enemy.takeDamage(this.damage_increase);
            }
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

        if (!this.isObstacle) {
            this.x += this.dx * this.speed;
            this.y += this.dy * this.speed;
            this.life--;

            const dxTravel = this.x - this.startX;
            const dyTravel = this.y - this.startY;
            const distanceTraveled = Math.hypot(dxTravel, dyTravel);

            if (this.type === "LINGER" && distanceTraveled >= random(60, 100)) {
                this.dx = 0;
                this.dy = 0;
                this.walk_over = true;
                this.isObstacle = true;
            }

            if (this.type === "ALIVE" && this.life <= 580) {
                const angle = Math.random() * Math.PI * 2;
                const radius = 30 + Math.random() * 40;
                const spawnX = this.x + Math.cos(angle) * radius;
                const spawnY = this.y + Math.sin(angle) * radius;

                const root = new RootSeed(spawnX, spawnY, this.target);
                console.log(root)
                enemies.push(root);

                this._destroy = true;
                if (this.onDestroy) this.onDestroy();
                return;
            }

            const dx = this.x - this.target.x;
            const dy = this.y - this.target.y;
            const dist = Math.hypot(dx, dy);

            if (dist < (this.target.size || 20) / 2) {
                if (typeof this.target.takeDamage === 'function') {
                    this.target.takeDamage(this.damage);
                }
                if (this.type === "EXPLODE") this.explode();
                this._destroy = true;
                if (this.onDestroy) this.onDestroy();
            }

            if (this.life <= 0 || this.x < 0 || this.x > canvasWidth || this.y < 0 || this.y > canvasHeight) {
                if (this.type === "EXPLODE") this.explode();
                this._destroy = true;
                if (this.onDestroy) this.onDestroy();
            }
        } else {
            const dx = this.x - this.target.x;
            const dy = this.y - this.target.y;
            const dist = Math.hypot(dx, dy);

            if (dist < (this.size + (this.target.size || 20)) / 2) {
                if (typeof this.target.takeDamage === 'function') {
                    this.target.takeDamage(this.damage);
                    this.health = 0;
                }
                this._destroy = true;
                if (this.onDestroy) this.onDestroy();
            }
        }
    }


    takeDamage(amount) {
        if (!this.isObstacle) return;
        this.health -= amount;
        if (this.health <= 0) {
            this._destroy = true;
        }
    }

    draw() {
        super.draw();
        push();
        noStroke();
        if (this.type === "EXPLODE") {
            fill(255, 100, 0);
            ellipse(this.x, this.y, this.size * 1.5);
        } else if (this.isObstacle) {
            fill(100, 50, 0);
            rectMode(CENTER);
            rect(this.x, this.y, this.size * 1.5, this.size * 1.5);
        } else {
            fill(100, 50, 0);
            ellipse(this.x, this.y, this.size);
        }
        pop();
    }

    handleDeath() {
        console.log(`Seeds ${this.id} died.`);
    }
}

class RootSeed extends Seed {
    constructor(x, y, target, damage = 8, speed = 0.8, size = 18, max_health = 25) {
        super(x, y, 0, 0, target, "ROOT", damage, null, speed, size, max_health);

        this.wanderTimer = 0;
        this.wanderInterval = 90 + Math.random() * 60;
        this.wanderTarget = { x: this.x, y: this.y };
        this.seekRadius = 200;

        this.attack_rate = 60;
        this.attack_cooldown = 0;

        this.isObstacle = false;
    }

     takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this._destroy = true;
            if (this.onDestroy) this.onDestroy();
        }
    }

    update(canvasWidth, canvasHeight) {
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const distToPlayer = Math.hypot(dx, dy);

        if (this.attack_cooldown > 0) {
            this.attack_cooldown--;
        }

        if (distToPlayer < this.seekRadius) {
            const mag = Math.hypot(dx, dy);
            const moveX = (dx / mag) * this.speed;
            const moveY = (dy / mag) * this.speed;
            this.x += moveX;
            this.y += moveY;
        } else {
            this.wanderTimer--;
            if (this.wanderTimer <= 0) {
                const angle = Math.random() * Math.PI * 2;
                const radius = Math.random() * 80;
                this.wanderTarget.x = this.x + Math.cos(angle) * radius;
                this.wanderTarget.y = this.y + Math.sin(angle) * radius;
                this.wanderTimer = this.wanderInterval;
            }

            const dxW = this.wanderTarget.x - this.x;
            const dyW = this.wanderTarget.y - this.y;
            const distW = Math.hypot(dxW, dyW);
            if (distW > 2) {
                this.x += (dxW / distW) * this.speed * 0.5;
                this.y += (dyW / distW) * this.speed * 0.5;
            }
        }

        const dpx = this.x - this.target.x;
        const dpy = this.y - this.target.y;
        const distPlayer = Math.hypot(dpx, dpy);
        if (distPlayer < (this.target.size || 20) / 2 + this.size / 2 && this.attack_cooldown === 0) {
            if (typeof this.target.takeDamage === 'function') {
                this.target.takeDamage(this.damage);
                this.attack_cooldown = this.attack_rate;
            }
            this._destroy = true;
            if (this.onDestroy) this.onDestroy();
        }

        if (this.x < 0 || this.x > canvasWidth || this.y < 0 || this.y > canvasHeight) {
            this._destroy = true;
        }
    }

    draw() {
        push();
        noStroke();
        fill(50, 120, 50);
        ellipse(this.x, this.y, this.size, this.size);
        pop();
    }
}
