class Enemy {
    constructor(x, y, max_health, damage, speed, size) {
        this.x = x;
        this.y = y;
        this.max_health = max_health;
        this.health = max_health;
        this.damage = damage;
        this.speed = speed;
        this.size = size;

        this.attackCooldown = 60;
        this.colliderRadius = size / 2;

        let angle = Math.random() * Math.PI * 2;
        this.direction = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        };
    }

    update() {
        this.attackCooldown--;
    }

    takeDamage(damage) {
        this.health = Math.max(this.health - damage, 0);
    }

    heal(amount) {
        this.health = Math.min(this.health + amount, this.max_health);
    }

    isDead() {
        return this.health <= 0;
    }

    collider(enemies) {
        let colliding = [];
        for (let other of enemies) {
            if (other === this) continue;
            let dx = this.x - other.x;
            let dy = this.y - other.y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            let minDist = this.colliderRadius + other.colliderRadius;
            if (dist < minDist && dist > 0) {
            colliding.push(other);
            let overlap = minDist - dist;
                this.x += (dx / dist) * (overlap / 2);
                this.y += (dy / dist) * (overlap / 2);
            }
        }
    return colliding;
    }

    draw() {
        fill(255, 0, 0);
        square(this.x, this.y, this.size, 10);
    }
}
