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

    this.buffs = buffs || [];
  }

  // update(canvasWidth, canvasHeight, enemies, bullets) {
  //   this.isDead();

  //   this.attackCooldown = max(this.attackCooldown - 1, 0);

  //   if (!this.direction || isNaN(this.direction.x) || isNaN(this.direction.y)) {
  //     this.direction = p5.Vector.fromAngle(random(TWO_PI));
  //   }

  //   this.x += this.direction.x * this.speed;
  //   this.y += this.direction.y * this.speed;

  //   this.x = constrain(this.x, this.size / 2, canvasWidth - this.size / 2);
  //   this.y = constrain(this.y, this.size / 2, canvasHeight - this.size / 2);

  //   this.collider(enemies, bullets);
  //   this.checkWallCollision(canvasWidth, canvasHeight);
  //   this.updateBuffs();
  // }

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

  constrain(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }


  update(canvasWidth, canvasHeight, enemies, bullets, player) {
    this.isDead();

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

        if (distance < minDistance && distance > 0) {
            const overlap = minDistance - distance;

            const pushStrength = 1.2;
            const pushX = (dx / distance) * overlap * pushStrength;
            const pushY = (dy / distance) * overlap * pushStrength;

            this.x += pushX;
            this.y += pushY;
        }
    }

   if (bullets && typeof bullets.length === "number") {
    for (let i = bullets.length - 1; i >= 0; i--) {
      const bullet = bullets[i];

      const half_size_A = this.size / 2;
      const half_size_B = bullet.size / 2;

      const overlap_X = Math.abs(this.x - bullet.x) < half_size_A + half_size_B;
      const overlap_Y = Math.abs(this.y - bullet.y) < half_size_A + half_size_B;

      if (overlap_X && overlap_Y) {
        if (typeof this.takeDamage === "function") {
          this.takeDamage(bullet.damage);
        }

        bullet.remove(); // Use this instead of splice()
      }
    }
  }


    return colliding;
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
        const startX = this.x + barWidth / 2 - filledWidth;
        rect(startX, this.y - this.size / 2 - 10, filledWidth, barHeight);

        rectMode(CENTER);
    }
  }
}
