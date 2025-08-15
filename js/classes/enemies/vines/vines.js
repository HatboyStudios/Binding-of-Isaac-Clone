class Vine extends Enemy {
    constructor(id, x, y, target, damage = 10, speed = 0, size = 40, max_health = 40) {
        super(x, y, max_health, damage, speed, size);

        this.id = id;
        this.target = target;

        this.attack_radius = 90;
        this.attack_cooldown = 80;
        this.attack_timer = 0;

        this.valid_attack_directions = ['up', 'down', 'left', 'right'];
        this.ENEMY_STATE = "idle";

        this.attack_duration = 60; 
        this.windup_duration = 15; 
        this.attack_anim_timer = 0;

        this.windup_timer = 0;
        this.is_winding_up = false;

        this.current_attack_direction = null;
        this.no_collision_push = true;
    }

    distanceToTarget() {
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const dist = Math.hypot(dx, dy);
        return { dx, dy, dist };
    }

    rectsIntersect(a, b) {
        const intersect = (a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y);
        return intersect;
    }

    update() {
        if (this.isDead()) {
            if (!this._hasHandledDeath) {
                this.handleDeath();
                this._hasHandledDeath = true;
            }
            return;
        }

        const { dx, dy, dist } = this.distanceToTarget();
        this.handleStates();

        if (this.ENEMY_STATE === "PREPARE_ATTACK") {
            if (!this.is_winding_up) {
                this.prepareAttackDirection(dx, dy);
            }

            this.windup_timer--;

            if (this.windup_timer <= 0) {
                this.startAttack(); 
            }

        } else if (this.ENEMY_STATE === "ATTACK") {
            this.attack_anim_timer--;

            const hitFrame = Math.floor(this.attack_duration / 2);
            if (this.attack_anim_timer === hitFrame) {
                this.applyWhipDamage();
            }

            if (this.attack_anim_timer <= 0) {
                this.current_attack_direction = null;
                this.ENEMY_STATE = "idle";
            }
        }

        this.attack_timer = Math.max(0, this.attack_timer - 1);
    }

    getWhipHitbox(direction) {
        const whipLength = this.size * 2.5;
        const whipThickness = this.size;

        let hitbox = { x: this.x, y: this.y, w: 0, h: 0 };

        switch(direction) {
            case 'up':
                hitbox.x = this.x - whipThickness / 2;
                hitbox.y = this.y - whipLength;
                hitbox.w = whipThickness;
                hitbox.h = whipLength;
                break;
            case 'down':
                hitbox.x = this.x - whipThickness / 2;
                hitbox.y = this.y;
                hitbox.w = whipThickness;
                hitbox.h = whipLength;
                break;
            case 'left':
                hitbox.x = this.x - whipLength;
                hitbox.y = this.y - whipThickness / 2;
                hitbox.w = whipLength;
                hitbox.h = whipThickness;
                break;
            case 'right':
                hitbox.x = this.x;
                hitbox.y = this.y - whipThickness / 2;
                hitbox.w = whipLength;
                hitbox.h = whipThickness;
                break;
        }
        return hitbox;
    }

    handleStates() {
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        
        const angle = Math.atan2(dy, dx);
        let direction;
        if (Math.abs(angle) < Math.PI / 4) {
            direction = 'right';
        } else if (Math.abs(angle) > 3 * Math.PI / 4) {
            direction = 'left';
        } else if (angle < 0) {
            direction = 'up';
        } else {
            direction = 'down';
        }

        const whipHitbox = this.getWhipHitbox(direction);
        const playerBox = { x: this.target.x, y: this.target.y, w: this.target.size, h: this.target.size };
        const playerInWhipRange = this.rectsIntersect(whipHitbox, playerBox);

        if (playerInWhipRange) {
            if (this.attack_timer <= 0 && this.ENEMY_STATE === "idle") {
                this.ENEMY_STATE = "PREPARE_ATTACK";
                this.windup_timer = this.windup_duration;
                this.is_winding_up = false;
            }
        } else {
            if (this.ENEMY_STATE !== "idle") {
                this.ENEMY_STATE = "idle";
                this.is_winding_up = false;
                this.current_attack_direction = null;
                this.windup_timer = 0;
            }
        }
    }

    prepareAttackDirection(dx, dy) {
        const angle = Math.atan2(dy, dx);

        if (Math.abs(angle) < Math.PI / 4) {
            this.current_attack_direction = 'right';
        } else if (Math.abs(angle) > 3 * Math.PI / 4) {
            this.current_attack_direction = 'left';
        } else if (angle < 0) {
            this.current_attack_direction = 'up';
        } else {
            this.current_attack_direction = 'down';
        }

        this.is_winding_up = true;
    }

    startAttack() {
        this.ENEMY_STATE = "ATTACK";
        this.attack_anim_timer = this.attack_duration;
        this.attack_timer = this.attack_cooldown;
    }

    applyWhipDamage() {
        if (!this.current_attack_direction) {
            return;
        }

        let hitbox = this.getWhipHitbox(this.current_attack_direction);

        const playerBox = { x: this.target.x, y: this.target.y, w: this.target.size, h: this.target.size };

        if (this.rectsIntersect(hitbox, playerBox)) {
            this.target.takeDamage(this.damage);
        }

        for (const entity of enemies) {
            if (entity === this) continue;
            if (typeof entity.takeDamage === 'function') {
                const dist = Math.hypot(entity.x - hitbox.x, entity.y - hitbox.y);
                if (dist <= this.attack_radius) {
                    console.log(`Enemy ${entity.id} hit by whip for ${this.damage} damage.`);
                    entity.takeDamage(this.damage);
                }
            }
        }
    }


    draw() {
        super.draw();

        fill(50, 200, 50);
        noStroke();
        rect(this.x, this.y, this.size, this.size);
        rectMode(CENTER);

        if (this.current_attack_direction) {
            push();
            stroke(255, 0, 0, 120);
            strokeWeight(1);
            noFill();

            if (this.ENEMY_STATE === "PREPARE_ATTACK") {
                ellipse(this.x, this.y, this.size * 2, this.size * 2);
            } 

            else if (this.ENEMY_STATE === "ATTACK") {
                const hit_start = Math.floor(this.attack_duration / 3);       
                const hit_end = Math.floor(this.attack_duration * 2 / 3);
                
                const currentFrame = this.attack_duration - this.attack_anim_timer;

                if (currentFrame >= hit_start && currentFrame <= hit_end) {
                    const hitbox = this.getWhipHitbox(this.current_attack_direction);
                    rectMode(CORNER);
                    rect(hitbox.x, hitbox.y, hitbox.w, hitbox.h);
                }
            }

            pop();
        }
    }

    handleDeath() {
        console.log(`Vine ${this.id} died.`);
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this._destroy = true;
        }
    }
}

class BombVine extends Vine {
    constructor(id, x, y, target, damage = 10, speed = 0, size = 40, max_health = 40) {
        super(id, x, y, target, damage, speed, size, max_health);

        this.explode_radius = 50;
        this.explosion_damage_multiplier = 1.5;
    }

    update() {
        if (this.isDead()) {
            if (!this._hasHandledDeath) {
                this.handleDeath();
                this._hasHandledDeath = true;
            }
            return;
        }

        const { dist } = this.distanceToTarget();

        this.handleStates(dist);

        if (this.ENEMY_STATE === "ATTACK") {
            this.attack_anim_timer--;

            const currentFrame = this.attack_duration - this.attack_anim_timer;

            if (currentFrame === Math.floor(this.attack_duration / 2)) {
                this.applyExplosiveDamage();
            }

            if (this.attack_anim_timer <= 0) {
                this.current_attack_direction = null;
                this.ENEMY_STATE = "idle";
            }
        }

        this.attack_timer = Math.max(0, this.attack_timer - 1);
    }

   handleStates() {
        super.handleStates();

        if (this.ENEMY_STATE === "PREPARE_ATTACK" && !this.is_winding_up) {
            const { dx, dy } = this.distanceToTarget();
            this.prepareAttackDirection(dx, dy);
        }

        if (this.ENEMY_STATE === "PREPARE_ATTACK") {
            this.windup_timer--;

            if (this.windup_timer <= 0) {
                this.startAttack();
            }
        }
    }


    startAttack() {
        this.ENEMY_STATE = "ATTACK";
        this.attack_anim_timer = this.attack_duration;
        this.attack_timer = this.attack_cooldown;
    }

    applyExplosiveDamage() {
        if (!this.current_attack_direction) return;

        const hitbox = this.getWhipHitbox(this.current_attack_direction);

        const explosionCenter = {
            x: hitbox.x + hitbox.w / 2,
            y: hitbox.y + hitbox.h / 2
        };

        for (const entity of enemies) {
            if (entity === this) continue;
            if (typeof entity.takeDamage === 'function') {
                const dist = Math.hypot(entity.x - explosionCenter.x, entity.y - explosionCenter.y);
                if (dist <= this.explode_radius) {
                    entity.takeDamage(this.damage * this.explosion_damage_multiplier);
                }
            }
        }

        if (this.target && typeof this.target.takeDamage === 'function') {
            const dist = Math.hypot(this.target.x - explosionCenter.x, this.target.y - explosionCenter.y);
            if (dist <= this.explode_radius) {
                this.target.takeDamage(this.damage * this.explosion_damage_multiplier);
            }
        }
    }

    draw() {
        super.draw();

        if (this.current_attack_direction) {
            push();
            noFill();
            stroke(255, 100, 0, 120);

            if (this.ENEMY_STATE === "ATTACK") {
                const hitFrameStart = Math.floor(this.attack_duration / 3);
                const hitFrameEnd = Math.floor(this.attack_duration * 2 / 3);
                const currentFrame = this.attack_duration - this.attack_anim_timer;

                if (currentFrame >= hitFrameStart && currentFrame <= hitFrameEnd) {
                    const hitbox = this.getWhipHitbox(this.current_attack_direction);
                    const explosionCenterX = hitbox.x + hitbox.w / 2;
                    const explosionCenterY = hitbox.y + hitbox.h / 2;

                    ellipse(explosionCenterX, explosionCenterY, this.explode_radius * 2);
                }
            }

            pop();
        }
    }

    handleDeath() {
        console.log(`BombVine ${this.id} died.`);
    }
}

class TeleportVine extends Vine {
    constructor(id, x, y, target, damage = 10, speed = 0.6, size = 40, max_health = 50) {
        super(id, x, y, target, damage, speed, size, max_health);

        this.vision_range = 120;
        this.aggro_range = 220;

        this.teleport_range = 80;
        this.skill_cooldown_rate = 150;
        this.skill_cooldown = 0;
    }

    update(canvasWidth, canvasHeight) {
        if (this.isDead()) {
            if (!this._hasHandledDeath) {
                this.handleDeath();
                this._hasHandledDeath = true;
            }
            return;
        }

        const { dx, dy, dist } = this.distanceToTarget();

        if (this.skill_cooldown > 0) this.skill_cooldown--;
        
        if (dist > this.teleport_range && this.skill_cooldown <= 0) {
            this.performTeleport(dx, dy, canvasWidth, canvasHeight);
        } else {
            super.update();
        }
    }

    performTeleport(dx, dy, canvasWidth, canvasHeight) {
        const dist = Math.hypot(dx, dy);
        if (dist === 0) return;

        const dirX = dx / dist;
        const dirY = dy / dist;

        const safeDistance = this.size * 1.5; 
        const teleportDist = Math.min(this.teleport_range, dist - safeDistance);

        if (teleportDist <= 0) return;
    
        this.x = this.target.x - dirX * safeDistance;
        this.y = this.target.y - dirY * safeDistance;
        this.x = constrain(this.x, this.size / 2, canvasWidth - this.size / 2);
        this.y = constrain(this.y, this.size / 2, canvasHeight - this.size / 2);

        this.skill_cooldown = this.skill_cooldown_rate;
        this.prepareAttackDirection(dx, dy);
        this.ENEMY_STATE = "PREPARE_ATTACK";
        this.windup_timer = this.windup_duration;
        this.is_winding_up = false;
    }


    draw() {
        super.draw();

        if (this.skill_cooldown <= 10) {
            push();
            noFill();
            stroke(200, 0, 255, 150);
            strokeWeight(2);
            ellipse(this.x, this.y, this.size * 2);
            pop();
        }
    }

    handleDeath() {
        console.log(`TeleportVine ${this.id} died.`);
    }
}


