class Following extends Enemy {
    constructor(x, y, target, max_health = 50, damage = 5, speed = 1, size = 25) {
        super(x, y, max_health, damage, speed, size);
        this.target = target;

        this.vision_range = 50; 
        this.aggro_range = 100; 

        this.attack_range = 25; 

        this.ENEMY_STATE = 'SEARCH';
        this.attackRate = 60
    }

    handleEnemyState(state, dx, dy, distance) {
        switch (state) {
            case 'AGGRO':
                if (distance > 0) {
                    this.x += (dx / distance) * this.speed;
                    this.y += (dy / distance) * this.speed;
                }
                break;
            case 'ATTACK':
                if (this.attackCooldown <= 0) {
                    this.target.takeDamage(this.damage);
                    this.attackCooldown = this.attackRate;
                }
                break;
            case 'SEARCH':
                
                break;
        }
    }

    update() {
        super.update();

        let dx = this.target.x - this.x;
        let dy = this.target.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= this.attack_range) {
            this.ENEMY_STATE = 'ATTACK';
        } else if (distance <= this.aggro_range) {
            this.ENEMY_STATE = 'AGGRO';
        } else {
            this.ENEMY_STATE = 'SEARCH';
        }

        this.handleEnemyState(this.ENEMY_STATE, dx, dy, distance);
    }

    draw() {
        this.update();
        fill(255, 0, 0);
        square(this.x, this.y, this.size);
    }
}