class Collectable {
    constructor(x, y, size, req = {}) {
        this.x = x;
        this.y = y;
        this.size = size;

        this.type = req.type || 'generic';
        this.color = req.color || 'white';
        this.sprite = req.sprite || null;
        this.value = req.value || 0;
        this.buff = req.buff || null;
        this.weapon = req.weapon || null;

        this.onPickup = function(player) {
            switch (this.type) {
            case 'health':
                player.heal(this.value);
                break;
            case 'buff':
                player.addModifier(this.buff);
                break;
            case 'weapon':
                console.log(this.weapon);
                break;
            }
        };

        this.collected = false;
    }

    update() {
        // placeholder
    }

    draw() {
        if (this.sprite) {
            image(this.sprite, this.x - this.size/2, this.y - this.size/2, this.size, this.size);
        } else {
            fill(this.color);
            stroke(255);      
            strokeWeight(2);
            ellipse(this.x, this.y, this.size);
            noStroke(); 
        }
    }

    checkCollision(player) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.hypot(dx, dy);
        if (distance < (player.size / 2 + this.size / 2)) {
            this.collect(player);
        }
    }

    collect(player) {
        if (this.collected) return; 
        this.collected = true;
        this.onPickup(player);
    }
}
