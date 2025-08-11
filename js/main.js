const GAME_STATES = {
  START_MENU: 0,
  GAME_MENU: 1,
  GAME: 2,
  INV: 3,
  PAUSE: 4,
  SETTING: 5,
  DEATH: 6
};

var current_state = 0;
var background_color;
var player;

function setup() {
  let screen = createCanvas(400, 400);

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

  player = new Player(200, 200, 1, 100, 2, 50, 10, 5, 100);
}

function update() {
  clear();
  background(background_color);

  player.draw();
}