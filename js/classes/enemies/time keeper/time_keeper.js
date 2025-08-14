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

    
    freezeTime() {
        timeFrozen = true;

        if (player.base_speed !== 0) {
            player._preFreezeSpeed = player.base_speed;
            player.base_speed = 0;
        }

        for (let enemy of enemies) {
            if (enemy instanceof TimeKeeper) continue;

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
        }, 1000);
    }


    update(canvasWidth, canvasHeight) {
        if (this.dead || this.hasExploded) return;

        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const distance = Math.hypot(dx, dy);

        this.distanceToTarget = distance;

        this.handleState();

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

    handleState() {
        if (this.distanceToTarget <= this.attack_range) {
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
    }
}
