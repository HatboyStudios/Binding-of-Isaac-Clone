class Spores extends Enemy {
    constructor(id, x, y, target, max_health = 40, damage = 10, speed = 0.5, size = 30) {
        super(x, y, max_health, damage, speed, size);

        this.id = id;
        this.target = target;

        this.ENEMY_STATE = "STATIONARY";

        this.spore_active_radius = 50;
        this.spore_attack_radius = 90;
        this.spore_active = false;    
        this.spore_timer = 0;           
        this.spore_cooldown = 240;       
        this.spore_cooldown_timer = 0; 

        this.spore_damage_interval = 45;  
        this.spore_damage_timer = 0;

        this.walk_over = true;
    }

    targetDistance() {
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        return { dx, dy, dist: Math.hypot(dx, dy) };
    }

    createSporesArea() {
        if (this.spore_cooldown_timer <= 0 && !this.spore_active) {
            this.spore_active = true;
            this.spore_timer = 300;  
            this.spore_cooldown_timer = this.spore_cooldown;
            this.spore_damage_timer = 0;
        }
    }

    updateSpores() {
        if (this.spore_active) {
            this.spore_timer--;
            this.spore_damage_timer--;


            if (this.spore_damage_timer <= 0) {
                const { dist } = this.targetDistance();
                if (dist <= this.spore_attack_radius) {
                    this.target.takeDamage(this.damage);
                }
                this.spore_damage_timer = this.spore_damage_interval;
            }

            if (this.spore_timer <= 0) {
                this.spore_active = false;
            }
        } else if (this.spore_cooldown_timer > 0) {
            this.spore_cooldown_timer--;
        }
    }

    handleStates(dist) {
        if (dist <= this.spore_active_radius) {
            this.ENEMY_STATE = "ATTACK";
        } else {
            this.ENEMY_STATE = "STATIONARY";
        }
    }

    update() {
        const { dist } = this.targetDistance();
        this.handleStates(dist);

        if (this.ENEMY_STATE === "ATTACK") {
            this.createSporesArea();
        }

        this.updateSpores();
    }

    draw() {
        super.draw();

        fill(150, 123, 182);
        noStroke();
        rectMode(CENTER);
        rect(this.x, this.y, this.size, this.size);

        if (this.spore_active) {
            push();
            noFill();
            stroke(0, 255, 0, 150);
            strokeWeight(3);
            ellipse(this.x, this.y, this.spore_attack_radius * 2);
            pop();
        }
    }
}
