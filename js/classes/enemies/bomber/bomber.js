class Bomber extends Enemy {
  constructor(id, x, y, target, max_health = 50, damage = 20, speed = 0.7, size = 28) {
    super(x, y, max_health, damage, speed, size);
    this.id = id;
    this.target = target;

    this.explode_range = 75;
    this.explode_warning_time = 60;
    this.aggro_range = 200;
    this.vision_range = 160;
    this.patrol_radius = 300;

    this.exploding = false;
    this.explode_timer = 0;
    this.has_exploded = false;

    this.patrol_center_x = x;
    this.patrol_center_y = y;
    this.patrol_target_x = x;
    this.patrol_target_y = y;
    this.patrol_change_timer = 0;
    this.patrol_change_interval = 120;
    this.patrol_speed_multiplier = 0.75;

    this.post_explosion_timer = 0;
    this.no_collision_push = true;
    this._has_handled_death = false;
  }

  distanceToTarget() {
    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    return { dx, dy, dist: Math.hypot(dx, dy) };
  }

  checkVision() {
    return this.distanceToTarget().dist <= this.vision_range;
  }

  moveTowards(dx, dy, speed_mult = 1, canvasWidth = 800, canvasHeight = 600) {
    if (this.has_exploded || this.exploding && this.explode_timer <= 0) return;

    const mag = Math.hypot(dx, dy);
    if (mag > 0) {
      this.x = constrain(this.x + (dx / mag) * this.speed * speed_mult, this.size / 2, canvasWidth - this.size / 2);
      this.y = constrain(this.y + (dy / mag) * this.speed * speed_mult, this.size / 2, canvasHeight - this.size / 2);
    }
  }

  findNewPatrolTarget(canvasWidth, canvasHeight) {
    const margin = this.size;
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * this.patrol_radius;
      const px = this.patrol_center_x + Math.cos(angle) * radius;
      const py = this.patrol_center_y + Math.sin(angle) * radius;

      if (px >= margin && px <= canvasWidth - margin && py >= margin && py <= canvasHeight - margin) {
        this.patrol_target_x = px;
        this.patrol_target_y = py;
        return;
      }
    }
    this.patrol_target_x = constrain(this.patrol_center_x, margin, canvasWidth - margin);
    this.patrol_target_y = constrain(this.patrol_center_y, margin, canvasHeight - margin);
  }

  patrol(canvasWidth = 800, canvasHeight = 600) {
    this.patrol_change_timer--;
    const dx = this.patrol_target_x - this.x;
    const dy = this.patrol_target_y - this.y;
    const dist = Math.hypot(dx, dy);

    if (this.patrol_change_timer <= 0 || dist < 10) {
      this.findNewPatrolTarget(canvasWidth, canvasHeight);
      this.patrol_change_timer = this.patrol_change_interval + Math.random() * 60;
    }

    this.moveTowards(dx, dy, this.patrol_speed_multiplier, canvasWidth, canvasHeight);
  }

  triggerExplosion() {
    if (!this.exploding && !this.has_exploded) {
      this.exploding = true;
      this.explode_timer = this.explode_warning_time;
    }
  }

  cancelExplosion() {
    this.exploding = false;
    this.explode_timer = 0;
  }

  explode(enemies) {
    const multiplier = 2;
    for (let enemy of enemies) {
      if (enemy === this) continue;
      if (typeof enemy.takeDamage === 'function') {
        const distance = Math.hypot(this.x - enemy.x, this.y - enemy.y);
        if (distance <= this.explode_range) {
          enemy.takeDamage(this.damage * multiplier);
        }
      }
    }
  }

  update(canvasWidth, canvasHeight, enemies) {
    if (this.isDead()) {
      if (!this._has_handled_death) {
        this.handleDeath();
        this._has_handled_death = true;
      }
      return;
    }

    if (this.has_exploded) {
      if (this.post_explosion_timer > 0) {
        this.post_explosion_timer--;
      } else {
        this.health = 0;
      }
      return;
    }

    const { dx, dy, dist } = this.distanceToTarget();

    if (this.exploding) {
      this.explode_timer--;
      this.moveTowards(dx, dy, this.patrol_speed_multiplier, canvasWidth, canvasHeight);

      if (this.explode_timer <= 0) {
        if (dist <= this.explode_range && typeof this.target.takeDamage === 'function') {
          this.target.takeDamage(this.damage * 2);
        }

        this.explode(enemies);
        this.has_exploded = true;
        this.exploding = false;
        this.explode_timer = 0;
        this.post_explosion_timer = 90;
        this.health = 0;
        return;
      }

      if (dist >= this.explode_range + 20) {
        this.cancelExplosion();
      }
      return;
    }

    if (dist < this.explode_range) {
      this.triggerExplosion();
    } else if (this.checkVision() || dist < this.aggro_range) {
      this.moveTowards(dx, dy, 1, canvasWidth, canvasHeight);
    } else {
      this.patrol(canvasWidth, canvasHeight);
    }
  }

  draw() {
    if (this.isDead() || this.has_exploded) return;

    super.draw();
    rectMode(CENTER);

    if (this.exploding && this.explode_timer > 0) {
        const time = millis() * 0.005;
        const pulse = Math.sin(time) * 0.2 + 1;
        const pulsed_size = this.size * pulse;

        noStroke();
        fill(50, 50, 50, 100);
        rect(this.x, this.y, pulsed_size + 4, pulsed_size + 4);
        fill(0);
        rect(this.x, this.y, pulsed_size, pulsed_size);

        push();
        noFill();
        stroke(255, 100, 0, 150);
        strokeWeight(2);
        ellipse(this.x, this.y, this.explode_range * 2);
        pop();
    } else {
        fill(0);
        noStroke();
        rect(this.x, this.y, this.size, this.size);
    }

    push();
    noFill();
    stroke(255, 200, 200, 150);
    strokeWeight(1);
    ellipse(this.x, this.y, this.explode_range * 2);
    pop();
  }

  handleDeath() {
    console.log(`Bomber ${this.id} died.`);
  }
  }

class TankBomber extends Bomber {
  constructor(id, x, y, target) {
    super(id, x, y, target);
    this.max_health = 150;
    this.health = this.max_health;
    this.damage = 50;
    this.speed = 0.4;
    this.size = 40;
    this.explode_range = 100;
    this.explode_warning_time = 90;
    this.aggro_range = 250;
    this.vision_range = 180;
    this.patrol_radius = 250;
    this.patrol_speed_multiplier = 0.5;
    this.explode_damage_multiplier = 1.4;

    this.no_collision_push = true;
  }

  explode(enemies) {
    const multiplier = this.explode_damage_multiplier;
    for (let enemy of enemies) {
      if (enemy === this) continue;
      if (typeof enemy.takeDamage === 'function') {
        const distance = Math.hypot(this.x - enemy.x, this.y - enemy.y);
        if (distance <= this.explode_range) {
          enemy.takeDamage(this.damage * multiplier);
        }
      }
    }
  }

  handleDeath() {
    console.log(`Tank Bomber ${this.id} died.`);
  }
}

class DeathWishBomber extends Bomber {
    constructor(id, x, y, target) {
        super(id, x, y, target);
        this.speed = 0.9;
        this.damage = 35;
        this.size = 25;
        this.explode_range = 80;
        this.explode_warning_time = 30;
        this.patrol_speed_multiplier = 1.0;
    }

    update(canvasWidth, canvasHeight, enemies) {
        if (!this.has_exploded) {
            const { dx, dy } = this.distanceToTarget();
            this.moveTowards(dx, dy, 1, canvasWidth, canvasHeight);

            const { dist } = this.distanceToTarget();
            if (dist < this.explode_range) this.triggerExplosion();
        }

        super.update(canvasWidth, canvasHeight, enemies);
    }

    handleDeath() {
        console.log(`Suicide Bomber ${this.id} died.`);
    }
}