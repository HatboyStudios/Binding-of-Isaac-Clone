class TimeKeeper extends Enemy {
    constructor(id, canvasWidth, canvasHeight, target, max_health = 50, damage = 10, speed = 1.2, size = 25) {
        const spawnBuffer = 50;
        let x, y;
        const side = floor(random(4));

        switch (side) {
            case 0:
                x = -spawnBuffer;
                y = random(0, canvasHeight);
                break;
            case 1:
                x = canvasWidth + spawnBuffer;
                y = random(0, canvasHeight);
                break;
            case 2:
                x = random(0, canvasWidth);
                y = -spawnBuffer;
                break;
            case 3:
                x = random(0, canvasWidth);
                y = canvasHeight + spawnBuffer;
                break;
        }

        super(x, y, max_health, damage, speed, size);
        this.id = id;
        this.target = target;

        this.ENEMY_STATE = 'AGGRO';
        this.attack_range = 60;
        this.attack_cooldown = 0;
        this.attack_rate = 200;

        this.time_freeze = false;
        this.cooldown = 0;
        this.ability_rate = 600;
    }

    distanceToTarget() {
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        return { dx, dy, distance: Math.hypot(dx, dy) };
    }


    freezeTime() {
        timeFrozen = true;

        if (player.base_speed !== 0) {
            player._preFreezeSpeed = player.base_speed;
            player.base_speed = 0;
        }

       for (let enemy of enemies) {
            if (enemy instanceof TimeKeeper) continue;

            if (enemy.can_be_froze === false) continue;

            if (enemy.speed !== 0) {
                enemy._preFreezeSpeed = enemy.speed;
                enemy.speed = 0;
            }
        }


        for (let bullet of bullets) {
            if (!bullet._frozen) {
                bullet._preFreezeVel = { x: bullet.vel.x, y: bullet.vel.y };
                bullet.vel.x = 0;
                bullet.vel.y = 0;
                bullet._frozen = true;
            }
        }

        setTimeout(() => {
            timeFrozen = false;

            if (player.base_speed === 0 && typeof player._preFreezeSpeed === 'number') {
                player.base_speed = player._preFreezeSpeed;
                delete player._preFreezeSpeed;
            }

            for (let enemy of enemies) {
                if (enemy instanceof TimeKeeper) continue;

                if (enemy.speed === 0 && typeof enemy._preFreezeSpeed === 'number') {
                    enemy.speed = enemy._preFreezeSpeed;
                    delete enemy._preFreezeSpeed;
                }
            }

            for (let bullet of bullets) {
                if (bullet._frozen && bullet._preFreezeVel) {
                    bullet.vel.x = bullet._preFreezeVel.x;
                    bullet.vel.y = bullet._preFreezeVel.y;
                    delete bullet._preFreezeVel;
                    delete bullet._frozen;
                }
            }
        }, 1500);
    }


    update(canvasWidth, canvasHeight) {
         if (this.isDead()) {
            if (!this._hasHandledDeath) {
                this.handleDeath();
                this._hasHandledDeath = true;
            }
            return;
        }

        const {distance} = this.distanceToTarget();

        this.handleState(distance);

        if (this.cooldown > 0) this.cooldown--;
        if (this.attack_cooldown > 0) this.attack_cooldown--;

        if (this.cooldown <= 0) {
            this.freezeTime();
            this.cooldown = this.ability_rate;
        }

        switch (this.ENEMY_STATE) {
            case 'AGGRO':
                this.moveTowards(this.target.x, this.target.y, canvasWidth, canvasHeight);
                break;
            case 'ATTACK':
                this.moveTowards(this.target.x, this.target.y, canvasWidth, canvasHeight);
                if (this.attack_cooldown <= 0) {
                    this.target.takeDamage(this.damage);
                    this.attack_cooldown = this.attack_rate;
                }
                break;
        }
    }

    handleState(distance) {
        if (distance <= this.attack_range) {
            this.ENEMY_STATE = 'ATTACK';
        } else {
            this.ENEMY_STATE = 'AGGRO';
        }
    }
    
    draw() {
        super.draw();

        fill(100, 50, 200);
        noStroke();
        rect(this.x, this.y, this.size, this.size);
        rectMode(CENTER);
    }

    handleDeath() {
        console.log(`Time Keeper ${this.id} died.`);
    }
}

class RickandTwoCrows extends TimeKeeper {
    constructor(id, canvasWidth, canvasHeight, target) {
        super(id, canvasWidth, canvasHeight, target, 50, 10, 1.2, 25);
        this.summon_cooldown = 300;
        this.summon_timer = this.summon_cooldown;
        this.SPAWN_RADIUS = 50;

        this.crow_limit = 3;
        this.current_crow = 0;

        this.vision_range = 400;
    }

    summonCrow(enemies, nextEnemyIdRef, canvasWidth, canvasHeight) {
        const can_spawn = this.crow_limit - this.current_crow;
        let spawn_amount;

        if (can_spawn >= 3) {
            spawn_amount = 3;
        } else {
            spawn_amount = can_spawn;
        }

        for (let i = 0; i < spawn_amount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const offsetX = Math.cos(angle) * this.SPAWN_RADIUS;
            const offsetY = Math.sin(angle) * this.SPAWN_RADIUS;

            const spawnX = this.x + offsetX;
            const spawnY = this.y + offsetY;

            const crowSize = 15;
            const constrainedX = constrain(spawnX, crowSize / 2, canvasWidth - crowSize / 2);
            const constrainedY = constrain(spawnY, crowSize / 2, canvasHeight - crowSize / 2);

            const newCrow = new Crow(
                nextEnemyIdRef.value,
                constrainedX,
                constrainedY,
                this.target,
                this,
                35, 
                10,    
                1.5,   
                15,    
                false 
            );

            this.current_crow += 1;
            enemies.push(newCrow);

            nextEnemyIdRef.value += 1;   
        }
    }

    onCrowDeath() {
        this.current_crow -= 1;
    }

   update(canvasWidth, canvasHeight, enemies, nextEnemyIdRef) {
        if (this.isDead()) {
            if (!this._hasHandledDeath) {
                this.handleDeath();
                this._hasHandledDeath = true;
            }
            return;
        }

        super.update(canvasWidth, canvasHeight);

        const { distance } = this.distanceToTarget();

        super.handleState(distance);

        if (this.ENEMY_STATE === 'AGGRO') {
            this.move(this.target.x, this.target.y, canvasWidth, canvasHeight, false, 1);
        }

        if (distance <= this.vision_range && this.current_crow < this.crow_limit) {
            this.summon_timer--;
            if (this.summon_timer <= 0) {
                this.summonCrow(enemies, nextEnemyIdRef, canvasWidth, canvasHeight);
                this.summon_timer = this.summon_cooldown;

                console.log("crow");
            }
        }
    }


    handleDeath() {
        console.log(`Crow Time Keeper ${this.id} died.`);
    }
}

