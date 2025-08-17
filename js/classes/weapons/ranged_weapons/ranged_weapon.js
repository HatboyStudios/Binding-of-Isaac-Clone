const WEAPON_CATEGORY = {
    "pistol": "pistol",
    "rifle": "rifle",
    "shotgun": "shotgun",
    "sniper": "sniper",
};

const keysHeld = {
    up: false,
    down: false,
    left: false,
    right: false
};

function keyPressed() {
    if (keyCode === UP_ARROW) keysHeld.up = true;
    if (keyCode === DOWN_ARROW) keysHeld.down = true;
    if (keyCode === LEFT_ARROW) keysHeld.left = true;
    if (keyCode === RIGHT_ARROW) keysHeld.right = true;
}

function keyReleased() {
    if (keyCode === UP_ARROW) keysHeld.up = false;
    if (keyCode === DOWN_ARROW) keysHeld.down = false;
    if (keyCode === LEFT_ARROW) keysHeld.left = false;
    if (keyCode === RIGHT_ARROW) keysHeld.right = false;
}


class RangedWeapon {
    constructor(owner, weaponCategory, baseName, baseDamage, baseSpeed, baseReload, baseRange, baseCapacity, baseTotalAmmo, powerTier, materialTier, effectType) {
        this.owner = owner;
        this.weaponCategory = weaponCategory;
        this.baseName = baseName;
        this.baseDamage = baseDamage;
        this.baseSpeed = baseSpeed;
        this.baseReload = baseReload;
        this.baseRange = baseRange;
        this.baseCapacity = baseCapacity;
        this.baseTotalAmmo = baseTotalAmmo;
        this.powerTier = powerTier;
        this.materialTier = materialTier;
        this.effectType = effectType;

        const powerMult = WeaponTiers[powerTier];
        const materialMult = MaterialTiers[materialTier];

        this.boosted_damage = baseDamage * powerMult.damage;
        this.boosted_range = baseRange * powerMult.range;
        this.boosted_speed = baseSpeed * powerMult.speed;

        const capacity = Math.round(baseCapacity * materialMult.capacity);
        const totalAmmo = baseTotalAmmo !== null 
            ? Math.round(baseTotalAmmo * materialMult.capacity) 
            : null;

        this.reload_pressed = false;
        this.reloading = false;
        this.reload_count_down = 0;

        this.name = this.generateWeaponName();

        let weaponType = WEAPON_CATEGORY[weaponCategory.toLowerCase()];
        if (!weaponType) {
            console.error(`Unknown weapon type: ${baseName}`);
        }

        this.fire_flag = true;
        this.cooldown = 0;
        this.fire_rate = 0; 

        this.ammo_manager = new AmmoManagement(owner, this.name, this.boosted_damage, this.boosted_speed, capacity, totalAmmo, this.boosted_range, effectType, weaponType);
    }

    generateWeaponName() {
        const effectPrefix = this.effectType !== "None" ? `${this.effectType} ` : "";
        return `${effectPrefix}${this.powerTier} ${this.materialTier} ${this.baseName}`;
    }

    handleWeaponInput() {
        if (keyIsDown(82)) {
            if (!this.reload_pressed && !this.reloading) {
                this.reload_pressed = true;
                this.reloading = true;
                this.reload_count_down = this.baseReload;
            }
        } else this.reload_pressed = false;

        if (this.reloading) {
            this.reload_count_down--;
            if (this.reload_count_down <= 0) {
                this.ammo_manager.reload();
                this.reloading = false;
                this.reload_count_down = 0;
            }
        }
    }

    shoot() {
        if (this.fire_flag) {
            this.fire(player_direction);
            this.fire_flag = false;
        }
    }

    fire(direction) {
        if (!timeFrozen && !this.reloading) {
            return this.ammo_manager.fire(direction);
        }
    }

    getInputDirection() {
        let x = 0;
        let y = 0;

        if (keysHeld.up) y -= 1;
        if (keysHeld.down) y += 1;
        if (keysHeld.left) x -= 1;
        if (keysHeld.right) x += 1;

        const mag = Math.hypot(x, y);
        if (mag === 0) return null;
        return { x: x / mag, y: y / mag };
    }

    drawInfo(x, y) {
        fill(255);
        textSize(12);
        text(this.name, x, y);
        text(`DMG: ${this.boosted_damage.toFixed(1)} | RNG: ${this.boosted_range.toFixed(1)}`, x, y + 15);
        text(`Speed: ${this.boosted_speed.toFixed(1)} | Ammo: ${this.ammo_manager.current_ammo}/${this.ammo_manager.capacity}`, x, y + 30);
        text(`Effect: ${this.effectType}`, x, y + 45);
        text(`${Effects[this.effectType].description}`, x, y + 60);
    }
}
