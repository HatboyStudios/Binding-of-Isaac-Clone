const GAME_STATES = {
  START_MENU: 0,
  GAME_MENU: 1,
  GAME: 2,
  INV: 3,
  PAUSE: 4,
  SETTING: 5,
  DEATH: 6
};

var current_state = GAME_STATES.GAME; 
var background_color;

var player;
let player_weapon;
let enemies = [];
let collectables = [];

var player_direction = "down";
var player_shooting = false;

let bullets;
let timeFrozen;

function setup() {
  createCanvas(800, 450);

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

  gameUpdate();
}