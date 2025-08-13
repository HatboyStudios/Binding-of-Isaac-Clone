class Supporter extends Enemy {
    constructor(id, x, y, target, max_health = 50, damage = 15, speed = 1, size = 25) {
        super(x, y, max_health, damage, speed, size);
        
        this.id = id;
        this.target = target;

        this.buff_range = 120;
        this.buff_cooldown = 0;
        this.buff_cooldown_max = 300;
        
        this.buff_duration = 300; 
        this.buff_amount = {
            speed: 0.5,
            damage: 12,
            health_regen: 2
        };

        this.vision_range = 150;
        this.follow_distance = 100; 
        
        this.patrol_radius = 360;
        this.patrol_center_x = x;
        this.patrol_center_y = y;
        this.patrol_target_x = x;
        this.patrol_target_y = y;
        this.patrol_timer = 0;
        this.patrol_interval = 180;

        this.ENEMY_STATE = 'PATROL';
        this.current_ally = null;
    }

    constrain(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    isValidEnemy(enemy) {
        return enemy &&
            enemy !== this &&
            !(enemy instanceof Supporter) &&
            Number.isFinite(enemy.x) &&
            Number.isFinite(enemy.y) &&
            !enemy.dead &&
            !enemy.hasExploded;
    }


    closestAlly(enemies) {
        if (!Array.isArray(enemies)) return null;

        let bestAlly = null;
        let bestScore = -1;

        for (const enemy of enemies) {
            if (!this.isValidEnemy(enemy)) continue;

            const distance = Math.hypot(enemy.x - this.x, enemy.y - this.y);
            if (distance > this.buff_range) continue;

            let score = 0;
            
            if (!enemy.buffs || !this.hasActiveBuff(enemy)) {
                score += 100;
            }

            if (distance > 30) { 
                score += (this.buff_range - distance) / this.buff_range * 50;
            }
            
            if (enemy.health < enemy.max_health) {
                const healthPercent = enemy.health / enemy.max_health;
                score += (1 - healthPercent) * 30;
            }

            if (score > bestScore) {
                bestScore = score;
                bestAlly = enemy;
            }
        }

        return bestAlly;
    }

    hasActiveBuff(enemy) {
        if (!enemy.buffs) return false;
        return enemy.buffs.some(buff => buff.type === "heighten" && buff.duration > 0);
    }

    addBuff(ally) {
        if (!ally) return false;
        if (!ally.buffs) {
            ally.buffs = [];
        }

        ally.buffs = ally.buffs.filter(buff => buff.type !== "heighten" || buff.supporter_id !== this.id);

        const newBuff = {
            type: "heighten",
            supporter_id: this.id,
            speed_boost: this.buff_amount.speed,
            damage_boost: this.buff_amount.damage,
            health_regen: this.buff_amount.health_regen,
            duration: this.buff_duration,
            max_duration: this.buff_duration
        };

        ally.buffs.push(newBuff);

        if (ally.speed !== undefined) {
            ally.original_speed = ally.original_speed || ally.speed;
            ally.speed = ally.original_speed + this.buff_amount.speed;
        }
        
        if (ally.damage !== undefined) {
            ally.original_damage = ally.original_damage || ally.damage;
            ally.damage = ally.original_damage + this.buff_amount.damage;
        }

        this.buff_cooldown = this.buff_cooldown_max;
        
        return true;
    }

    findNearestAlly(enemies) {
        if (!Array.isArray(enemies)) return null;

        let nearestAlly = null;
        let nearestDistance = this.vision_range;

        for (const enemy of enemies) {
            if (!this.isValidEnemy(enemy)) continue;

            const distance = Math.hypot(enemy.x - this.x, enemy.y - this.y);
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestAlly = enemy;
            }
        }

        return nearestAlly;
    }

    newTarget(canvasWidth, canvasHeight) {
        const margin = this.size;
        let attempts = 0;

        while (attempts < 15) {
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
            attempts++;
        }

        this.patrol_target_x = this.constrain(this.patrol_center_x, margin, canvasWidth - margin);
        this.patrol_target_y = this.constrain(this.patrol_center_y, margin, canvasHeight - margin);
    }

    patrol(canvasWidth, canvasHeight) {
        this.patrol_timer--;

        const dx = this.patrol_target_x - this.x;
        const dy = this.patrol_target_y - this.y;
        const distanceToTarget = Math.hypot(dx, dy);

        if (this.patrol_timer <= 0 || distanceToTarget < 15) {
            this.newTarget(canvasWidth, canvasHeight);
            this.patrol_timer = this.patrol_interval + Math.random() * 60;
        }

        this.moveTowards(this.patrol_target_x, this.patrol_target_y, canvasWidth, canvasHeight, 0.8);
    }

    handleDistance(ally, canvasWidth, canvasHeight) {
        if (!this.isValidEnemy(ally)) {
            this.ENEMY_STATE = 'PATROL';
            this.current_ally = null;
            return;
        }

        const distance = Math.hypot(ally.x - this.x, ally.y - this.y);
        
        if (distance <= this.buff_range && this.buff_cooldown <= 0) {
            if (!this.hasActiveBuff(ally)) {
                this.addBuff(ally);
            }
        }

        if (distance < this.follow_distance - 20) {
            const awayX = this.x + (this.x - ally.x) * 0.1;
            const awayY = this.y + (this.y - ally.y) * 0.1;
            this.moveTowards(awayX, awayY, canvasWidth, canvasHeight, 0.6);
        } else if (distance > this.follow_distance + 30) {
            this.moveTowards(ally.x, ally.y, canvasWidth, canvasHeight, 1.2);
        }
    }

    handleStates(enemies) {
        if (this.buff_cooldown > 0) {
            this.buff_cooldown--;
        }

        const allyToBuff = this.closestAlly(enemies);
        const nearestAlly = this.findNearestAlly(enemies);

        if (allyToBuff && this.buff_cooldown <= 0) {
            this.ENEMY_STATE = 'SUPPORT';
            this.current_ally = allyToBuff;
        } else if (nearestAlly) {
            this.ENEMY_STATE = 'SUPPORT';
            this.current_ally = nearestAlly;
        } else {
            this.ENEMY_STATE = 'PATROL';
            this.current_ally = null;
        }
    }

    update(canvasWidth = 800, canvasHeight = 600, enemies) {
        if (this.dead || this.hasExploded) return;
        this.handleStates(enemies);

        switch (this.ENEMY_STATE) {
            case 'SUPPORT':
                this.handleDistance(this.current_ally, canvasWidth, canvasHeight);
                break;
                
            case 'PATROL':
            default:
                this.patrol(canvasWidth, canvasHeight);
                break;
        }
    }

    draw() {
        super.draw();

        fill(0, 200, 255);
        noStroke();
        rect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);

        if (this.buff_cooldown > 0) {
            const cooldownPercent = this.buff_cooldown / this.buff_cooldown_max;
            fill(255, 255, 0, 180);
            noStroke();
            arc(this.x, this.y, this.size + 8, this.size + 8, 
                -Math.PI / 2, -Math.PI / 2 + (1 - cooldownPercent) * Math.PI * 2);
        }

        if (this.ENEMY_STATE === 'SUPPORT') {
            stroke(0, 200, 255, 60);
            strokeWeight(1);
            noFill();
            circle(this.x, this.y, this.buff_range * 2);
        }

        if (this.current_ally && this.isValidEnemy(this.current_ally)) {
            stroke(0, 255, 255, 100);
            strokeWeight(2);
            line(this.x, this.y, this.current_ally.x, this.current_ally.y);
        }
    }
}