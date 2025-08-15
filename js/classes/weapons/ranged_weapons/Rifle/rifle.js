class Rifle extends RangedWeapon {
  constructor(owner, baseName = 'Rifle', baseDamage = 15, baseSpeed = 2, baseRange = 300, baseCapacity = 30, totalAmmo, powerTier = 'Crude', materialTier = 'Bone', effectType = 'None') {
    super(owner, baseName, baseDamage, baseSpeed, baseRange, baseCapacity, totalAmmo, powerTier, materialTier, effectType);
    this.cooldown = 0;
    this.fire_rate = 10;
  }

  shoot() {
    if (this.cooldown <= 0) {
      this.fire(player_direction);
      this.cooldown = this.fire_rate;
    }
  }

  handleWeaponInput() {
    if (keyIsDown(82)) this.reload();

    const dir = this.getInputDirection();
    if (dir) {
      player_direction = dir;
      this.shoot();
      player_shooting = true;
    } else {
      player_shooting = false;
    }

    if (this.cooldown > 0) this.cooldown--;
  }

  getInputDirection() {
    if (keyIsDown(38)) return "up";
    if (keyIsDown(39)) return "right";
    if (keyIsDown(40)) return "down";
    if (keyIsDown(37)) return "left";
    return null;
  }
}