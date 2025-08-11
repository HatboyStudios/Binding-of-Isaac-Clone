class Player {
    constructor(x, y, level, health = 100, base_speed, base_stamina, strength, defense, range, modifiers = []) {
        // Base props
        this.x = x;
        this.y = y;
        this.health = health;
        this.level = level;

        // Speed Logic
        this.base_speed = base_speed;
        this.speed = base_speed;
        this.base_stamina = base_stamina;
        this.stamina = base_stamina;

        // Dynamic props
        this.strength = strength;
        this.defense = defense;
        this.range = range;
        this.modifiers = modifiers;

        this.direction = 'down';
    }

    playerMovement() {
        this.speed = this.base_speed;

        const isMoving = keyIsDown('w') || keyIsDown('W') || keyIsDown('s') || keyIsDown('S') || keyIsDown('a') || keyIsDown('A') || keyIsDown('d') || keyIsDown('D');

        if (this.stamina <= 0) {
            this.stamina += 0.1;
             console.log("reg", this.stamina)
        }

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
        this.health = Math.max(this.health - damage, 0);
    }

    heal(amount) {
        this.health = Math.min(this.health + amount, 100);
    }

    saveData() {
        // placeholder for saving data
    }
    
    loadData(data) {
        // placeholder for loading data
    }

    draw() {
        this.playerMovement();
        fill(255, 255, 255); 
        square(this.x, this.y, 40, 10);
    }
}