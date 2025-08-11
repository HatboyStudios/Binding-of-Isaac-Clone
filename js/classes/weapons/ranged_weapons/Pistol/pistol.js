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
        
        if(mouseIsPressed) {
            this.shoot();
        }

        if (!mouseIsPressed) {
            this.fire_flag = true;
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
        if (mouseIsPressed && this.cooldown <= 0) {
            this.fire();
            this.cooldown = this.fireRate;
        }
    }

    handleWeaponInput() {
        super.handleWeaponInput();

        this.shoot();
        this.cooldown--;
    }
}