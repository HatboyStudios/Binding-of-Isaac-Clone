class Collision {
    constructor(x, y, speed, size) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.size = size;
    }

    checkWallCollision(canvas_width, canvas_height) {
        if (this.x < 0) this.x = 0;
        if (this.x + this.size > canvas_width) this.x = canvas_width - this.size;

        if (this.y < 0) this.y = 0;
        if (this.y + this.size > canvas_height) this.y = canvas_height - this.size;
    }

    collider(enemies, bullets, player) {
        if (!enemies || !Array.isArray(enemies)) return [];

        let colliding = [];

        for (let other of enemies) {
            if (other === this) continue;

            const half_size_A = this.size / 2;
            const half_size_B = other.size / 2;

            const overlap_X = Math.abs(this.x - other.x) < half_size_A + half_size_B;
            const overlap_Y = Math.abs(this.y - other.y) < half_size_A + half_size_B;

            if (overlap_X && overlap_Y) {
                colliding.push(other);

                if (this.walk_over || other.walk_over) continue;
                if (this.no_collision_push || other.no_collision_push) continue;
                
                const overlap_amount_X = (half_size_A + half_size_B) - Math.abs(this.x - other.x);
                const overlap_amount_Y = (half_size_A + half_size_B) - Math.abs(this.y - other.y);

                if (overlap_amount_X < overlap_amount_Y) {
                    if (this.x < other.x) {
                        this.x -= overlap_amount_X / 2;
                        other.x += overlap_amount_X / 2;
                    } else {
                        this.x += overlap_amount_X / 2;
                        other.x -= overlap_amount_X / 2;
                    }
                    } else {
                    if (this.y < other.y) {
                        this.y -= overlap_amount_Y / 2;
                        other.y += overlap_amount_Y / 2;
                    } else {
                        this.y += overlap_amount_Y / 2;
                        other.y -= overlap_amount_Y / 2;
                    }
                }
            }
        }

        if (player) {
            const radiusA = this.size / 2;
            const radiusB = player.size / 2;

            const dx = this.x - player.x;
            const dy = this.y - player.y;

            const distance = Math.hypot(dx, dy);
            const minDistance = radiusA + radiusB;

            if (!this.walk_over && distance < minDistance && distance > 0) {
                const overlap = minDistance - distance;
                const pushX = (dx / distance) * overlap;
                const pushY = (dy / distance) * overlap;

                if (!this.no_collision_push) {
                    this.x += pushX * 0.6;
                    this.y += pushY * 0.6;
                } else {
                    player.x -= pushX;
                    player.y -= pushY;
                }
            }
        }

        if (bullets && typeof bullets.length === "number") {
            for (let i = bullets.length - 1; i >= 0; i--) {
                const bullet = bullets[i];

                if (bullet.owner === this) {
                    continue;
                }
                if (this instanceof Enemy && bullet.owner instanceof Enemy) {
                    continue;
                }

                const half_size_A = this.size / 2;
                const half_size_B = bullet.size / 2;

                const overlap_X = Math.abs(this.x - bullet.x) < half_size_A + half_size_B;
                const overlap_Y = Math.abs(this.y - bullet.y) < half_size_A + half_size_B;

                if (overlap_X && overlap_Y) {
                    if (typeof this.takeDamage === "function") {
                        this.takeDamage(bullet.damage);
                    }

                    bullet.remove();
                }
            }
        }
        return colliding;
    }
}
