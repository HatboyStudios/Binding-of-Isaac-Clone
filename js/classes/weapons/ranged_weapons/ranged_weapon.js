class RangedWeapon {
    constructor(name, damage, range, capacity, total_ammo) {
        this.name = name;
        this.damage = damage;
        this.range = range;
        
        this.ammo_manager = new AmmoManagement(name, damage, capacity, total_ammo);
    }

    fire(player_direction) {
        if (!timeFrozen) {
            return this.ammo_manager.fire(player_direction);
        }
    }

    reload() {
        this.ammo_manager.reload();
    }
    
    handleWeaponInput() {
        if(keyIsDown(82)) {
            this.reload();
        }
    }
}