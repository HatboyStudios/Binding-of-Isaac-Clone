class Teleporting extends Enemy {
    constructor(id, x, y, target, max_health = 50, damage = 5, speed = 1, size = 25) {
        super(x, y, max_health, damage, speed, size);
        this.target = target
        this.id = id;

        this.attack_rate = 45;
        this.attack_cooldown = 0;

        this.vision_range = 100;
        this.aggro_range = 220;
        this.attack_range = 45;

        this.teleport_range = 50;
        this.skill_cooldown_rate = 150;
        this.skill_cooldown = 0;

        this.ENEMY_STATE = 'STATIONARY';
    }

    stationary() {
        let dx = this.target.x - this.x;
        let dy = this.target.y - this.y;
        let distance = sqrt(dx * dx + dy * dy);

        if (distance <= this.line_of_sight) {
            this.ENEMY_STATE = 'AGGRO';
        }
    }

    
    moveTowards(dx, dy, canvas_width, canvas_height) {
        let distance = sqrt(dx * dx + dy * dy);
        if (distance === 0) return; 

        let dirX = dx / distance;
        let dirY = dy / distance;

        if (
            this.ENEMY_STATE === "AGGRO" &&
            distance > this.teleport_range &&
            this.skill_cooldown <= 0
        ) {
            let teleportDist = Math.max(this.teleport_range, this.size * 2);
            this.x = this.target.x - dirX * teleportDist;
            this.y = this.target.y - dirY * teleportDist;

            this.x = constrain(this.x, this.size / 2, canvas_width - this.size / 2);
            this.y = constrain(this.y, this.size / 2, canvas_height - this.size / 2);

            this.skill_cooldown = this.skill_cooldown_rate;
        } else {
            this.x += dirX * this.speed;
            this.y += dirY * this.speed;

            this.x = constrain(this.x, this.size / 2, canvas_width - this.size / 2);
            this.y = constrain(this.y, this.size / 2, canvas_height - this.size / 2);
        }

        if (this.skill_cooldown > 0) {
            this.skill_cooldown--;
        }
    }

    checkVision() {
        let dx = this.target.x - this.x;
        let dy = this.target.y - this.y;
        let distance = sqrt(dx * dx + dy * dy);
        return distance <= this.vision_range;
    }

    update(canvas_width, canvas_height) {
        if (this.attack_cooldown > 0) this.attack_cooldown--;

        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const distance = sqrt(dx * dx + dy * dy);
        const seesPlayer = this.checkVision();

        if (seesPlayer) {
            this.last_known_position = { x: this.target.x, y: this.target.y };
            this.investigate_position = null;
        }

        if (distance <= this.attack_range) {
            this.ENEMY_STATE = 'ATTACK';
            this.last_known_position = { x: this.target.x, y: this.target.y };
        } else if (seesPlayer || distance <= this.aggro_range) {
            this.ENEMY_STATE = 'AGGRO';
            this.last_known_position = { x: this.target.x, y: this.target.y };
        } else if (this.last_known_position) {
            this.ENEMY_STATE = 'SEARCH';
        } else if (this.investigate_position) {
            this.ENEMY_STATE = 'INVESTIGATE';
        } else {
            this.ENEMY_STATE = 'STATIONARY';
        }

        switch (this.ENEMY_STATE) {
            case 'ATTACK':
                this.moveTowards(dx, dy, canvas_width, canvas_height);
                if (this.attack_cooldown <= 0) {
                    this.target.takeDamage(this.damage);
                    this.attack_cooldown = this.attack_rate;
                }
                break;

            case 'AGGRO':
                this.moveTowards(dx, dy, canvas_width, canvas_height);
                break;

            case 'SEARCH':
                this.moveTowards(this.last_known_position.x - this.x, this.last_known_position.y - this.y, canvas_width, canvas_height);
                if (dist(this.x, this.y, this.last_known_position.x, this.last_known_position.y) < this.speed * 2) {
                    this.last_known_position = null;
                }
                break;

            case 'INVESTIGATE':
                this.moveTowards(this.investigate_position.x - this.x, this.investigate_position.y - this.y, canvas_width, canvas_height);
                if (dist(this.x, this.y, this.investigate_position.x, this.investigate_position.y) < this.speed * 2) {
                    this.investigate_position = null;
                }
                break;

            case 'STATIONARY':
                this.stationary();
                break;
        }
    }

    draw() {
        super.draw();
        fill(255, 0, 128);
        noStroke();
        square(this.x - this.size / 2, this.y - this.size / 2, this.size);
    }
}

class FastTeleporter extends Teleporting {
  constructor(id, x, y, target) {
    super(id, x, y, target, 35, 8, 1.6, 20);
    this.teleport_range = 80;
    this.skill_cooldown_rate = 90;
    this.attack_rate = 30;
    this.attack_range = 40;
    this.vision_range = 120;
    this.aggro_range = 250;
  }
  
  draw() {
    super.draw();
    fill(0, 255, 255); 
    noStroke();
     rect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
  }
}

class TankTeleporter extends Teleporting {
  constructor(id, x, y, target) {
    super(id, x, y, target, 90, 15, 0.7, 30);
    this.teleport_range = 40;
    this.skill_cooldown_rate = 300;
    this.attack_rate = 60;
    this.attack_range = 50;
    this.vision_range = 90;
    this.aggro_range = 180;
  }

  draw() {
    super.draw();
    fill(50, 50, 50);
    noStroke();
    rect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
  }
}
