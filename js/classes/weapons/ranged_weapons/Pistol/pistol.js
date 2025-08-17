class Pistol extends RangedWeapon {
    constructor(owner, options = {}) {
        const {
            baseDamage = 10,
            baseSpeed = 3,
            baseReload = 60,
            baseRange = 200,
            baseCapacity = 12,
            baseTotalAmmo = 40,
            fireMode = 'semi',
            fireRate = 40,
            burstCount = 3,
        } = options;

        let baseName = 'Pistol';
        switch (fireMode) {
            case 'semi':  baseName = 'Pistol' ; break;
            case 'auto':  baseName = 'Auto Pistol'; break;
            case 'burst': baseName = 'Burst Pistol'; break;
            case 'dual':  baseName = 'Dual Pistol'; break;
        }

        super(
            owner,
            'pistol',
            baseName,
            baseDamage,
            baseSpeed,
            baseReload,
            baseRange,
            baseCapacity,
            baseTotalAmmo,
            options.powerTier || 'Crude',
            options.materialTier || 'Bone',
            options.effectType || 'None'
        );

        this.fireMode = fireMode;
        this.cooldown = 0;
        this.fireRate = fireRate;
        this.burstCount = burstCount;
        this.fireFlag = true;

        if (this.fireMode === 'semi') this.baseDamage *= 1.3;
        if (this.fireMode === 'dual') this.baseDamage *= 0.9;
    }

    shoot() {
        if (this.cooldown > 0) return;

        switch (this.fireMode) {
            case 'semi':
                if (this.fireFlag) {
                    this.fire(player_direction);
                    this.fireFlag = false;
                }
                break;

            case 'auto':
                this.fire(player_direction);
                break;

            case 'burst':
              if (this.fireFlag) {
                  const shotDir = player_direction;
                  const self = this;
                  for (let i = 0; i < this.burstCount; i++) {
                      setTimeout(() => self.fire(shotDir), i * 50); 
                  }
                  this.fireFlag = false; 
              }
              break;

            case 'dual':
                if (this.fireFlag) {
                    const shotDirection = player_direction;
                    this.fire(shotDirection);
                    setTimeout(() => this.fire(shotDirection), 50); 
                    this.fireFlag = false;
                }
                break;
        }

        this.cooldown = this.fireRate;
    }

    handleWeaponInput() {
        super.handleWeaponInput();
        const dir = this.getInputDirection();
        if (dir) {
            player_direction = dir;
            this.shoot();
            player_shooting = true;
        } else {
            this.fireFlag = true;
            player_shooting = false;
        }

        if (this.cooldown > 0) this.cooldown--;
    }
}
