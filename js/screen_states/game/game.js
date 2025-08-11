var map;
var map_data;
var current_room;
var doors

function gameSetup() {
  console.log("working from game");

  //background_color = "blue";
  player = new Player(200, 200, 1, 100, 2, 50, 10, 5, 100);

  map = roomGeneration(5, 5, 10);
  map_data = assignRoomIds(map);

  console.log(map_data);

  background_color = map_data[0].room_color;

  current_room = map_data[0];

  doors = findRoomDoors(map, current_room);
  console.log(doors);

  drawDoors(doors);
}

function gameDraw() {
  player.draw();
}