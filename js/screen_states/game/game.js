var map;
var map_data;
var current_room;
var new_room;
var doors

var saved_map;
var saved_map_data
var has_saved_map = 0;

function gameSetup() {
  console.log("working from game");

  //background_color = "blue";
  player = new Player(200, 200, 1, 100, 2, 50, 10, 5, 100);

  if(has_saved_map === 1) {
    map = saved_map;
    map_data = saved_map_data;
  }else {
   for(has_saved_map; has_saved_map<1; has_saved_map++) {
      map = roomGeneration(5, 5, 10);
      map_data = assignRoomIds(map);
      saved_map_data = map_data;
      saved_map = map;

      background_color = map_data[0].room_color;

      new_room = map_data[0];
    }
  }

  console.log(map_data);

  console.log(new_room);

  current_room = new_room;

  doors = findRoomDoors(map, new_room);
  console.log(doors);

  drawDoors(doors);
}

function gameDraw() {
  doorHandler(player, door_sprites);
  player.draw();
}