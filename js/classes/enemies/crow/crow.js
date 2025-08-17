class Crow extends Enemy {
    constructor(id, x, y, target, summoner, max_health = 35, damage = 10, speed = 1.5, size = 17, can_be_froze = true) {
        super(x, y, max_health, damage, speed, size);
        this.id = id;
        this.player = target;
        this.summoner = summoner;

        this.original_damage = damage;
        this.increased_damage = damage * 2;
        this.damage = damage;


        this.VISION_RANGE = 120;
        this.AGGRO_RANGE = 300;
        this.ATTACK_RANGE = 30;
        this.DIVE_SPEED = speed * 2;
        this.CIRCLING_RADIUS = 90; 
        const CIRCLING_SECONDS_PER_ROTATION = 5;
        this.CIRCLING_SPEED = (2 * Math.PI) / (CIRCLING_SECONDS_PER_ROTATION * 60);
        this.CIRCLING_DURATION = 500;
        const DIVE_SECONDS = 2;
        this.DIVE_DURATION = DIVE_SECONDS * 60;

        this.state = "TRANSITION";
        this.circlingAngle = Math.atan2(this.y - this.player.y, this.x - this.player.x);
        this.circlingTimer = 0;
        this.aggroTransitionTarget = this.transitionTarget();
        this.diveTimer = 0;
        this.diveDirection = { x: 0, y: 0 };
        this.circlingNoiseOffset = Math.random() * 1200;
        this.circlingSpeedModifier = 0.05 + Math.random() * 0.1;
        this.circlingAngleNoiseOffset = Math.random() * 1000;
        this.MIN_CIRCLING_DISTANCE = 120;
        this.lastWallAvoidTime = 0;
        this.can_be_froze = can_be_froze;
        this._hasHandledDeath = false;

        this.altitude = 1; 
        this.shadowOffset = 0;
        this.originalSize = size;

        this.lastPlayerPos = { x: this.player.x, y: this.player.y };
        this.stationaryFrames = 0;
        this.stationaryThreshold = 400;
        this.increased_damage = this.damage * 2;
    }

    findDistance(target) {
        if (!target) return { dx: 0, dy: 0, dist: Infinity };
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        return { dx, dy, dist: Math.hypot(dx, dy) };
    }

    transitionTarget() {
        const angle = Math.atan2(this.y - this.player.y, this.x - this.player.x);
        return {
            x: this.player.x + Math.cos(angle) * this.CIRCLING_RADIUS,
            y: this.player.y + Math.sin(angle) * this.CIRCLING_RADIUS
        };
    }

    updateDepth() {
        switch(this.state) {
            case "AGGRO":
            case "TRANSITION":
                this.altitude = 1; 
                this.size = this.originalSize * 0.8; 
                this.shadowOffset = 10; 
                break;
            case "DIVE":
                this.altitude = Math.max(0, this.altitude - 0.05);
                this.size = this.originalSize + (1 - this.altitude) * 1.5;
                this.shadowOffset = (1 - this.altitude) * 15; 
                break;
        }
    }

    isPlayerStationary() {
        const dx = this.player.x - this.lastPlayerPos.x;
        const dy = this.player.y - this.lastPlayerPos.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 1) {
            this.stationaryFrames++;
        } else {
            this.stationaryFrames = 0;
            this.damage = this.original_damage;
            this.lastPlayerPos.x = this.player.x;
            this.lastPlayerPos.y = this.player.y;
        }

        if (this.stationaryFrames >= this.stationaryThreshold && this.state !== "DIVE") {
            this.state = "DIVE";
            this.damage = this.increased_damage;
            const { dx, dy, dist } = this.findDistance(this.player);
            if (dist > 0) this.diveDirection = { x: dx / dist, y: dy / dist };
            this.diveTimer = this.DIVE_DURATION;
            this.stationaryFrames = 0;
        }
    }

    transitionState() {
        const { dist: distToPlayer } = this.findDistance(this.player);

        this.isPlayerStationary();

        if (this.state === "TRANSITION") {
            const { dist: distToTarget } = this.findDistance(this.aggroTransitionTarget);
            if (distToTarget < 5) {
                this.state = "AGGRO";
                this.circlingTimer = this.CIRCLING_DURATION + Math.random() * this.CIRCLING_DURATION;
            }
        } else if (this.state === "AGGRO" && this.circlingTimer <= 0) {
            if (distToPlayer <= this.AGGRO_RANGE) {
                this.state = "DIVE";
                const { dx, dy, dist } = this.findDistance(this.player);
                if (dist > 0) this.diveDirection = { x: dx / dist, y: dy / dist };
                this.diveTimer = this.DIVE_DURATION;
            }
        } else if ((this.state === "AGGRO" || this.state === "DIVE") && distToPlayer > this.AGGRO_RANGE * 1.5) {
            this.state = "TRANSITION";
            this.aggroTransitionTarget = this.transitionTarget();
        }
    }

    handleTransition(canvasWidth, canvasHeight) {
        const { dx, dy } = this.findDistance(this.aggroTransitionTarget);
        this.moveTowards(dx, dy, canvasWidth, canvasHeight, this.speed);
    }

    handleCircling(canvasWidth, canvasHeight) {
        if (this.circlingTimer > 0) this.circlingTimer--;

        const angleVariation = (noise(this.circlingAngleNoiseOffset) - 0.5) * 0.03;
        this.circlingAngle += (this.CIRCLING_SPEED + angleVariation) * this.circlingSpeedModifier;
        this.circlingAngleNoiseOffset += 0.005;

        const { dx, dy, dist } = this.findDistance(this.player);
        this.circlingNoiseOffset += 0.01;

        const radiusOffset = noise(this.circlingNoiseOffset) * 30;
        const currentRadius = this.CIRCLING_RADIUS + radiusOffset;

        const buffer = this.CIRCLING_RADIUS + this.size;
        const clampedPlayerX = constrain(this.player.x, buffer, canvasWidth - buffer);
        const clampedPlayerY = constrain(this.player.y, buffer, canvasHeight - buffer);

        let targetX = clampedPlayerX + Math.cos(this.circlingAngle) * currentRadius;
        let targetY = clampedPlayerY + Math.sin(this.circlingAngle) * currentRadius;

        targetX = constrain(targetX, this.size, canvasWidth - this.size);
        targetY = constrain(targetY, this.size, canvasHeight - this.size);

        let moveDx = targetX - this.x;
        let moveDy = targetY - this.y;

        const repelFactor = map(dist, this.MIN_CIRCLING_DISTANCE, this.MIN_CIRCLING_DISTANCE + 30, 1, 0, true);
        moveDx = moveDx * (1 - repelFactor) + (-dx) * repelFactor;
        moveDy = moveDy * (1 - repelFactor) + (-dy) * repelFactor;

        const edgeBuffer = 20;
        let avoidX = 0, avoidY = 0;
        if (this.x < edgeBuffer) avoidX = 1;
        else if (this.x > canvasWidth - edgeBuffer) avoidX = -1;
        if (this.y < edgeBuffer) avoidY = 1;
        else if (this.y > canvasHeight - edgeBuffer) avoidY = -1;

        const avoidStrength = 0.7;
        moveDx += avoidX * avoidStrength;
        moveDy += avoidY * avoidStrength;

        if ((avoidX || avoidY) && frameCount - this.lastWallAvoidTime > 30) {
            this.circlingSpeedModifier *= -1;
            this.lastWallAvoidTime = frameCount;
        }

        this.moveTowards(moveDx, moveDy, canvasWidth, canvasHeight, this.speed);
    }

    handleDive(canvasWidth, canvasHeight) {
        if (this.diveTimer > 0) this.diveTimer--;

        this.x += this.diveDirection.x * this.DIVE_SPEED;
        this.y += this.diveDirection.y * this.DIVE_SPEED;

        if (this.collidesWith(this.player)) {
            if (typeof this.player.takeDamage === "function") this.player.takeDamage(this.damage);
            this.endDive();
        } else if (this.diveTimer <= 0 ||
                   this.x <= this.size/2 || this.x >= canvasWidth - this.size/2 ||
                   this.y <= this.size/2 || this.y >= canvasHeight - this.size/2) {
            this.endDive();
        }
    }

    endDive() {
        this.state = "AGGRO";
        this.size = this.originalSize;
        this.circlingTimer = this.CIRCLING_DURATION;
        this.circlingAngle = Math.atan2(this.y - this.player.y, this.x - this.player.x);
        this.altitude = 1;
    }

    collidesWith(other) {
        if (!other) return false;
        const dx = other.x - this.x;
        const dy = other.y - this.y;
        return Math.hypot(dx, dy) <= this.size + other.size / 2;
    }

    moveTowards(dx, dy, canvasWidth, canvasHeight, speed = this.speed) {
        const mag = Math.hypot(dx, dy);
        if (mag === 0) return;
        this.x = constrain(this.x + (dx / mag) * speed, this.size / 2, canvasWidth - this.size / 2);
        this.y = constrain(this.y + (dy / mag) * speed, this.size / 2, canvasHeight - this.size / 2);
    }

    takeDamage(amount) {
        if (this.state === "DIVE") {
            super.takeDamage(amount);
            this.endDive();
        }
    }

    update(canvasWidth, canvasHeight) {
        if (this.can_be_froze && this.isFrozen) return;

        if (this.isDead()) {
            if (!this._hasHandledDeath) {
                this.handleDeath();
                this._hasHandledDeath = true;
            }
            return;
        }

        this.transitionState();

        switch (this.state) {
            case "TRANSITION": this.handleTransition(canvasWidth, canvasHeight); break;
            case "DIVE": this.handleDive(canvasWidth, canvasHeight); break;
            case "AGGRO":
            default: this.handleCircling(canvasWidth, canvasHeight); break;
        }

        this.updateDepth();
    }

    draw() {
        super.draw();

        fill(0, 100);
        noStroke();

        let shadowWidth = this.size * this.altitude;
        let shadowHeight = this.size * 0.5 * this.altitude;
        ellipse(this.x, this.y + this.shadowOffset, shadowWidth, shadowHeight);

        fill(0);
        rectMode(CENTER);
        rect(this.x, this.y - this.altitude * 5, this.size, this.size);
    }

    handleDeath() {
        console.log(`Crow ${this.id} died.`);
        if (this.summoner && typeof this.summoner.onCrowDeath === "function") {
            this.summoner.onCrowDeath();
        }
    }
}

class ZigZagCrow extends Crow {
    constructor(id, x, y, target, summoner) {
        super(id, x, y, target, summoner, 35, 12, 1.5, 15);
        this.DIVE_SPEED = this.speed * 2;
        this.zigzagAmplitude = 25;
        this.zigzagFrequency = 0.25;
        this.zigzagTimer = 0;
    }

    handleDive(canvasWidth, canvasHeight) {
        if (this.diveTimer > 0) this.diveTimer--;

        this.zigzagTimer += this.zigzagFrequency;
        const offsetX = Math.sin(this.zigzagTimer) * this.zigzagAmplitude;
        const offsetY = Math.cos(this.zigzagTimer) * this.zigzagAmplitude;

        this.x += this.diveDirection.x * this.DIVE_SPEED + offsetX * 0.05;
        this.y += this.diveDirection.y * this.DIVE_SPEED + offsetY * 0.05;

       if (this.collidesWith(this.player)) {
            if (typeof this.player.takeDamage === "function") this.player.takeDamage(this.damage);
            this.endDive();
        } else if (this.diveTimer <= 0 ||
                this.x <= this.size/2 || this.x >= canvasWidth - this.size/2 ||
                this.y <= this.size/2 || this.y >= canvasHeight - this.size/2) {
            this.endDive();
        }
    }
}

class SwoopCrow extends Crow {
    constructor(id, x, y, target, summoner) {
        super(id, x, y, target, summoner, 45, 15, 1.2, 18); 
        this.DIVE_SPEED = this.speed * 1.8;
        this.swoopAngle = 10;
        this.swoopSpeed = 0.12;
    }

    handleDive(canvasWidth, canvasHeight) {
        if (this.diveTimer > 0) this.diveTimer--;

        this.swoopAngle += this.swoopSpeed;
        const cos = Math.cos(this.swoopAngle) * 0.5;
        const sin = Math.sin(this.swoopAngle) * 0.5;

        this.x += this.diveDirection.x * this.DIVE_SPEED + cos;
        this.y += this.diveDirection.y * this.DIVE_SPEED + sin;

        if (this.collidesWith(this.player)) {
            if (typeof this.player.takeDamage === "function") this.player.takeDamage(this.damage);
            this.endDive();
        } else if (this.diveTimer <= 0 ||
                this.x <= this.size/2 || this.x >= canvasWidth - this.size/2 ||
                this.y <= this.size/2 || this.y >= canvasHeight - this.size/2) {
            this.endDive();
        }
    }
}
