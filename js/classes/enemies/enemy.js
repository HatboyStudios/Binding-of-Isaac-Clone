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

    draw() {
        fill(255, 0, 0); 
        square(this.x, this.y, 40, 10);
    }
}
