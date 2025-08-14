class Zombie extends Enemy {
    constructor(id, x, y, target, max_health = 50, damage = 5, speed =1 , size = 25) {
        super(x, y, max_health, damage, speed, size);
        this.id = id;
        this.target = target;

        this.speed = speed;
;
        this.vision_range = 100;
        this.aggro_range = 220;
        this.attack_range = this.size + 20;

        this.ENEMY_STATE = 'PATROL';
        this.attack_rate = 60;
        this.attack_cooldown = 0;

        this.patrol_timer = 0;
        this.direction = p5.Vector.fromAngle(random(TWO_PI));

        this.last_known_position = null;
        this.investigate_position = null;

        this.memory = {
            visited_areas: new Map(), 
            wall_encounters: [],
            preferred_directions: [],
            stuck_positions: [],
        };
        
        this.exploration_target = null; 
        this.stuck_counter = 0; 
        this.last_positions = [];
        this.curiosity_factor = 0.7;
    }

    recordVisitedArea(x, y) {
        const gridSize = 50;
        const gridX = Math.floor(x / gridSize);
        const gridY = Math.floor(y / gridSize);
        const key = `${gridX},${gridY}`;
        
        if (!this.memory.visited_areas.has(key)) {
            this.memory.visited_areas.set(key, 1);
        } else {
            this.memory.visited_areas.set(key, this.memory.visited_areas.get(key) + 1);
        }
    }

    findAreaMap(x, y) {
        const gridSize = 50;
        const gridX = Math.floor(x / gridSize);
        const gridY = Math.floor(y / gridSize);
        const key = `${gridX},${gridY}`;
        return this.memory.visited_areas.get(key) || 0;
    }

    newMapTarget(canvasWidth, canvasHeight) {
        const gridSize = 50;
        const maxGridX = Math.floor(canvasWidth / gridSize);
        const maxGridY = Math.floor(canvasHeight / gridSize);
        
        let bestTarget = null;
        let lowestVisits = Infinity;
        
        for (let gx = 0; gx < maxGridX; gx++) {
            for (let gy = 0; gy < maxGridY; gy++) {
                const key = `${gx},${gy}`;
                const visits = this.memory.visited_areas.get(key) || 0;
                
                const distance = dist(this.x, this.y, gx * gridSize + gridSize/2, gy * gridSize + gridSize/2);
                const score = visits + (distance / 1000);
                
                if (score < lowestVisits) {
                    lowestVisits = score;
                    bestTarget = {
                        x: gx * gridSize + gridSize/2 + random(-gridSize/4, gridSize/4),
                        y: gy * gridSize + gridSize/2 + random(-gridSize/4, gridSize/4)
                    };
                }
            }
        }
        
        return bestTarget;
    }

    isStuck() {
        this.last_positions.push({ x: this.x, y: this.y });
        
        if (this.last_positions.length > 30) {
            this.last_positions.shift();
        }
        
        if (this.last_positions.length < 20) return false;
        
        let minX = this.last_positions[0].x;
        let maxX = this.last_positions[0].x;
        let minY = this.last_positions[0].y;
        let maxY = this.last_positions[0].y;
        
        for (let pos of this.last_positions) {
            minX = Math.min(minX, pos.x);
            maxX = Math.max(maxX, pos.x);
            minY = Math.min(minY, pos.y);
            maxY = Math.max(maxY, pos.y);
        }
        
        const areaWidth = maxX - minX;
        const areaHeight = maxY - minY;
        
        return (areaWidth < 80 && areaHeight < 80);
    }

    tryMove(dir, canvasWidth, canvasHeight) {
        const nextX = this.x + dir.x * this.speed;
        const nextY = this.y + dir.y * this.speed;
        if (nextX < this.size / 2 || nextX > canvasWidth - this.size / 2 ||
            nextY < this.size / 2 || nextY > canvasHeight - this.size / 2) {
            
            this.memory.wall_encounters.push({
                x: this.x, 
                y: this.y, 
                direction: this.direction.copy(),
                timestamp: frameCount
            });
            
            let newDirection = this.findValidDirection(canvasWidth, canvasHeight);
            this.direction = newDirection;
            this.exploration_target = null;
            
            return false;
        }

        this.x = nextX;
        this.y = nextY;
        this.recordVisitedArea(this.x, this.y);
        return true;
    }

    findValidDirection(canvasWidth, canvasHeight) {
        const directions = [];
        const numDirections = 8; 
        
        for (let i = 0; i < numDirections; i++) {
            const angle = (i / numDirections) * TWO_PI;
            const testDir = p5.Vector.fromAngle(angle);
            
            let testDistance = 0;
            const maxTest = 100;
            
            for (let d = 10; d <= maxTest; d += 10) {
                const testX = this.x + testDir.x * d;
                const testY = this.y + testDir.y * d;
                
                if (testX < this.size/2 || testX > canvasWidth - this.size/2 ||
                    testY < this.size/2 || testY > canvasHeight - this.size/2) {
                    break;
                }
                testDistance = d;
            }
            
            const testX = this.x + testDir.x * 50;
            const testY = this.y + testDir.y * 50;
            const explorationLevel = this.findAreaMap(testX, testY);
            
            directions.push({
                direction: testDir,
                clearDistance: testDistance,
                exploration: explorationLevel,
                score: testDistance * 2 - explorationLevel * 10
            });
        }
        
        // Finds the best direction
        directions.sort((a, b) => b.score - a.score);
        const topChoices = directions.slice(0, 3);
        const chosen = topChoices[Math.floor(random(topChoices.length))];
        
        return chosen.direction;
    }

    moveTowards(dx, dy, canvasWidth, canvasHeight) {
        let distance = sqrt(dx * dx + dy * dy);
        if (distance === 0) return; 

        let dirX = dx / distance;
        let dirY = dy / distance;

        this.x += dirX * this.speed;
        this.y += dirY * this.speed;

        this.x = constrain(this.x, this.size / 2, canvasWidth - this.size / 2);
        this.y = constrain(this.y, this.size / 2, canvasHeight - this.size / 2);
    }

    patrol(canvasWidth, canvasHeight) {
        if (this.isStuck()) {
            this.stuck_counter++;
            if (this.stuck_counter > 10) {
                this.exploration_target = this.newMapTarget(canvasWidth, canvasHeight);
                this.stuck_counter = 0;
                this.last_positions = []; 
            }
        } else {
            this.stuck_counter = Math.max(0, this.stuck_counter - 1);
        }

        if (this.patrol_timer <= 0 || this.exploration_target === null) {
            // Target Finding based on curiosity and current situation
            if (random() < this.curiosity_factor || this.exploration_target === null) {
                this.exploration_target = this.newMapTarget(canvasWidth, canvasHeight);
            }
            
            if (this.exploration_target) {
                // Head towards unexplored area
                const dx = this.exploration_target.x - this.x;
                const dy = this.exploration_target.y - this.y;
                const distance = sqrt(dx * dx + dy * dy);
                
                if (distance > 30) {
                    // Go to target
                    this.direction = createVector(dx / distance, dy / distance);
                } else {
                    // Find a new target
                    this.exploration_target = null;
                }
            } else {
                this.direction = p5.Vector.fromAngle(random(TWO_PI));
            }
            
            this.direction.normalize();
            this.patrol_timer = int(random(30, 120));
            
        } else {
            if (random() < 0.02) { 
                if (this.exploration_target) {
                    const dx = this.exploration_target.x - this.x;
                    const dy = this.exploration_target.y - this.y;
                    const distance = sqrt(dx * dx + dy * dy);
                    if (distance > 10) {
                        const targetDir = createVector(dx / distance, dy / distance);
                        this.direction = p5.Vector.lerp(this.direction, targetDir, 0.3);
                        this.direction.normalize();
                    }
                } else {
                    this.direction.rotate(radians(random(-15, 15)));
                    this.direction.normalize();
                }
            }
            this.patrol_timer--;
        }

        this.tryMove(this.direction, canvasWidth, canvasHeight);
        
        if (this.exploration_target && 
            dist(this.x, this.y, this.exploration_target.x, this.exploration_target.y) < 25) {
            this.exploration_target = null;
            this.patrol_timer = 0; 
        }
    }

    checkVision() {
        let dx = this.target.x - this.x;
        let dy = this.target.y - this.y;
        let distance = sqrt(dx * dx + dy * dy);
        return distance <= this.vision_range;
    }

    update(canvasWidth, canvasHeight, enemies) {
        if (this.attack_cooldown > 0) this.attack_cooldown--;

        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;

        const distance = sqrt(dx * dx + dy * dy);
        const seesPlayer = this.checkVision();

        if (seesPlayer) {
            this.last_known_position = { x: this.target.x, y: this.target.y };
            this.investigate_position = null;
        }

        this.handleState(distance, seesPlayer);

        switch (this.ENEMY_STATE) {
            case 'ATTACK':
                this.moveTowards(dx, dy, canvasWidth, canvasHeight);
                if (this.attack_cooldown <= 0) {
                    this.target.takeDamage(this.damage);
                    this.attack_cooldown = this.attack_rate;
                }
                break;

            case 'AGGRO':
                this.moveTowards(dx, dy, canvasWidth, canvasHeight);
                break;

            case 'SEARCH':
                this.moveTowards(this.last_known_position.x - this.x, this.last_known_position.y - this.y, canvasWidth, canvasHeight);
                if (dist(this.x, this.y, this.last_known_position.x, this.last_known_position.y) < this.speed * 2) {
                    this.last_known_position = null;
                }
                break;

            case 'INVESTIGATE':
                this.moveTowards(this.investigate_position.x - this.x, this.investigate_position.y - this.y, canvasWidth, canvasHeight);
                if (dist(this.x, this.y, this.investigate_position.x, this.investigate_position.y) < this.speed * 2) {
                    this.investigate_position = null;
                }
                break;

            case 'PATROL':
                this.patrol(canvasWidth, canvasHeight);
                break;
        }
    }

    handleState(distance, seesPlayer) {
        if (distance <= this.attack_range) {
            this.ENEMY_STATE = 'ATTACK';
            this.last_known_position = { x: this.target.x, y: this.target.y };
        } else if (seesPlayer || distance <= this.aggro_range) {
            this.ENEMY_STATE = 'AGGRO';
            this.last_known_position = { x: this.target.x, y: this.target.y };
        } else if (this.last_known_position) {
            this.ENEMY_STATE = 'SEARCH';
        } else if (this.investigate_position) {
            this.ENEMY_STATE = 'INVESTIGATE';
        } else {
            this.ENEMY_STATE = 'PATROL';
        }
    }

   draw() {
        super.draw();
        fill(0, 255, 0);
        noStroke();
        rectMode(CENTER);
        rect(this.x, this.y, this.size, this.size);
    }
}

class TankZombie extends Zombie {
  constructor(id, x, y, target) {
    super(id, x, y, target, 150, 12, 0.6, 35);
  }
}

class CrawlerZombie extends Zombie {
  constructor(id, x, y, target) {
    super(id, x, y, target, 60, 4, 1.2, 20);
  }
}

class FastZombie extends Zombie {
  constructor(id, x, y, target) {
    super(id, x, y, target, 80, 6, 1.5, 22); 

    console.log(this.speed)
  }
}
