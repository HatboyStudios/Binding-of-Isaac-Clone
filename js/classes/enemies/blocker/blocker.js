class Blocker extends Enemy {
  constructor(id, x, y, target, max_health = 120, damage = 0, speed = 0.7, size = 28) {
    super(x, y, max_health, damage, speed, size);

    this.id = id;
    this.target = target;

    this.attack_range = 60;
    this.vision_area = 150; 
    this.ENEMY_STATE = 'PATROL';

    this.patrol_center_x = x;
    this.patrol_center_y = y;
    this.patrol_radius = 75;
    this.patrol_target_x = x;
    this.patrol_target_y = y;
    this.patrol_timer = 0;
    this.patrol_interval = 120;
  }

    update(canvasWidth, canvasHeight) {
        if (this.isDead()) {
            if (!this._hasHandledDeath) {
                this.handleDeath();
                this._hasHandledDeath = true;
            }
            return;
        }

        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const distance = Math.hypot(dx, dy);

        const seen_player = this.checkVision();

        this.handleState(distance, seen_player);

        switch (this.ENEMY_STATE) {
            case 'BLOCK':
            this.moveTowards(this.target.x, this.target.y, canvasWidth, canvasHeight);
            this.blockPlayer();
            break;

            case 'PATROL':
            this.patrol(canvasWidth, canvasHeight);
            break;
        }
        }

        handleState(distance, seen_player) {
        if (seen_player || distance <= this.attack_range) {
            this.ENEMY_STATE = 'BLOCK';
        } else {
            this.ENEMY_STATE = 'PATROL';
        }
    }

    checkVision() {
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const distance = Math.hypot(dx, dy);
        return distance <= this.vision_area;
    }

    patrol(canvasWidth, canvasHeight) {
        this.patrol_timer--;

        const dx = this.patrol_target_x - this.x;
        const dy = this.patrol_target_y - this.y;
        const distanceToTarget = Math.hypot(dx, dy);

        if (this.patrol_timer <= 0 || distanceToTarget < 15) {
            this.newTarget(canvasWidth, canvasHeight);
            this.patrol_timer = this.patrol_interval + Math.random() * 60;
        }

        this.moveTowards(
            this.patrol_target_x,
            this.patrol_target_y,
            canvasWidth,
            canvasHeight,
            this.speed * 0.75
        );
    }

    newTarget(canvasWidth, canvasHeight) {
        const margin = this.size;
        let attempts = 0;

        while (attempts < 10) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * this.patrol_radius;
            const newX = this.patrol_center_x + Math.cos(angle) * radius;
            const newY = this.patrol_center_y + Math.sin(angle) * radius;

            if (newX >= margin && newX <= canvasWidth - margin &&
                newY >= margin && newY <= canvasHeight - margin) {
            this.patrol_target_x = newX;
            this.patrol_target_y = newY;
            return;
            }
            attempts++;
        }

        this.patrol_target_x = this.x;
        this.patrol_target_y = this.y;
    }

    blockPlayer() {
        const buffer = 2;
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const distance = Math.hypot(dx, dy);

        const minDistance = this.size / 2 + this.target.size / 2 + buffer;

        if (distance < minDistance) {
            const pushX = (dx / distance) * (minDistance - distance);
            const pushY = (dy / distance) * (minDistance - distance);
            this.target.x += pushX;
            this.target.y += pushY;
        }
    }

    draw() {
        super.draw();

        noStroke();
        fill(255, 0, 0); 
        rectMode(CORNER);
        square(this.x - this.size / 2, this.y - this.size / 2, this.size);

        noFill();
        stroke(0, 255, 0);
        strokeWeight(2);
        rectMode(CENTER);
        rect(this.x, this.y, this.size, this.size);

        rectMode(CORNER);
    }

    handleDeath() {
        console.log(`Blocker ${this.id} died.`);
    }
}
