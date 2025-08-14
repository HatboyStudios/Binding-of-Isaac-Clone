class Scarecrow extends Enemy {
    constructor(id, x, y, target, max_health = 60, damage = 10, speed = 0.4, size = 30) {
        super(x, y, max_health, damage, speed, size);
        this.id = id;
        this.target = target;

        this.summon_cooldown = 600;
        this.summon_timer = this.summon_cooldown;

        this.vision_range = 250;
        this.safe_distance = 100;
        
        this.SPAWN_RADIUS = 50;
    }

    distanceToTarget() {
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        return { dx, dy, dist: Math.hypot(dx, dy) };
    }

    summonCrow(enemies, nextId, canvasWidth, canvasHeight) {
        const angle = Math.random() * Math.PI * 2;
        const offsetX = Math.cos(angle) * this.SPAWN_RADIUS;
        const offsetY = Math.sin(angle) * this.SPAWN_RADIUS;

        const spawnX = this.x + offsetX;
        const spawnY = this.y + offsetY;
        
        const crowSize = 15;
        const constrainedX = constrain(spawnX, crowSize / 2, canvasWidth - crowSize / 2);
        const constrainedY = constrain(spawnY, crowSize / 2, canvasHeight - crowSize / 2);

        // const newCrow = new Crow(nextId, constrainedX, constrainedY, this.target);
        enemies.push(newCrow);
    }

    update(canvasWidth = 800, canvasHeight = 600, enemies, nextEnemyId) {
        const { dist } = this.distanceToTarget();
        

        if (dist <= this.vision_range) {
            this.summon_timer--;
            if (this.summon_timer <= 0) {
                this.summonCrow(enemies, nextEnemyId, canvasWidth, canvasHeight);
                this.summon_timer = this.summon_cooldown;
            }
        }
    }

    draw() {
        super.draw();

        fill(139, 69, 19);
        rect(this.x - this.size / 4, this.y - this.size / 2, this.size / 2, this.size);
    }
}