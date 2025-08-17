class Scarecrow extends Enemy {
    constructor(id, x, y, target, max_health = 60, damage = 10, speed = 0.4, size = 30, enemies = [], nextEnemyId = 0, canvasWidth = 800, canvasHeight = 600) {
        super(x, y, max_health, damage, speed, size);
        this.id = id;
        this.target = target;

        // Summoning mechanics
        this.summonCooldown = 600;
        this.summonTimer = this.summonCooldown;
        this.crowLimit = 6;
        this.currentCrowCount = 0;
        this.spawnRadius = 50;


        this.visionRange = 250;
        this.safeDistance = 120;

        this.noCollisionPush = true;
        this._hasHandledDeath = false;

        this.no_collision_push = true;

        this.on_start = true;
    }

    distanceToTarget() {
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        return { dx, dy, dist: Math.hypot(dx, dy) };
    }

    summonCrow(enemies, nextId, canvasWidth, canvasHeight) {
        if (this.currentCrowCount >= this.crowLimit) return null;

        let angle = Math.random() * Math.PI * 2;
        let offsetX = Math.cos(angle) * this.spawnRadius;
        let offsetY = Math.sin(angle) * this.spawnRadius;

        let spawnX = this.x + offsetX;
        let spawnY = this.y + offsetY;

        const crowSize = 15;
        spawnX = constrain(spawnX, crowSize / 2, canvasWidth - crowSize / 2);
        spawnY = constrain(spawnY, crowSize / 2, canvasHeight - crowSize / 2);

        const newCrow = new Crow(nextId, spawnX, spawnY, this.target, this);
        enemies.push(newCrow);
        this.currentCrowCount++;

        this.flashSpawnEffect(spawnX, spawnY);

        return newCrow;
    }

    onCrowDeath() {
        this.currentCrowCount = Math.max(0, this.currentCrowCount - 1);
    }

    flashSpawnEffect(x, y) {
        push();
        fill(255, 150, 0, 150);
        noStroke();
        ellipse(x, y, 20, 20);
        pop();
    }

    update(canvasWidth, canvasHeight, enemies, nextEnemyId) {
        if (this.isDead()) {
            if (!this._hasHandledDeath) {
                this.handleDeath();
                this._hasHandledDeath = true;
            }
            return;
        }

        if (this.on_start) {
            this.summonCrow(enemies, nextEnemyId, canvasWidth, canvasHeight);
            this.on_start = false;
        }

        const { dist } = this.distanceToTarget();

        if (dist <= this.visionRange && this.currentCrowCount < this.crowLimit) {
            this.summonTimer--;
            if (this.summonTimer <= 0) {
                this.summonCrow(enemies, nextEnemyId, canvasWidth, canvasHeight);
                this.summonTimer = this.summonCooldown + Math.floor(Math.random() * 60);
            }
        }
    }

    draw() {
        super.draw();

        push();
        rectMode(CENTER);
        fill(139, 69, 19);
        rect(this.x, this.y, this.size, this.size);
    }

    handleDeath() {
        console.log(`Scarecrow ${this.id} died.`);
    }
}
