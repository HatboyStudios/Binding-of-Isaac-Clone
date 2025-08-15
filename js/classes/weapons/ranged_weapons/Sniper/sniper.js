class Sniper extends RangedWeapon {
  constructor(owner, baseName = 'Sniper', baseDamage = 50, baseSpeed = 2, baseRange = 600, baseCapacity = 5, totalAmmo, powerTier = 'Crude', materialTier = 'Bone', effectType = 'None') {
    super(owner, baseName, baseDamage, baseSpeed, baseRange, baseCapacity, totalAmmo, powerTier, materialTier, effectType);
    this.fire_flag = true;
    this.last_shot_time = 0;
    this.shot_delay = 2500;
  }

  shoot() {
    const now = Date.now();
    if (this.fire_flag && now - this.last_shot_time >= this.shot_delay) {
      this.fire(player_direction);
      this.fire_flag = false;
      this.last_shot_time = now;
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
