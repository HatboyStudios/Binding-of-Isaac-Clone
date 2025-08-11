class Sniper extends RangedWeapon {
  constructor(total_ammo = 15) {
    super("Sniper", 50, 600, 5, total_ammo);
    this.fire_flag = true;
    this.cooldown = 0;
    this.fireRate = 90;
  }

  shoot() {
    if (this.fire_flag && this.cooldown <= 0) {
      this.fire();
      this.fire_flag = false;
      this.cooldown = this.fireRate; 
    }
  }

  handleWeaponInput() {
    if (keyIsDown(82)) { 
      this.reload();
    }

    if (mouseIsPressed) {
      this.shoot();
    } else {
      this.fire_flag = true;
    }

    if (this.cooldown > 0) {
      this.cooldown--;
    }
  }
}
