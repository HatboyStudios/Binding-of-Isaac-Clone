class Pistol extends RangedWeapon {
    constructor(total_ammo) {
        super('Pistol', 10, 50, 12, total_ammo);
        this.fire_flag = true;
    }

    shoot() {
        if(this.fire_flag) {
            this.fire();
            this.fire_flag = false;
        }
    }
    
    handleWeaponInput() {
        if(keyIsDown('r') || keyIsDown('R')) {
            this.reload();
        }
        
        if(keyIsDown(38)) {
            player_direction = "up";
            console.log("up");
            this.shoot();
            player_shooting = true;
        }

        if(keyIsDown(39)) {
            player_direction = "right";
            console.log("right");
            this.shoot();
            player_shooting = true;
        }

        if(keyIsDown(40)) {
            player_direction = "down";
            console.log("down");
            this.shoot();
            player_shooting = true;
        }

        if(keyIsDown(37)) {
            player_direction = "left";
            console.log("left");
            this.shoot();
            player_shooting = true;
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
        this.fireRate = 10;
    }

    shoot() {
        if ((keyIsDown(38) || keyIsDown(39) || keyIsDown(40) || keyIsDown(37)) && this.cooldown <= 0) {
            this.fire();
            player_shooting = true;
            this.cooldown = this.fireRate;
        }else {
            player_shooting = false;
        }
    }

    handleWeaponInput() {
        super.handleWeaponInput();

        this.shoot();
        this.cooldown--;
    }
}