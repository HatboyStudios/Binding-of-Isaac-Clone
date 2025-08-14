class Rifle extends RangedWeapon {
    constructor(total_ammo = 90) {
        super("Rifle", 15, 300, 30, total_ammo);
        this.cooldown = 0;
        this.fireRate = 10;
    }

    shoot() {
        if (this.cooldown <= 0) {
            this.fire(player_direction);
            this.cooldown = this.fireRate;
        }
    }

    handleWeaponInput() {
        super.handleWeaponInput();

        let shot = false;

        if (keyIsDown(38)) {
            player_direction = "up";
            shot = true;
        } else if (keyIsDown(39)) {
            player_direction = "right";
            shot = true;
        } else if (keyIsDown(40)) {
            player_direction = "down";
            shot = true;
        } else if (keyIsDown(37)) {
            player_direction = "left";
            shot = true;
        }

        if (shot) {
            this.shoot();
            player_shooting = true;
        } else {
            player_shooting = false;
        }

        if (this.cooldown > 0) {
            this.cooldown--;
        }
    }
}