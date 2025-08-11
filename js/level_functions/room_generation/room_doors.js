function findRoomDoors(map, current_room) {
  let coords = [current_room.y, current_room.x];
  let doors = [0,0,0,0];

  console.log(coords);

  try {
    if(map[coords[0]-1][coords[1]] !== 0 && map[coords[0]-1][coords[1]] !== null && map[coords[0]-1][coords[1]] !== undefined) {
      console.log("door above");
      doors[0] = 1;
    }
  }catch(err) {
      console.log("no room")
  }

  try {
    if(map[coords[0]][coords[1]+1] !== 0 && map[coords[0]][coords[1]+1] !== null && map[coords[0]][coords[1]+1] !== undefined) {
      console.log("door to right");
      doors[1] = 1;
    }
  }catch(err) {
    console.log("no room")
  }

  try {
    if(map[coords[0]+1][coords[1]] !== 0 && map[coords[0]+1][coords[1]] !== null && map[coords[0]+1][coords[1]] !== undefined) {
      console.log("door below");
      doors[2] = 1;
    }
  }catch(err) {
      console.log("no room")
  }

  try {
    if(map[coords[0]][coords[1]-1] !== 0 && map[coords[0]][coords[1]-1] !== null && map[coords[0]][coords[1]-1] !== undefined) {
      console.log("door to left");
      doors[3] = 1;
    }
  }catch(err) {
      console.log("no room")
  }

  return doors;
}