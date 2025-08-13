class AmmoManagement {
    constructor(name, damage, capacity, total_ammo) {
        this.name = name;
        this.damage = damage;
        this.capacity = capacity;
        this.current_ammo = capacity;
        this.total_ammo = total_ammo;

        this.player_shooting = false;
    }

    reload() {
        const max_bullets = this.capacity - this.current_ammo;
        const reload_bullets = Math.min(max_bullets, this.total_ammo);
        this.current_ammo += reload_bullets;
        this.total_ammo -= reload_bullets;
        console.log(`Reloaded. Current magazine: ${this.current_ammo}/${this.capacity}, Total ammo: ${this.total_ammo}`);
    }

    spawningBullets() {
        const player_center_X = player.x;
        const player_center_Y = player.y;


        if (this.name === "Shotgun") {
            const numPellets = 3;
            const spreadAngle = 30; 
            const baseAngle = this.convertToNums(this.player_direction);

            const spawnOffset = 5; 

            for (let i = 0; i < numPellets; i++) {
                const angle = baseAngle + (i - Math.floor(numPellets / 2)) * (spreadAngle / numPellets);
                const rad = angle * Math.PI / 180;

                const spawnX = player_center_X + Math.cos(rad) * spawnOffset;
                const spawnY = player_center_Y + Math.sin(rad) * spawnOffset;

                let bullet = new Sprite(spawnX, spawnY, 10, 10);
                bullet.color = 'yellow';
                bullet.vel = { x: Math.cos(rad) * 5, y: Math.sin(rad) * 5 };
                bullet.size = 10;
                bullet.damage = this.damage; 

                bullets.add(bullet);
            }
        } else {
            let bullet = new Sprite(player_center_X, player_center_Y, 10, 10);
            bullet.color = 'yellow';
            bullet.vel = { x: 0, y: 0 };
            bullet.size = 10;
            bullet.damage = this.damage; 

            switch (this.player_direction) {
                case "up":
                    bullet.vel.y = -5;
                    break;
                case "right":
                    bullet.vel.x = 5;
                    break;
                case "down":
                    bullet.vel.y = 5;
                    break;
                case "left":
                    bullet.vel.x = -5;
                    break;
            }
            bullets.add(bullet);
        }
    }


    convertToNums(direction) {
        switch (direction) {
            case "up": return -90;
            case "right": return 0;
            case "down": return 90;
            case "left": return 180;
            default: return 0;
        }
    }

    fire(player_direction) {
        if (this.current_ammo > 0) {
            this.player_direction = player_direction;
            this.current_ammo--;
            console.log(`${this.current_ammo}/${this.capacity}`);

            this.spawningBullets();
            return true; 
        } else {
            console.log('Click! Magazine is empty.');
            return false;
        }
    }

    isEmpty() {
        return this.current_ammo <= 0;
    }

    update() {
        this.direction = player_direction;
    }
}