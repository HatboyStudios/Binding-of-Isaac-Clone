class Player {
    constructor(x, y, level, base_health = 100, base_speed, base_stamina, base_strength, base_defense, base_range, modifiers = []) {
        // Base props
        this.x = x;
        this.y = y;
        this.size = 50;
        this.level = level;

        // Dynamic props
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

        this.direction = 'down';

        this.toggle_health_bar = false;
        this.health_timer = 0;
        this.health_duration = 90;
    }

    playerMovement() {
        const isMoving = keyIsDown('w') || keyIsDown('W') || keyIsDown('s') || keyIsDown('S') || keyIsDown('a') || keyIsDown('A') || keyIsDown('d') || keyIsDown('D');

        if (keyIsDown('Shift') && this.stamina > 0 && isMoving) {
            this.speed += 1.2; 
            this.stamina -= 0.5;
        } else {
            this.stamina = Math.min(this.stamina + 0.3, this.base_stamina);
        }
 
        if (keyIsDown('w') || keyIsDown('W')) {
            this.y -= this.speed;
            this.direction = 'up';
        }

        if (keyIsDown('s') || keyIsDown('S')) {
            this.y += this.speed;
            this.direction = 'down';
        }

        if (keyIsDown('a') || keyIsDown('A')) {
            this.x -= this.speed;
            this.direction = 'left';
        }

        if (keyIsDown('d') || keyIsDown('D')) {
            this.x += this.speed;
            this.direction = 'right';
        }
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

    addModifier(mod) {
        if (Array.isArray(mod)) {
            mod.forEach(m => this.addModifier(m));
            return;
        }

        mod.startTime = Date.now();

        console.log(mod)
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
        this.speed = this.base_speed;
        this.strength = this.base_strength;
        this.defense = this.base_defense;
        this.range = this.base_range;

        this.modifiers.forEach(mod => this.applyModifier(mod));

        this.playerMovement();
        this.updateModifiers();

        if (this.toggle_health_bar) {
            this.health_timer--;
            if (this.health_timer <= 0) {
                this.toggle_health_bar = false;
            }
        }
    }


    draw() {
        fill(255, 255, 255); 
        square(this.x, this.y, 40, 10);


        if (this.toggle_health_bar) {
            const barWidth = 40;
            const barHeight = 5;
            const healthPercent = this.health / this.base_health;

            fill(80);
            rect(this.x, this.y - 10, barWidth, barHeight);

            fill(lerpColor(color('red'), color('green'), healthPercent));
            rect(this.x, this.y - 10, barWidth * healthPercent, barHeight);
            noStroke();
        }
    }
}