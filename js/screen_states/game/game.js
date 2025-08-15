function gameSetup() {
    console.log("working from game");
    background_color = "purple";

    bullets = new Group();
    player = new Player(200, 200, 1, 100, 2, 50, 10, 5, 100);
  
    for (let i = 0; i < 1; i++) {
      enemies.push(new ShotgunShooter(i, 300, 300, player));
    }

    player_weapon = new Pistol(
      player,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      40,
      "Eldritch",
      "Ribcage",
      "Pestilent"
    );

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
    if (player_weapon) player_weapon.handleWeaponInput();

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

    if (player_weapon) {
      player_weapon.drawInfo(10, 20);
    }

    for (let i = bullets.length - 1; i >= 0; i--) {
        let b = bullets[i];

        if (!b.startX || !b.startY || !b.range) continue;

        b.position.x += b.vel.x;
        b.position.y += b.vel.y;

        const dx = b.position.x - b.startX;
        const dy = b.position.y - b.startY;
        const dist = Math.sqrt(dx * dx + dy * dy);


        if (dist > b.range) {
            b.remove();
        }
    }
}