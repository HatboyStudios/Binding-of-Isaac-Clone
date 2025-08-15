class Enemy extends Collision {
  constructor(x, y, max_health = 50, damage = 5, speed, size = 25, buffs = []) {
    super(x, y, speed, size);

    this.max_health = max_health;
    this.health = max_health;
    this.damage = damage;
    this.speed = speed;

    this.attackCooldown = 60;
    this.colliderRadius = size / 2;

    this.direction = p5.Vector.fromAngle(random(TWO_PI));

    this.toggle_health_bar = false;
    this.walk_over = false;  
    this.no_collision_push = false;

    this.buffs = buffs || [];

    this._hasHandledDeath = false; 
  }

  constrain(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  takeDamage(amount) {
    this.toggle_health_bar = true;
    this.health = max(this.health - amount, 0);
  }

  heal(amount) {
    this.toggle_health_bar = true;
    this.health = min(this.health + amount, this.max_health);
  }

  isDead() {
    return this.health <= 0;
  }

  handleDeath() {
    this._hasHandledDeath = true;
  }

  updateBuffs() {
    if (!this.buffs) return;
    this.buffs = this.buffs.filter(buff => {
      buff.duration--;
      if (buff.health_regen && this.health < this.max_health) {
        this.health = Math.min(this.max_health, this.health + buff.health_regen);
      }
      if (buff.duration <= 0) {
        if (this.original_speed !== undefined) this.speed = this.original_speed;
        if (this.original_damage !== undefined) this.damage = this.original_damage;
        return false;
      }
      return true;
    });
  }

  move(dx, dy, canvasWidth, canvasHeight, toward = true, factor = 1) {
    const mag = Math.hypot(dx, dy);
    if (mag === 0) return;
    const sign = toward ? 1 : -1;
    this.x = constrain(this.x + (dx / mag) * this.speed * factor * sign, this.size / 2, canvasWidth - this.size / 2);
    this.y = constrain(this.y + (dy / mag) * this.speed * factor * sign, this.size / 2, canvasHeight - this.size / 2);
  }

  moveTowards(targetX, targetY, canvasWidth, canvasHeight) {
    if (!Number.isFinite(targetX) || !Number.isFinite(targetY)) return;

    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const distance = Math.hypot(dx, dy);

    if (distance > 5) {
      const moveX = (dx / distance) * this.speed;
      const moveY = (dy / distance) * this.speed;

      this.x = constrain(this.x + moveX, this.size / 2, canvasWidth - this.size / 2);
      this.y = constrain(this.y + moveY, this.size / 2, canvasHeight - this.size / 2);
    }
  }

  update(canvasWidth, canvasHeight, enemies, bullets, player) {
    if (this.isDead()) {
      if (!this._hasHandledDeath) {
        this._hasHandledDeath = true;
        this.handleDeath();
      }
      return;
    }

    this.attackCooldown = max(this.attackCooldown - 1, 0);

    if (!this.direction || isNaN(this.direction.x) || isNaN(this.direction.y)) {
      this.direction = p5.Vector.fromAngle(random(TWO_PI));
    }

    this.x += this.direction.x * this.speed;
    this.y += this.direction.y * this.speed;

    this.x = constrain(this.x, this.size / 2, canvasWidth - this.size / 2);
    this.y = constrain(this.y, this.size / 2, canvasHeight - this.size / 2);

    this.collider(enemies, bullets, player);
    this.checkWallCollision(canvasWidth, canvasHeight);
    this.updateBuffs();
  }

  draw() {
    if (this.toggle_health_bar) {
      const barWidth = 40;
      const barHeight = 5;
      const healthPercent = this.health / this.max_health;

      noStroke();
      fill(80);

      rectMode(CORNER);
      rect(this.x - barWidth / 2, this.y - this.size / 2 - 10, barWidth, barHeight);


      fill(lerpColor(color('red'), color('blue'), healthPercent));
      const filledWidth = barWidth * healthPercent;
      const startX = this.x - barWidth / 2;

      rect(startX, this.y - this.size / 2 - 10, filledWidth, barHeight);

      rectMode(CENTER);
    }
  }
}
