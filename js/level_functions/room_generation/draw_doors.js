var door_sprites = [null, null, null, null];

function drawDoors(is_door) {
  console.log("hello")
  if(is_door[0] === 1) {
    door_sprites[0] = new Sprite(200, 50, 50, 10);
  }else {
    door_sprites[0] = null;
  }

  if(is_door[1] === 1) {
    door_sprites[1] = new Sprite(350, 200, 10, 50);
  }else {
    door_sprites[1] = null;
  }

  if(is_door[2] === 1) {
    door_sprites[2] = new Sprite(200, 350, 50, 10);
  }else {
    door_sprites[2] = null;
  }

  if(is_door[3] === 1) {
    door_sprites[3] = new Sprite(50, 200, 10, 50);
  }else {
    door_sprites[3] = null;
  }

  console.log(door_sprites)
}

function doorHandler(player, doors) {
  for(let i = 0; i < doors.length; i++) {
    if(doors === null) {
      continue
    }else {
      try {
        if(player.x >= doors[i].x-doors[i].width/2 && player.x <= doors[i].x+doors[i].width/2 && player.y >= doors[i].y-doors[i].height/2 && player.y <= doors[i].y+doors[i].height/2) {
          console.log("and away we gooooo");
          if(i === 0) {
            for(let i = 0; i < map_data.length; i++) {
              if (map_data[i].x === current_room.x && map_data[i].y === current_room.y-1) {
                new_room = map_data[i]
                break;
              }else {
                continue;
              }
            } 
          }else if(i === 1) {
            for(let i = 0; i < map_data.length; i++) {
              if (map_data[i].x === current_room.x+1 && map_data[i].y === current_room.y) {
                new_room = map_data[i]
                break;
              }else {
                continue;
              }
            }
          }else if(i === 2) {
            for(let i = 0; i < map_data.length; i++) {
              if (map_data[i].x === current_room.x && map_data[i].y === current_room.y+1) {
                new_room = map_data[i]
                break;
              }else {
                continue;
              }
            } 
          }else if(i === 3) {
            for(let i = 0; i < map_data.length; i++) {
              if (map_data[i].x === current_room.x-1 && map_data[i].y === current_room.y) {
                new_room = map_data[i]
                break;
              }else {
                continue;
              }
            } 
          }

          newScene(2);
        }
      }catch(err) {
        continue
      }
    }
  }
}