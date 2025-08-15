class AmmoManagement {
    constructor(owner, name, damage, speed, capacity, total_ammo, range, effectType = "None") {
        this.owner = owner;
        this.name = name;
        this.damage = damage;
        this.speed = speed;
        this.capacity = capacity;
        this.current_ammo = capacity;
        this.total_ammo = total_ammo;
        this.range = range;
        this.effectType = effectType;
    }

    reload(reloadSpeed = 1.0) {
        const max_bullets = this.capacity - this.current_ammo;
        const reload_bullets = Math.min(max_bullets, this.total_ammo);
        this.current_ammo += reload_bullets;
        this.total_ammo -= reload_bullets;
        console.log(`Reloaded in ${reloadSpeed}s: ${this.current_ammo}/${this.capacity}`);
    }

   
   fire(direction) {
        if (this.current_ammo <= 0) {
            console.log("Click!");
            return null;
        }

        this.current_ammo--;

        if (typeof direction === "string") {
            return this.spawnPlayerBullet(direction, this.owner);
        } else {
            return this.spawnEnemyBullet(direction, this.owner);
        }
    }

    spawnPlayerBullet(direction) {
        const bullet = new Sprite(this.owner.x, this.owner.y, 10, 10);
        bullet.damage = this.damage;
        bullet.size = 20;
        bullet.startX = this.owner.x;
        bullet.startY = this.owner.y;
        bullet.range = this.range;
        bullet.owner = this.owner;

        switch (direction) {
            case "up": bullet.vel = { x: 0, y: -this.speed }; break;
            case "right": bullet.vel = { x: this.speed, y: 0 }; break;
            case "down": bullet.vel = { x: 0, y: this.speed }; break;
            case "left": bullet.vel = { x: -this.speed, y: 0 }; break;
        }

        bullets.add(bullet);
        return bullet;
    }

   spawnEnemyBullet(velocityVector) {
        const bullet = new Sprite(this.owner.x, this.owner.y, 10, 10);
        bullet.damage = this.damage;
        bullet.size = 20;
        bullet.startX = this.owner.x;
        bullet.startY = this.owner.y;
        bullet.range = this.range;
        bullet.owner = this.owner;

        const mag = Math.hypot(velocityVector.x, velocityVector.y);
        bullet.vel = {
            x: (velocityVector.x / mag) * this.speed,
            y: (velocityVector.y / mag) * this.speed
        };

        bullets.add(bullet);
        return bullet;
    }
}
