function gameSetup() {
    console.log("working from game");
    background_color = "purple";

    bullets = new Group();
    player = new Player(200, 200, 1, 100, 2, 50, 10, 5, 100);
    ranged_weapon = new Pistol(60);

    for (let i = 0; i < 1; i++) {
      enemies.push(new TeleportVine(i, 300, 300, player));
    }

    console.log(enemies)

    collectables.push(new Collectable(random(30, width - 30), random(30, height - 30), 30, {
      type: 'buff',
      buff: {
        name: 'speed boost',
        stat: 'speed',
        amount: 1.5,
        duration: 1000,
      },
      color: 'lightblue',
    }));
}

function gameUpdate() {
    if (ranged_weapon) ranged_weapon.handleWeaponInput();

    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];

        if (typeof enemy.update === "function") {
            enemy.update(width, height, enemies, bullets, player);
        }

        if (typeof enemy.collider === "function") {
            enemy.collider(enemies, bullets, player);
        }

        if (typeof enemy.draw === "function") {
            enemy.draw();
        }

        if (enemy.isDead() && enemy._hasHandledDeath) {
            enemies.splice(i, 1);
        }
    }

    for (let i = collectables.length - 1; i >= 0; i--) {
      collectables[i].draw();         
      collectables[i].checkCollision(player); 
      if (collectables[i].collected) {
        collectables.splice(i, 1);     
      }
    }

    player.update();
    player.draw();
}

function switchWeapon(NewWeaponClass) {
  if (ranged_weapon && ranged_weapon.ammo_manager) {
    let oldManager = ranged_weapon.ammo_manager;
    let newWeapon = new NewWeaponClass(oldManager.total_ammo);

    newWeapon.ammo_manager.current_clip = oldManager.current_clip;
    newWeapon.ammo_manager.is_reloading = oldManager.is_reloading;

    ranged_weapon = newWeapon;
  } else {
    ranged_weapon = new NewWeaponClass();
  }
}

function keyPressed() {
  if (key === '1') {
    switchWeapon(Pistol);
    console.log("Switched to Normal Pistol");
  }
  else if (key === '2') {
    switchWeapon(AutoPistol);
    console.log("Switched to Auto Pistol");
  }
  else if (key === '3') {
    switchWeapon(Rifle);
    console.log("Switched to Rifle");
  }
  else if (key === '4') {
    switchWeapon(Shotgun);
    console.log("Switched to Shotgun");
  }
  else if (key === '5') {
    switchWeapon(Sniper);
    console.log("Switched to Sniper");
  }
}