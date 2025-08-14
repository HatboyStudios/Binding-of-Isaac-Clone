class Spawner extends Enemy {
    constructor(id, x, y, target, max_health = 50, damage = 0, speed = 0, size = 25) {
        super(x, y, max_health, damage, speed, size);
        this.id = id;
        this.target = target;

        this.spawnCooldownMax = 5400; 
        this.spawnCooldown = this.spawnCooldownMax;

        this.spawnList = [Werewolf, Scarecrow]; 
        this.maxSpawnsAtOnce = 4; 

        this.spawnEnemy();
    }

    update() {
        if (this.spawnCooldown > 0) {
            this.spawnCooldown--;
        } else {
            this.spawnEnemy();
            this.spawnCooldown = this.spawnCooldownMax;
        }
    }

    spawnEnemy() {
        for (let i = 0; i < this.maxSpawnsAtOnce; i++) {
            let EnemyType = random(this.spawnList);

            let spawnX = this.x + random(-50, 50);
            let spawnY = this.y + random(-50, 50);

            let newEnemy = new EnemyType(i, spawnX, spawnY, player);
            enemies.push(newEnemy);
        }
    }

    draw() {
        fill(150, 0, 150);
        ellipse(this.x, this.y, this.size);

        fill(255, 0, 0);
        rect(this.x - this.size / 2, this.y - this.size, 
             map(this.spawnCooldown, 0, this.spawnCooldownMax, this.size, 0), 5);
    }
}
