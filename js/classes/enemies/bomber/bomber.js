class Bomber extends Enemy {
    constructor(id, x, y, target, max_health = 50, damage = 20, speed = 0.7, size = 28) {
        super(x, y, max_health, damage, speed, size);
        this.id = id;
        this.target = target;
        this.explode_range = 90;
        this.explode_warning_time = 60;
        this.exploding = false;
        this.explode_timer = 0;
        this.aggro_range = 200;
        this.vision_range = 150;
        
        this.patrol_center_x = x; 
        this.patrol_center_y = y;
        this.patrol_radius = 300;
        this.patrol_target_x = x;
        this.patrol_target_y = y;
        this.patrol_change_timer = 0;
        this.patrol_change_interval = 120; 
        this.patrol_speed_multiplier = 0.75;

        this.hasExploded = false;
    }

    checkVision() {
        let dx = this.target.x - this.x;
        let dy = this.target.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        return distance <= this.vision_range;
    }

    moveTowards(dirX, dirY, canvasWidth = 800, canvasHeight = 600) {
        this.x += dirX * this.speed;
        this.y += dirY * this.speed;
        this.x = constrain(this.x, this.size / 2, canvasWidth - this.size / 2);
        this.y = constrain(this.y, this.size / 2, canvasHeight - this.size / 2);
    }

    patrol(canvasWidth = 800, canvasHeight = 600) {
        this.patrol_change_timer--;
        
        const dx_patrol = this.patrol_target_x - this.x;
        const dy_patrol = this.patrol_target_y - this.y;
        const distance_to_patrol_target = Math.sqrt(dx_patrol * dx_patrol + dy_patrol * dy_patrol);
        
        if (this.patrol_change_timer <= 0 || distance_to_patrol_target < 10) {
            let attempts = 0;
            let validTarget = false;
            
            while (!validTarget && attempts < 10) {
                const angle = Math.random() * Math.PI * 2;
                const radius = Math.random() * this.patrol_radius;
                
                const potential_x = this.patrol_center_x + Math.cos(angle) * radius;
                const potential_y = this.patrol_center_y + Math.sin(angle) * radius;
                
                const margin = this.size;
                if (potential_x >= margin && 
                    potential_x <= canvasWidth - margin && 
                    potential_y >= margin && 
                    potential_y <= canvasHeight - margin) {
                    
                    this.patrol_target_x = potential_x;
                    this.patrol_target_y = potential_y;
                    validTarget = true;
                } else {
                    attempts++;
                }
            }
            
            if (!validTarget) {
                this.patrol_target_x = constrain(this.patrol_center_x, this.size, canvasWidth - this.size);
                this.patrol_target_y = constrain(this.patrol_center_y, this.size, canvasHeight - this.size);
            }
            
            this.patrol_change_timer = this.patrol_change_interval + Math.random() * 60;
        }
        
        if (distance_to_patrol_target > 5) {
            const normalized_x = dx_patrol / distance_to_patrol_target;
            const normalized_y = dy_patrol / distance_to_patrol_target;
            
            this.x += normalized_x * this.speed * this.patrol_speed_multiplier;
            this.y += normalized_y * this.speed * this.patrol_speed_multiplier;
            
            this.x = constrain(this.x, this.size / 2, canvasWidth - this.size / 2);
            this.y = constrain(this.y, this.size / 2, canvasHeight - this.size / 2);
        }
    }

    update(canvasWidth = 800, canvasHeight = 600) {
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const seen_player = this.checkVision();

        if (this.exploding) {
            this.explode_timer--;

            if (distance > 0 && this.explode_timer >= 0) {
                this.moveTowards(dx / distance, dy / distance, canvasWidth, canvasHeight);
            }

            if (this.explode_timer <= 0 && !this.hasExploded) {
                if (distance < this.explode_range) {
                    this.hasExploded = true;

                    this.target.takeDamage(this.damage * 2);
                    setTimeout(() => {
                        this.health = 0;
                    }, 1000);
                    return;
                }

                return;
            }

            if (distance >= this.explode_range + 20) {
                this.exploding = false;
                this.explode_timer = 0;
            }

            return; 
        }

        if (distance < this.explode_range) {
            this.exploding = true;
            this.explode_timer = this.explode_warning_time;

            if (distance > 0) {
                this.moveTowards(dx / distance, dy / distance, canvasWidth, canvasHeight);
            }
        } else if (seen_player || distance < this.aggro_range) {
            if (distance > 0) {
                this.moveTowards(dx / distance, dy / distance, canvasWidth, canvasHeight);
            }
        } else {
            this.patrol(canvasWidth, canvasHeight);
        }
    }


    draw() {
        if (this.exploding) {
            if (this.explode_timer > 0) {
                const time = millis() * 0.005;
                const pulseIntensity = Math.sin(time) * 0.2 + 1; 
                const pulsedSize = this.size * pulseIntensity;
                
                fill(50, 50, 50, 100);
                noStroke();
                square(this.x - pulsedSize / 2 - 2, this.y - pulsedSize / 2 - 2, pulsedSize + 4, 10);
                
                fill(0, 0, 0);
                noStroke();
                square(this.x - pulsedSize / 2, this.y - pulsedSize / 2, pulsedSize, 10);
                
                const redIntensity = Math.sin(time * 2) * 0.3 + 0.3;
                stroke(255 * redIntensity, 0, 0, 150 * redIntensity);
                strokeWeight(1);
                noFill();
                square(this.x - pulsedSize / 2, this.y - pulsedSize / 2, pulsedSize, 10);
            } 
            
            if (this.explode_timer <= 0){
                const intensity = 1 - (this.explode_timer / this.explode_warning_time);
                const expandEffect = this.size * (1.5 + intensity * 1.5);
                
                fill(255, 100, 0);
                stroke(255, 0, 0);
                strokeWeight(3);
                ellipse(this.x, this.y, expandEffect, expandEffect);
                noStroke();
                fill(255, 0, 0, 120);
                ellipse(this.x, this.y, this.explode_range);
            }
        } else {
            fill(0, 0, 0);
            noStroke();
            square(this.x - this.size / 2, this.y - this.size / 2, this.size, 10);
        }
    }
}