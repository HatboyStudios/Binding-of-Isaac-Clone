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
    this.hasExploded = false;      
    this.dead = false;             

    this.patrol_center_x = x;
    this.patrol_center_y = y;
    this.patrol_target_x = x;
    this.patrol_target_y = y;
    this.patrol_change_timer = 0;
    this.patrol_change_interval = 120;
    this.patrol_speed_multiplier = 0.75;

    this.postExplosionTimer = 0;
  }

  distanceToTarget() {
    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    return { dx, dy, dist: Math.hypot(dx, dy) };
  }

  checkVision() {
    return this.distanceToTarget().dist <= this.vision_range;
  }

  moveTowards(dx, dy, speedMult = 1, canvasWidth = 800, canvasHeight = 600) {
    if (this.hasExploded || this.dead || (this.exploding && this.explode_timer <= 0)) return;

    const mag = Math.hypot(dx, dy);
    if (mag > 0) {
      this.x = constrain(this.x + (dx / mag) * this.speed * speedMult, this.size / 2, canvasWidth - this.size / 2);
      this.y = constrain(this.y + (dy / mag) * this.speed * speedMult, this.size / 2, canvasHeight - this.size / 2);
    }
  }

  findNewTarget(canvasWidth, canvasHeight) {
    let attempts = 0;
    const margin = this.size;
    while (attempts < 10) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * this.patrol_radius;
      const px = this.patrol_center_x + Math.cos(angle) * radius;
      const py = this.patrol_center_y + Math.sin(angle) * radius;
      if (px >= margin && px <= canvasWidth - margin && py >= margin && py <= canvasHeight - margin) {
        this.patrol_target_x = px;
        this.patrol_target_y = py;
        return;
      }
      attempts++;
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
      this.findNewTarget(canvasWidth, canvasHeight);
      this.patrol_change_timer = this.patrol_change_interval + Math.random() * 60;
    }
    this.moveTowards(dx, dy, this.patrol_speed_multiplier, canvasWidth, canvasHeight);
  }

  triggerExplosion() {
    if (!this.exploding && !this.hasExploded) {
      this.exploding = true;
      this.explode_timer = this.explode_warning_time;
    }
  }

  cancelExplosion() {
    this.exploding = false;
    this.explode_timer = 0;
  }

  update(canvasWidth = 800, canvasHeight = 600, enemies = null) {
    if (this.hasExploded) {
        if (this.postExplosionTimer > 0) {
            this.postExplosionTimer--;
        } else {
            this.dead = true;
        }
        return;
    }

    const { dx, dy, dist } = this.distanceToTarget();

    if (this.exploding) {
        this.explode_timer--;

        this.moveTowards(dx, dy, this.patrol_speed_multiplier, canvasWidth, canvasHeight);
        if (this.explode_timer <= 0) {
            if (dist <= this.explode_range) {
            if (this.target && typeof this.target.takeDamage === 'function') {
                this.target.takeDamage(this.damage * 2);
            }
            }
            this.hasExploded = true;
            this.exploding = false;
            this.explode_timer = 0;
            this.postExplosionTimer = 90; 
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
    if (this.hasExploded) {
      const t = this.postExplosionTimer;
      if (t > 0) {
        const s = this.size * (2 + (60 - t) * 0.1);
        noStroke();
        fill(255, 120, 0, 180);
        ellipse(this.x, this.y, s);
        fill(255, 60, 0, 120);
        ellipse(this.x, this.y, this.explode_range);
      }
      return;
    }

    if (this.exploding && this.explode_timer > 0) {
      const time = millis() * 0.005;
      const pulseIntensity = Math.sin(time) * 0.2 + 1;
      const pulsedSize = this.size * pulseIntensity;

      fill(50, 50, 50, 100);
      noStroke();
      square(this.x - pulsedSize / 2 - 2, this.y - pulsedSize / 2 - 2, pulsedSize + 4, 10);

      fill(0);
      square(this.x - pulsedSize / 2, this.y - pulsedSize / 2, pulsedSize, 10);

      const redIntensity = Math.sin(time * 2) * 0.3 + 0.3;
      stroke(255 * redIntensity, 0, 0, 150 * redIntensity);
      noFill();
      square(this.x - pulsedSize / 2, this.y - pulsedSize / 2, pulsedSize, 10);

      push();
      noFill();
      stroke(255, 100, 0, 150);
      strokeWeight(2);
      ellipse(this.x, this.y, this.explode_range * 2);
      pop();
    } else {
      fill(0);
      noStroke();
      square(this.x - this.size / 2, this.y - this.size / 2, this.size, 10);
    }

    push();
    noFill();
    stroke(255, 200, 200, 150);
    strokeWeight(1);
    ellipse(this.x, this.y, this.explode_range * 2);
    pop();
  }
}
