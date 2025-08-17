class Player {
    constructor(x, y, level, base_health = 100, base_speed, base_stamina, base_strength, base_defense, base_range, modifiers = []) {
        // Base props
        this.x = x;
        this.y = y;
        this.size = 30;
        this.level = level;

        this.vel = { x: 0, y: 0 };
        this.isShifting = false;

        this.base_health = base_health;
        this.health = base_health;

        this.base_speed = base_speed;
        this.speed = base_speed;

        this.base_stamina = base_stamina;
        this.stamina = base_stamina;

        this.base_strength = base_strength;
        this.strength = base_strength;

        this.base_defense = base_defense;
        this.defense = base_defense;

        this.base_range = base_range;
        this.range = base_range;

        this.modifiers = modifiers;

        this.toggle_health_bar = false;
        this.health_timer = 0;
        this.health_duration = 90;

        this.ammo_bag = {
            pistol: 9999,
            rifle: 90,
            shotgun: 30,
            sniper: 20
        };

        this.current_weapon = new Shotgun(this, {
            powerTier: "Crude",
            materialTier: "Bone",
            effectType: "None", 
            fireModes: ['dual', 'buck'],      
        });

        current_weapon = this.current_weapon;
    }

    playerMovement() {
        const isMoving = keyIsDown(87) || keyIsDown(83) || keyIsDown(65) || keyIsDown(68);

        if (keyIsDown(16) && this.stamina > 0 && isMoving) {
            this.isShifting = true;
            this.sprint_bonus = 1.2;
            this.speed = this.base_speed + this.sprint_bonus;
            this.stamina -= 0.5;
        } else {
            this.isShifting = false;
            this.speed = this.base_speed;
            this.stamina = Math.min(this.stamina + 0.3, this.base_stamina);
        }

        this.new_max_speed = this.base_speed + this.sprint_bonus;


        if (keyIsDown(87)) {
            this.y -= this.speed;
            player_direction = 'up';
        }

        if (keyIsDown(83)) {
            this.y += this.speed;
            player_direction = 'down';
        }

        if (keyIsDown(65)) {
            this.x -= this.speed;
            player_direction = 'left';
        }

        if (keyIsDown(68)) {
            this.x += this.speed;
            player_direction = 'right';
        }

        let shootDir = null;
        if (keyIsDown(UP_ARROW)) shootDir = 'up';
        else if (keyIsDown(DOWN_ARROW)) shootDir = 'down';
        else if (keyIsDown(LEFT_ARROW)) shootDir = 'left';
        else if (keyIsDown(RIGHT_ARROW)) shootDir = 'right';

        if (shootDir && this.shootTimer <= 0) {
            current_weapon.fire(shootDir, this);
            this.shootTimer = this.shootCooldown;
        }

        this.x = constrain(this.x, this.size / 2, width - this.size / 2);
        this.y = constrain(this.y, this.size / 2, height - this.size / 2);
    }
    
   collides(other, callback) {
        if (!other) return;

        if (Array.isArray(other)) {
            other.forEach(entity => this.collides(entity, callback));
            return;
        }

        const halfSize = this.size / 2;
        const playerLeft = this.x - halfSize;
        const playerRight = this.x + halfSize;
        const playerTop = this.y - halfSize;
        const playerBottom = this.y + halfSize;

        const otherHalf = other.size / 2;
        const otherLeft = other.x - otherHalf;
        const otherRight = other.x + otherHalf;
        const otherTop = other.y - otherHalf;
        const otherBottom = other.y + otherHalf;

        const isColliding = playerRight > otherLeft &&
                            playerLeft < otherRight &&
                            playerBottom > otherTop &&
                            playerTop < otherBottom;

        if (isColliding && typeof callback === 'function') {
            callback(this, other);
        }

        return isColliding;
    }

    takeDamage(damage) {
        this.toggle_health_bar = true;
        this.health_timer = this.health_duration;
        this.health = Math.max(this.health - damage, 0);
    }

    heal(amount) {
        this.toggle_health_bar = true;
        this.health_timer = this.health_duration;
        this.health = Math.min(this.health + amount, 100);
    }

    isDead() {
        if (this.health <= 0) {
            console.log("YOU DIEDDDDDDD")
        }
    }

    addModifier(mod) {
        if (Array.isArray(mod)) {
            mod.forEach(m => this.addModifier(m));
            return;
        }

        mod.startTime = Date.now();
        console.log(mod);
        this.modifiers.push(mod);
        console.log(mod.stat);
        this.applyModifier(mod);
    }

    applyModifier(mod) {
        switch(mod.stat) {
            case 'speed':
                this.speed += mod.amount;
                break;
            case 'strength':
                this.strength += mod.amount;
                break;
            case 'defense':
                this.defense += mod.amount;
                break;
            case 'range':
                this.range += mod.amount;
                break;
        }
    }

    removeModifier(mod) {
        switch(mod.stat) {
            case 'speed':
                this.speed -= mod.amount;
                break;
            case 'strength':
                this.strength -= mod.amount;
                break;
            case 'defense':
                this.defense -= mod.amount;
                break;
            case 'range':
                this.range -= mod.amount;
                break;
        }
    }

    updateModifiers() {
        const now = Date.now();
        this.modifiers = this.modifiers.filter(mod => {
            if (mod.duration && now - mod.startTime >= mod.duration) {
            this.removeModifier(mod);
            return false;
            }
            return true;
        });
    }

    saveData() {
        // placeholder for saving data
    }
    
    loadData(data) {
        // placeholder for loading data
    }

    update() {
        if (timeFrozen) return; 
        this.isDead();
        this.speed = this.base_speed;
        this.strength = this.base_strength;
        this.defense = this.base_defense;
        this.range = this.base_range;        

        this.modifiers.forEach(mod => this.applyModifier(mod));
        this.playerMovement();
        this.updateModifiers();
        this.collides();

        if (this.toggle_health_bar) {
            this.health_timer--;
            if (this.health_timer <= 0) {
                this.toggle_health_bar = false;
            }
        }

        for (let i = bullets.length - 1; i >= 0; i--) {
            const bullet = bullets[i]; 

            if (bullet.owner && !(bullet.owner instanceof Player)) {
                this.collides(bullet, (player, enemyBullet) => {
                    player.takeDamage(enemyBullet.damage);
                    bullets.remove();
                });
            } 
        }
    }

    draw() {
        rectMode(CENTER);
        fill(255, 255, 255);
        square(this.x, this.y, this.size);

        if (this.toggle_health_bar) {
            const barWidth = 40;
            const barHeight = 5;
            const healthPercent = this.health / this.base_health;

            noStroke();
            fill(80);

            rectMode(CORNER);
            rect(this.x - barWidth / 2, this.y - this.size / 2 - 10, barWidth, barHeight);

            fill(lerpColor(color('red'), color('blue'), healthPercent));
            rect(this.x - barWidth / 2, this.y - this.size / 2 - 10, barWidth * healthPercent, barHeight);

            rectMode(CENTER);
        }
    }
}