class Enemy extends Collision {
  constructor(x, y, max_health = 50, damage = 5, speed = 0.85, size = 25) {
    super(x, y, speed, size);

    this.max_health = max_health;
    this.health = max_health;
    this.damage = damage;

    this.attackCooldown = 60;
    this.colliderRadius = size / 2;

    this.direction = p5.Vector.fromAngle(random(TWO_PI));
  }

  update(canvasWidth, canvasHeight, enemies) {
    this.attackCooldown = max(this.attackCooldown - 1, 0);

    if (!this.direction || isNaN(this.direction.x) || isNaN(this.direction.y)) {
      this.direction = p5.Vector.fromAngle(random(TWO_PI));
    }
    this.x += this.direction.x * this.speed;
    this.y += this.direction.y * this.speed;

    // Clamp inside canvas bounds
    this.x = constrain(this.x, this.size / 2, canvasWidth - this.size / 2);
    this.y = constrain(this.y, this.size / 2, canvasHeight - this.size / 2);

    this.collider(enemies);
    this.checkWallCollision(canvasWidth, canvasHeight);
  }

  takeDamage(amount) {
    this.health = max(this.health - amount, 0);
  }

  heal(amount) {
    this.health = min(this.health + amount, this.max_health);
  }

  isDead() {
    return this.health <= 0;
  }

  collider(enemies) {
    if (!enemies || !Array.isArray(enemies)) return [];

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
    square(this.x - this.size / 2, this.y - this.size / 2, this.size, 10);
  }
}
