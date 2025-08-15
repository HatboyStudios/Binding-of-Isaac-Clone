class Shooter extends Enemy {
  constructor(id, x, y, target, max_health = 60, damage = 10, speed = 0.5, size = 30) {
    super(x, y, max_health, damage, speed, size);
        this.id = id;
        this.target = target;

        this.shoot_cooldown = 60;
        this.shoot_timer = this.shoot_cooldown;

        this.vision_range = 300;
        this.safe_distance = 120;

        this.patrol_center_x = x;
        this.patrol_center_y = y;
        this.patrol_radius = 200;
        this.patrol_target_x = x;
        this.patrol_target_y = y;
        this.patrol_timer = 0;
        this.patrol_interval = 180;

        this.ENEMY_STATE = 'PATROL';
    }


    distanceToTarget() {
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        return { dx, dy, dist: Math.hypot(dx, dy) };
    }

    createBullets() {
        const { dx, dy } = this.distanceToTarget();
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);

        let direction;
        if (absDx > absDy) {
            direction = dx > 0 ? "right" : "left";
        } else {
            direction = dy > 0 ? "down" : "up";
        }

        if (this.weapon.ammo_manager.current_ammo > 0) {
            this.weapon.fire({ x: dx, y: dy });
        } else if (this.weapon.ammo_manager.total_ammo > 0) {
            this.weapon.reload();
        }
    }

    newTarget(canvasWidth, canvasHeight) {
        const margin = this.size;
        for (let attempts = 0; attempts < 15; attempts++) {
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
        }

        this.patrol_target_x = constrain(this.patrol_center_x, margin, canvasWidth - margin);
        this.patrol_target_y = constrain(this.patrol_center_y, margin, canvasHeight - margin);
    }

    patrol(canvasWidth, canvasHeight) {
        this.patrol_timer--;
        const dx = this.patrol_target_x - this.x;
        const dy = this.patrol_target_y - this.y;
        const dist = Math.hypot(dx, dy);

        if (this.patrol_timer <= 0 || dist < 10) {
            this.newTarget(canvasWidth, canvasHeight);
            this.patrol_timer = this.patrol_interval + Math.random() * 60;
        }

        this.move(dx, dy, canvasWidth, canvasHeight, true, 0.8);
    }

    handleAggro(canvasWidth, canvasHeight) {
        const { dx, dy, dist } = this.distanceToTarget();

        if (dist < this.safe_distance) {
            this.move(dx, dy, canvasWidth, canvasHeight, false);
        } else if (dist < this.vision_range) {
            this.move(dx, dy, canvasWidth, canvasHeight, true);
        }

        if (dist <= this.vision_range) {
            this.shoot_timer--;
            if (this.shoot_timer <= 0) {
                this.createBullets();
                this.shoot_timer = this.shoot_cooldown;
            }
        }
    }

    update(canvasWidth, canvasHeight) {
        if (this.isDead()) {
            if (!this._hasHandledDeath) {
                this.handleDeath();
                this._hasHandledDeath = true;
            }
            return;
        }

        const { dist } = this.distanceToTarget();

        this.ENEMY_STATE = dist <= this.vision_range ? 'AGGRESSIVE' : 'PATROL';

        if (this.ENEMY_STATE === 'AGGRESSIVE') {
            this.handleAggro(canvasWidth, canvasHeight);
        } else {
            this.patrol(canvasWidth, canvasHeight);
        }
    }

    draw() {
        super.draw();
        fill(0, 200, 255);
        noStroke();
        rectMode(CENTER);
        rect(this.x, this.y, this.size, this.size);
    }

    handleDeath() {
        console.log(`Shooter ${this.id} died.`);
    }
}


class RapidShooter extends Shooter {
    constructor(id, x, y, target) {
        super(id, x, y, target, 40, 5, 0.7, 25); 
        this.shoot_cooldown = 20;

        const rarity = getRandomKey(WeaponTiers);
        const material = getRandomKey(MaterialTiers);
        const effect = getRandomEffect();

        this.weapon = new AutoPistol(
            this,
            undefined,
            5,
            50,
            12,
            40,
            rarity,
            material,
            effect
        );
    }

    draw() {
        super.draw();
        fill(255, 100, 100); 
        rect(this.x, this.y, this.size, this.size);
    }

    handleDeath() {
        console.log(`RapidShooter ${this.id} died.`);
    }
}

class TankShooter extends Shooter {
    constructor(id, x, y, target) {
        super(id, x, y, target, 100, 25, 0.3, 40);
        this.shoot_cooldown = 90;

        const rarity = getRandomKey(WeaponTiers);
        const material = getRandomKey(MaterialTiers);
        const effect = getRandomEffect();

        this.weapon = new Rifle(
            this,
            undefined,
            25,
            2,
            300,
            30,
            90,
            rarity,
            material,
            effect
        );
    }
    
    draw() {
        super.draw();
        fill(150, 100, 255);
        rect(this.x, this.y, this.size, this.size);
    }

    handleDeath() {
        console.log(`HeavyShooter ${this.id} died.`);
    }
}

class ShotgunShooter extends Shooter {
    constructor(id, x, y, target) {
        super(id, x, y, target, 50, 8, 0.5, 30);
        this.shoot_cooldown = 80;

        const rarity = getRandomKey(WeaponTiers);
        const material = getRandomKey(MaterialTiers);
        const effect = getRandomEffect();

        this.weapon = new Shotgun(
            this,
            undefined,
            8,
            2,
            120,
            8,
            32,
            rarity,
            material,
            effect
        );
    }

    createBullets() {
        const { dx, dy } = this.distanceToTarget();
        if (dx === 0 && dy === 0) return;

        const angle = Math.atan2(dy, dx);
        const spread = Math.PI / 12;

        for (let offset of [-spread, 0, spread]) {
            const direction = {
                x: Math.cos(angle + offset),
                y: Math.sin(angle + offset)
            };
            if (this.weapon.ammo_manager.current_ammo > 0) {
                this.weapon.fire(direction);
            } else if (this.weapon.ammo_manager.total_ammo > 0) {
                this.weapon.reload();
            }
        }
    }

    draw() {
        super.draw();
        fill(255, 200, 0);
        rect(this.x, this.y, this.size, this.size);
    }

    handleDeath() {
        console.log(`ScatterShooter ${this.id} died.`);
    }
}

class SniperShooter extends Shooter {
    constructor(id, x, y, target) {
        super(id, x, y, target, 50, 30, 0.4, 28);
        this.vision_range = 500;
        this.safe_distance = 300;
        this.shoot_cooldown = 120;
        const rarity = getRandomKey(WeaponTiers);
        const material = getRandomKey(MaterialTiers);
        const effect = getRandomEffect();

        this.weapon = new Sniper(
            this,
            undefined,
            30,
            2,
            600,
            5,
            15,
            rarity,
            material,
            effect
        );
    }

    draw() {
        super.draw();
        fill(100, 255, 100);
        rect(this.x, this.y, this.size, this.size);
    }

    handleDeath() {
        console.log(`SniperShooter ${this.id} died.`);
    }
}
