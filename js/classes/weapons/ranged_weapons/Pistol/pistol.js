class Pistol extends RangedWeapon {
  constructor(owner, baseName = 'Pistol', baseDamage = 10, baseSpeed = 2, baseRange = 200, baseCapacity = 12, totalAmmo, powerTier = 'Crude', materialTier = 'Bone', effectType = 'None') {
    super(owner, baseName, baseDamage, baseSpeed, baseRange, baseCapacity, totalAmmo, powerTier, materialTier, effectType);
    this.fire_flag = true;
  }

  shoot() {
    if (this.fire_flag) {
      this.fire(player_direction);
      this.fire_flag = false;
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
      this.fire_flag = true;
      player_shooting = false;
    }
  }

  getInputDirection() {
    if (keyIsDown(38)) return "up";
    if (keyIsDown(39)) return "right";
    if (keyIsDown(40)) return "down";
    if (keyIsDown(37)) return "left";
    return null;
  }
}

class AutoPistol extends RangedWeapon {
  constructor(owner, baseName = 'Auto Pistol', baseDamage = 10, baseRange = 50, baseCapacity = 12, totalAmmo, powerTier = 'Crude', materialTier = 'Bone', effectType = 'None') {
    super(owner, baseName, baseDamage, 2, baseRange, baseCapacity, totalAmmo, powerTier, materialTier, effectType);
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
