function drawDoors(is_door) {
  console.log("hello")
  if(is_door[0] === 1) {
    new Sprite(200, 50, 50, 10);
  }

  if(is_door[1] === 1) {
    new Sprite(350, 200, 10, 50);
  }

  if(is_door[2] === 1) {
    new Sprite(200, 350, 50, 10);
  }

  if(is_door[3] === 1) {
    new Sprite(50, 200, 10, 50);
  }
}