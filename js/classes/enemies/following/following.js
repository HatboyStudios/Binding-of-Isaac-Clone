let obstacles = [];

function rectsCollide(r1, r2) {
  return !(
    r2.x > r1.x + r1.width ||
    r2.x + r2.width < r1.x ||
    r2.y > r1.y + r1.height ||
    r2.y + r2.height < r1.y
  );
}

function isColliding(rect) {
  for (let obj of obstacles) {
    if (rectsCollide(rect, obj)) {
      return true;
    }
  }
  return false;
}

class Following extends Enemy {
    constructor(x, y, target, max_health = 50, damage = 5, speed = 0.85, size = 25) {
        super(x, y, max_health, damage, speed, size);
        this.target = target;

        this.vision_range = 100;
        this.aggro_range = 220;
        this.attack_range = 25;

        this.ENEMY_STATE = 'PATROL';
        this.attack_rate = 60;
        this.attack_cooldown = 0;

        this.patrol_timer = 0;
        this.direction = p5.Vector.fromAngle(random(TWO_PI));

        this.last_known_position = null;
        this.search_radius = 50;
        this.max_search_radius = 300;
        this.search_attempts = 0;
        this.max_search_attempts = 20;
        this.search_target = null;

        this.search_timeout = 300;
        this.search_timer = 0;

        this.debug_mode = true;
    }

    moveTowards(dx, dy) {
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance === 0) return;

        let direction = createVector(dx, dy).normalize();
        const angleOffset = random(-PI / 16, PI / 16);
        direction.rotate(angleOffset);

        const tryMove = (dx, dy) => ({
            x: this.x + dx * this.speed,
            y: this.y + dy * this.speed
        });

        const makeRect = (x, y) => ({
            x: x - this.size / 2,
            y: y - this.size / 2,
            width: this.size,
            height: this.size,
        });

        let full = tryMove(direction.x, direction.y);
        if (!isColliding(makeRect(full.x, full.y))) {
            this.x = full.x;
            this.y = full.y;
            return;
        }

        let xOnly = tryMove(direction.x, 0);
        if (!isColliding(makeRect(xOnly.x, xOnly.y))) {
            this.x = xOnly.x;
            return;
        }

        let yOnly = tryMove(0, direction.y);
        if (!isColliding(makeRect(yOnly.x, yOnly.y))) {
            this.y = yOnly.y;
            return;
        }

        direction.rotate(random([-PI / 2, PI / 2, PI, -PI])); 
        let escape = tryMove(direction.x, direction.y);
        if (!isColliding(makeRect(escape.x, escape.y))) {
            this.x = escape.x;
            this.y = escape.y;
        }
    }


    guessingSearchTarget() {
        const stdDev = this.search_radius / 3;
        let attempt = 0;
        while (attempt < 10) {
            const offsetX = randomGaussian(0, stdDev);
            const offsetY = randomGaussian(0, stdDev);

            const candidateX = this.last_known_position.x + offsetX;
            const candidateY = this.last_known_position.y + offsetY;

            if (candidateX < 0 || candidateX > width || candidateY < 0 || candidateY > height) {
            attempt++;
            continue;
            }

            const candidateRect = {
            x: candidateX - this.size / 2,
            y: candidateY - this.size / 2,
            width: this.size,
            height: this.size,
            };

            if (!isColliding(candidateRect, this)) {
            return { x: candidateX, y: candidateY };
            }

            attempt++;
        }

        return { x: this.last_known_position.x, y: this.last_known_position.y };
    }

    guessingSearch() {
        if (!this.last_known_position) {
            this.ENEMY_STATE = 'PATROL';
            this.search_timer = 0;
            this.search_attempts = 0;
            this.search_radius = 50;
            this.search_target = null;
            return;
        }

        if (!this.search_target || this.reachedTarget(this.search_target)) {
            if (this.search_attempts >= this.max_search_attempts) {
            this.search_radius = min(this.search_radius + 50, this.max_search_radius);
            this.search_attempts = 0;
            }

            this.search_target = this.guessingSearchTarget();
            this.search_attempts++;
        }

        const dx = this.search_target.x - this.x;
        const dy = this.search_target.y - this.y;
        this.moveTowards(dx, dy);

        this.search_timer++;
        if (this.search_timer > this.search_timeout) {
            this.ENEMY_STATE = 'PATROL';
            this.last_known_position = null;
            this.search_target = null;
            this.search_timer = 0;
            this.search_attempts = 0;
            this.search_radius = 50;
        }
    }

    reachedTarget(target) {
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < this.speed * 2;
    }

    checkVision() {
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > this.vision_range) return false;

        const stepSize = 5;
        const numSteps = Math.floor(distance / stepSize);
        const directionX = dx / distance;
        const directionY = dy / distance;

        for (let i = 1; i < numSteps; i++) {
            const checkX = this.x + directionX * i * stepSize;
            const checkY = this.y + directionY * i * stepSize;

            const checkRect = {
            x: checkX - this.size / 2,
            y: checkY - this.size / 2,
            width: this.size,
            height: this.size,
            };

            if (isColliding(checkRect, this)) return false;
        }

        return true;
    }

    update() {
        super.update();
        if (this.attack_cooldown > 0) this.attack_cooldown--;

        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const player_found = this.checkVision();

        if (distance <= this.attack_range) {
            this.ENEMY_STATE = 'ATTACK';
            this.last_known_position = { x: this.target.x, y: this.target.y };
            this.search_timer = 0;
        } else if (distance <= this.aggro_range || player_found) {
            this.ENEMY_STATE = 'AGGRO';
            this.last_known_position = { x: this.target.x, y: this.target.y };
            this.search_timer = 0;
        } else if (this.last_known_position) {
            this.ENEMY_STATE = 'SEARCH';
        } else {
            this.ENEMY_STATE = 'PATROL';
        }

        switch (this.ENEMY_STATE) {
            case 'ATTACK':
                this.moveTowards(dx, dy);
                if (this.attack_cooldown <= 0) {
                    if (random() < 0.85) {
                    this.target.takeDamage(this.damage);
                    }
                    this.attack_cooldown = this.attack_rate + int(random(-10, 10));
                }
                break;

            case 'AGGRO':
                this.moveTowards(dx, dy);
                break;

            case 'SEARCH':
                this.guessingSearch();
                break;

            case 'PATROL':
                this.patrol();
                break;
        }
    }

    patrol() {
        if (this.patrol_timer <= 0) {
            console.log("Picking new patrol direction...");
            const maxTries = 16;
            let foundSafeDirection = false;

            for (let i = 0; i < maxTries; i++) {
                const tryDir = p5.Vector.fromAngle(random(TWO_PI));
                const tryX = this.x + tryDir.x * this.speed;
                const tryY = this.y + tryDir.y * this.speed;

                const tryRect = {
                    x: tryX - this.size / 2,
                    y: tryY - this.size / 2,
                    width: this.size,
                    height: this.size
                };

                const isInsideCanvas =
                    tryX >= 0 && tryX <= width &&
                    tryY >= 0 && tryY <= height;


                const willCollide = isColliding(tryRect);

                console.log(
                    `Try ${i + 1}: Dir=(${tryDir.x.toFixed(2)}, ${tryDir.y.toFixed(2)}) | Next=(${tryX.toFixed(1)}, ${tryY.toFixed(1)}) | Inside=${isInsideCanvas} | Collides=${willCollide}`
                );

                if (isInsideCanvas && !willCollide) {
                    console.log(`✅ Direction accepted on try ${i + 1}`);
                    this.direction = tryDir;
                    this.patrol_timer = int(random(120, 240));
                    foundSafeDirection = true;
                    break;
                }
            }

            if (!foundSafeDirection) {
                console.warn("⚠️ No safe direction found. Trying again soon.");
                this.patrol_timer = 5; 
                return;
            }
        }

        const nextX = this.x + this.direction.x * this.speed;
        const nextY = this.y + this.direction.y * this.speed;

        const nextRect = {
            x: nextX - this.size / 2,
            y: nextY - this.size / 2,
            width: this.size,
            height: this.size,
        };

        const collides = isColliding(nextRect) || 
                            nextX - this.size / 2 < 0 ||
                            nextX + this.size / 2 > width ||
                            nextY - this.size / 2 < 0 ||
                            nextY + this.size / 2 > height;

        if (collides) {
            console.warn("💥 Collision detected on move. Will pick new direction next frame.");
            this.patrol_timer = 0;
        } else {
            this.x = nextX;
            this.y = nextY;
            this.patrol_timer--;
            console.log(`🚶 Moved to (${this.x.toFixed(1)}, ${this.y.toFixed(1)}) | Timer: ${this.patrol_timer}`);
        }

        this.x = constrain(this.x, this.size / 2, width - this.size / 2);
        this.y = constrain(this.y, this.size / 2, height - this.size / 2);
    }


  debug() {
    noFill();
    stroke(0, 255, 0, 100);
    circle(this.x, this.y, this.vision_range * 2);
    stroke(255, 255, 0, 100);
    circle(this.x, this.y, this.aggro_range * 2);
    stroke(255, 0, 0, 100);
    circle(this.x, this.y, this.attack_range * 2);

    if (this.last_known_position) {
      stroke(255, 100, 255);
      line(this.x, this.y, this.last_known_position.x, this.last_known_position.y);
      fill(255, 100, 255, 100);
      noStroke();
      circle(this.last_known_position.x, this.last_known_position.y, 10);
    }

    if (this.ENEMY_STATE === 'SEARCH' && this.search_target) {
      stroke(0, 0, 255, 150);
      fill(0, 0, 255, 100);
      circle(this.search_target.x, this.search_target.y, 12);
    }

    fill(255);
    noStroke();
    textSize(10);
    textAlign(CENTER);
    text(this.ENEMY_STATE, this.x, this.y - 20);
  }

  draw() {
    fill(255, 0, 0);
    square(this.x - this.size / 2, this.y - this.size / 2, this.size);

    this.debug();
  }
}
