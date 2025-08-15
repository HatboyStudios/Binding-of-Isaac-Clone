class Crow extends Enemy {
    constructor(id, x, y, target, max_health = 35, damage = 10, speed = 1.5, size = 15) {
        super(x, y, max_health, damage, speed, size);
        this.id = id;
        this.player = target;

        this.VISION_RANGE = 120;
        this.AGGRO_RANGE = 300;
        this.ATTACK_RANGE = 30;
        this.DIVE_SPEED = speed * 2;
        this.CIRCLING_RADIUS = 200;
        const CIRCLING_SECONDS_PER_ROTATION = 5; 
        this.CIRCLING_SPEED = (2 * Math.PI) / (CIRCLING_SECONDS_PER_ROTATION * 60);
        this.CIRCLING_DURATION = 500; 
        
        const DIVE_SECONDS = 2;
        this.DIVE_DURATION = DIVE_SECONDS * 60;
        
        this.state = 'TRANSITION'; 
        this.circlingAngle = Math.atan2(this.y - this.player.y, this.x - this.player.x);
        this.circlingTimer = 0;
        this.aggroTransitionTarget = {
            x: this.player.x + Math.cos(this.circlingAngle) * this.CIRCLING_RADIUS,
            y: this.player.y + Math.sin(this.circlingAngle) * this.CIRCLING_RADIUS
        };
        
        this.diveTimer = 0;
        this.diveDirection = { x: 0, y: 0 };
        
        this.circlingNoiseOffset = Math.random() * 1200;
        this.circlingSpeedModifier = 0.05 + Math.random() * 0.1;
        
        this.MIN_CIRCLING_DISTANCE = 220;
    }

    findDistance(target) {
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const dist = Math.hypot(dx, dy);
        return { dx, dy, dist };
    }

    transitionState() {
        const { dist: distToPlayer } = this.findDistance(this.player);

        if (this.state === 'TRANSITION') {
            const { dist: distToTarget } = this.findDistance(this.aggroTransitionTarget);
            if (distToTarget < 5) {
                this.state = 'AGGRO';
                const randomOffset = Math.random() * this.CIRCLING_DURATION;
                this.circlingTimer = this.CIRCLING_DURATION + randomOffset;
            }
        }
        else if (this.state === 'AGGRO' && this.circlingTimer <= 0) {
            this.state = 'DIVE';
            const { dx, dy, dist } = this.findDistance(this.player);
            this.diveDirection = { x: dx / dist, y: dy / dist };
            this.diveTimer = this.DIVE_DURATION;
        }

        else if ((this.state === 'AGGRO' || this.state === 'DIVE') && distToPlayer > this.AGGRO_RANGE) {
            this.state = 'TRANSITION';
            this.circlingAngle = Math.atan2(this.y - this.player.y, this.x - this.player.x);
            this.aggroTransitionTarget = {
                x: this.player.x + Math.cos(this.circlingAngle) * this.CIRCLING_RADIUS,
                y: this.player.y + Math.sin(this.circlingAngle) * this.CIRCLING_RADIUS
            };
        }
    }
    
    handleAggroTransition(canvasWidth, canvasHeight) {
        const { dx, dy } = this.findDistance(this.aggroTransitionTarget);
        this.moveTowards(dx, dy, canvasWidth, canvasHeight, this.speed);
    }

    handleCircling(canvasWidth, canvasHeight) {
        this.circlingTimer--;
        this.circlingAngle += this.CIRCLING_SPEED;

        const { dx, dy, dist } = this.findDistance(this.player);
        this.circlingNoiseOffset += 0.01;
        const radiusOffset = noise(this.circlingNoiseOffset) * 40;
        const currentRadius = this.CIRCLING_RADIUS + radiusOffset;
        const targetX = this.player.x + Math.cos(this.circlingAngle) * currentRadius;
        const targetY = this.player.y + Math.sin(this.circlingAngle) * currentRadius;

        let circlingDx = targetX - this.x;
        let circlingDy = targetY - this.y;

        let repelDx = -dx;
        let repelDy = -dy;

        const repelFactor = map(dist, this.MIN_CIRCLING_DISTANCE, this.MIN_CIRCLING_DISTANCE + 30, 1, 0, true);
        const moveDx = circlingDx * (1 - repelFactor) + repelDx * repelFactor;
        const moveDy = circlingDy * (1 - repelFactor) + repelDy * repelFactor;

        this.moveTowards(moveDx, moveDy, canvasWidth, canvasHeight, this.speed);
    }

    handleDive(canvasWidth, canvasHeight) {
        this.diveTimer--;
        
        this.x += this.diveDirection.x * this.DIVE_SPEED;
        this.y += this.diveDirection.y * this.DIVE_SPEED;

        if (this.collidesWith(this.player)) { 
            if (typeof this.player.takeDamage === 'function') {
                this.player.takeDamage(this.damage);
            }
            this.endDive();
        } else if (this.diveTimer <= 0) {
            this.endDive();
        }
        
        this.x = constrain(this.x, this.size / 2, canvasWidth - this.size / 2);
        this.y = constrain(this.y, this.size / 2, canvasHeight - this.size / 2);
    }
    
    endDive() {
        this.state = 'AGGRO'; 
        this.circlingTimer = this.CIRCLING_DURATION;
        this.circlingAngle = Math.atan2(this.y - this.player.y, this.x - this.player.x);
    }
    
    collidesWith(other) {
        const dx = other.x - this.x;
        const dy = other.y - this.y;
        const dist = Math.hypot(dx, dy);
        return dist <= this.size + other.size / 2;
    }

    moveTowards(dx, dy, canvasWidth, canvasHeight, speed = this.speed) {
        const mag = Math.hypot(dx, dy);
        if (mag === 0) return;
        this.x = constrain(this.x + (dx / mag) * speed, this.size / 2, canvasWidth - this.size / 2);
        this.y = constrain(this.y + (dy / mag) * speed, this.size / 2, canvasHeight - this.size / 2);
    }

    takeDamage(amount) {
        if (this.state === 'DIVE') {
            super.takeDamage(amount);
            this.endDive();
        }
    }

    update(canvasWidth = 800, canvasHeight = 600) {
        this.transitionState();
        switch (this.state) {
            case 'TRANSITION':
                this.handleAggroTransition(canvasWidth, canvasHeight);
                break;
            case 'DIVE':
                this.handleDive(canvasWidth, canvasHeight);
                break;
            case 'AGGRO':
            default:
                this.handleCircling(canvasWidth, canvasHeight);
                break;
        }
    }

    draw() {
        super.draw();

        fill(0);
        noStroke();
        rectMode(CENTER);
        rect(this.x, this.y, this.size, this.size);
    }
}