class RangedWeapon {
    constructor(name, damage, range, capacity, total_ammo) {
        this.name = name;
        this.damage = damage;
        this.range = range;
        
        this.ammo_manager = new AmmoManagement(capacity, total_ammo);
    }

    fire() {
        return this.ammo_manager.fire();
    }

    reload() {
        this.ammo_manager.reload();
    }
    
    shoot() {
        throw new Error("No Sub_Class Shoot Method Implemented");
    }

    handleWeaponInput() {
        if(keyIsDown('r') || keyIsDown('R')) {
            this.reload();
        }

        if(keyIsDown("up_arrow")) {
            this.shoot();
        }
    }
}