const GAME_STATES = {
  START_MENU: 0,
  GAME_MENU: 1,
  GAME: 2,
  INV: 3,
  PAUSE: 4,
  SETTING: 5,
  DEATH: 6
};

var current_state = GAME_STATES.START_MENU; 
var background_color;

var player;
let ranged_weapon;
let enemies = [];

var player_direction = "down";
var player_shooting = false;

var dots;

function setup() {
  createCanvas(600, 600);

  player = new Player(200, 200, 1, 100, 2, 50, 10, 5, 100);

  ranged_weapon = new Pistol(60);

  for (let i = 0; i < 3; i++) {
    enemies.push(new Following(i, 50, 50, player));
  }

  dots = new Group();
	dots.color = 'yellow';
	dots.y = 25;
	dots.diameter = 10;

  switch (current_state) {
    case GAME_STATES.START_MENU:
      startMenuSetup();
      break;
    case GAME_STATES.GAME_MENU:
      gameMenuSetup();
      break;
    case GAME_STATES.GAME:
      gameSetup();
      break;
    case GAME_STATES.INV:
      inventorySetup();
      break;
    case GAME_STATES.PAUSE:
      pauseMenuSetup();
      break;
    case GAME_STATES.SETTING:
      settingsMenuSetup();
      break;
    case GAME_STATES.DEATH:
      deathMenuSetup();
      break;
  }
}

function update() {
  clear();
  background(background_color);

  if (ranged_weapon) ranged_weapon.handleWeaponInput();

  for (let i = 0; i < enemies.length; i++) {
    if (typeof enemies[i].update === "function") {
      enemies[i].update(width, height, enemies);
    }
    if (typeof enemies[i].collider === "function") {
      enemies[i].collider(enemies);
    }
    if (typeof enemies[i].draw === "function") {
      enemies[i].draw();
    }
  }

  this.direction = player_direction
  console.log(player_shooting);

  if(player_shooting === true && frameCount % 30 === 0 && ranged_weapon.ammo_manager.current_ammo !== 0 ) {
    shootBullet();
  }

  player.draw();
  player.playerMovement();
}

function shootBullet() {
  let bullet = new dots.Sprite(player.x, player.y);
  if(player_direction === "up") {
    bullet.vel.y = -5;
  }else if(player_direction === "right") {
    bullet.vel.x = 5;
  }else if(player_direction === "down") {
    bullet.vel.y = 5;
  }else {
    bullet.vel.x = -5;
  }
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
