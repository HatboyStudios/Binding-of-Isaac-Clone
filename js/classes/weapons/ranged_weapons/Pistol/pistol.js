class Pistol extends RangedWeapon {
    constructor(total_ammo) {
        super('Pistol', 10, 50, 12, total_ammo);
        this.fire_flag = true;
    }

    shoot() {
        if(this.fire_flag) {
            this.fire(player_direction);
            this.fire_flag = false;
        }
    }
    
    handleWeaponInput() {
        if(keyIsDown('r') || keyIsDown('R')) {
            this.reload();
        }

        let shot = false;
        
        if(keyIsDown(38)) {
            player_direction = "up";
            shot = true;
        } else if(keyIsDown(39)) {
            player_direction = "right";
             shot = true;
        } else if(keyIsDown(40)) {
            player_direction = "down";
             shot = true;
        } else if(keyIsDown(37)) {
            player_direction = "left";
            shot = true;
        }

        if (shot) {
            this.shoot();
            player_shooting = true;
        } else {
            player_shooting = false;
        }

        if (!keyIsDown(38) && !keyIsDown(39) && !keyIsDown(40) && !keyIsDown(37)) {
            this.fire_flag = true;
            player_shooting = false;
        }
    }
}

class AutoPistol extends RangedWeapon {
    constructor(total_ammo) {
        super('Auto Pistol', 10, 50, 12, total_ammo);
        this.cooldown = 0;
        this.fire_rate = 15;
    }

    shoot() {
        if (this.cooldown <= 0) {
            this.fire(player_direction);
            this.cooldown = this.fire_rate;
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