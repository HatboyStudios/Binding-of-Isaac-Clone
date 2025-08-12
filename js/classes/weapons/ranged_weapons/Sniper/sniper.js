class Sniper extends RangedWeapon {
  constructor(total_ammo = 15) {
    super("Sniper", 50, 600, 5, total_ammo);
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
      if(keyIsDown('r') || keyIsDown('R')) {
          this.reload();
      }

      let shot = false;
      
      if(keyIsDown(38)) {
          player_direction = "up";
          shot = true;
      } else if(keyIsDown(39)) {
          player_direction = "right";
          shot = true;
      } else if(keyIsDown(40)) {
          player_direction = "down";
          shot = true;
      } else if(keyIsDown(37)) {
          player_direction = "left";
          shot = true;
      }

      if (shot) {
          this.shoot();
          player_shooting = true;
      } else {
          player_shooting = false;
      }

      if (!keyIsDown(38) && !keyIsDown(39) && !keyIsDown(40) && !keyIsDown(37)) {
          this.fire_flag = true;
          player_shooting = false;
      }
  }
}
