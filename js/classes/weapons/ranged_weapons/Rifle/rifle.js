class Rifle extends RangedWeapon {
    constructor(total_ammo = 90) {
        super("Rifle", 15, 300, 30, total_ammo);
        this.cooldown = 0;
        this.fireRate = 7;
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
