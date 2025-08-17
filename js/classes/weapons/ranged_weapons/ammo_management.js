class AmmoManagement {
    constructor(owner, name, damage, speed, capacity, total_ammo, range, effectType = "None", weaponType = "pistol") {
        this.owner = owner;
        this.name = name;
        this.damage = damage;
        this.speed = speed;
        this.capacity = capacity;
        this.current_ammo = capacity;
        this.total_ammo = total_ammo;
        this.range = range;
        this.effectType = effectType;
        this.weaponType = weaponType;
    }

    reload() {
        if (this.owner instanceof Player) {
            if (!this.owner.ammo_bag) this.owner.ammo_bag = {};
            if (!this.owner.ammo_bag[this.weaponType]) this.owner.ammo_bag[this.weaponType] = 0;

            const needed = this.capacity - this.current_ammo;
            const available = this.owner.ammo_bag[this.weaponType];
            const toReload = Math.min(needed, available);

            this.current_ammo += toReload;
            this.owner.ammo_bag[this.weaponType] -= toReload;

            console.log(this.owner.ammo_bag[this.weaponType]);
        } else {
            const max_bullets = this.capacity - this.current_ammo;
            const reload_bullets = Math.min(max_bullets, this.total_ammo);
            this.current_ammo += reload_bullets;
            this.total_ammo -= reload_bullets;
            console.log(`Enemy reloaded: ${this.current_ammo}/${this.capacity}`);
        }
    }

    fire(direction) {
        if (this.current_ammo <= 0) {
            return null;
        }
        this.current_ammo--;
        return this.spawnBullets(direction);
    }

    spawnBullets(dir) {
        const bullet = new Sprite(this.owner.x, this.owner.y, 10, 10);
        bullet.damage = this.damage;
        bullet.size = 20;
        bullet.startX = this.owner.x;
        bullet.startY = this.owner.y;
        bullet.range = this.range;
        bullet.owner = this.owner;

        const mag = Math.hypot(dir.x, dir.y);
        bullet.vel = {
            x: (dir.x / mag) * this.speed,
            y: (dir.y / mag) * this.speed
        };

        bullets.add(bullet);
        return bullet;
    }

    pelletsHandler(count, spreadAmount, dir) {
        const pellets = [];
        for (let i = 0; i < count; i++) {
            const spread = spreadAmount * (Math.random() - 0.5);
            const d = { x: dir.x + spread, y: dir.y + spread };
            const mag = Math.hypot(d.x, d.y);
            pellets.push({ x: d.x / mag, y: d.y / mag });
        }
        this.spawnPellets(pellets);
    }

    spawnPellets(pellets) {
        for (const pellet of pellets) {
            this.spawnBullets(pellet);
        }
    }
}
