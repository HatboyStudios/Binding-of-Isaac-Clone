class Shotgun extends RangedWeapon {
    constructor(total_ammo = 32) {
        super("Shotgun", 25, 120, 8, total_ammo);
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
