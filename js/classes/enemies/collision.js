class Collision {
    constructor(x, y, speed, size) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.size = size;
    }

    checkWallCollision(canvas_width, canvas_height) {
        if (this.x < 0) this.x = 0;
        if (this.x + this.size > canvas_width) this.x = canvas_width - this.size;

        if (this.y < 0) this.y = 0;
        if (this.y + this.size > canvas_height) this.y = canvas_height - this.size;
    }
}
