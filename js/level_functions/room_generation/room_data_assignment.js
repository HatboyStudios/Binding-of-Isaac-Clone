var room_count = 10;
//var temp_map = roomGeneration(Math.floor(room_count/2), Math.floor(room_count/2), room_count);

function assignRoomIds(map) {
  console.log(map);
  let room_data = [];
  let current_room = 1;
  for(let i = 0; i < map.length; i++) {
    for(let j = 0; j < map[i].length; j++) {
      if(map[i][j] === 1) {
        room_coords = {
          id: current_room,
          y:i,
          x:j,
          room_color: "rgb("+Math.floor(random(0,255))+","+Math.floor(random(0,255))+","+Math.floor(random(0,255))+")"
        }

        current_room++

        room_data.push(room_coords);
        break
      }else {
        continue;
      }
    }
  }

  for(let i = 0; i < map.length; i++) {
    for(let j = 0; j < map[i].length; j++) {
      if(map[i][j] === 2) {
        room_coords = {
          id: current_room,
          y:i,
          x:j,
          room_color: "rgb("+Math.floor(random(0,255))+","+Math.floor(random(0,255))+","+Math.floor(random(0,255))+")"
        }

        current_room++

        room_data.push(room_coords);
        continue
      }else {
        continue;
      }
    }
  }

  return room_data
}