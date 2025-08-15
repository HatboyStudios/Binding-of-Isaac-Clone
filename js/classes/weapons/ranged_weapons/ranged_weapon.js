class RangedWeapon {
    constructor(owner, baseName, baseDamage, baseSpeed, baseRange, baseCapacity, baseTotalAmmo, powerTier, materialTier, effectType) {
        this.owner = owner;
        this.baseName = baseName;
        this.baseSpeed = baseSpeed;
        this.powerTier = powerTier;
        this.materialTier = materialTier;
        this.effectType = effectType;

        const powerMult = WeaponTiers[powerTier];
        const materialMult = MaterialTiers[materialTier];

        this.damage = baseDamage * powerMult.damage;
        this.range = baseRange * powerMult.range;
        this.speed = baseSpeed * powerMult.speed;

        const capacity = Math.round(baseCapacity * materialMult.capacity);
        const totalAmmo = Math.round(baseTotalAmmo * materialMult.capacity);
        this.reloadSpeed = materialMult.reloadSpeed;

        this.name = this.generateWeaponName();

        this.ammo_manager = new AmmoManagement(this.owner, this.name, this.damage, this.speed, capacity, totalAmmo, this.range, this.effectType);
    }

    generateWeaponName() {
        const effectPrefix = this.effectType !== "None" ? `${this.effectType} ` : "";
        return `${effectPrefix}${this.materialTier} ${this.powerTier} ${this.baseName}`;
    }

    fire(direction) {
        if (!timeFrozen) {
            return this.ammo_manager.fire(direction, this.owner);
        }
    }

    reload() {
        this.ammo_manager.reload(this.reloadSpeed);
    }

    handleWeaponInput() {
        if (keyIsDown(82)) {
            this.reload();
        }
    }

    drawInfo(x, y) {
        fill(255);
        textSize(12);
        text(this.name, x, y);
        text(`DMG: ${this.damage.toFixed(1)} | RNG: ${this.range.toFixed(1)}`, x, y + 15);
        text(`Speed: ${this.speed.toFixed(1)} | Ammo: ${this.ammo_manager.current_ammo}/${this.ammo_manager.capacity}`, x, y + 30);
        text(`Effect: ${this.effectType}`, x, y + 45);
        text(`${Effects[this.effectType].description}`, x, y + 60);
    }
}
