class Rifle extends RangedWeapon {
    constructor(owner, options = {}) {
        const {
            baseDamage = 15,
            baseSpeed = 2,
            baseReload = 60,
            baseRange = 300,
            baseCapacity = 30,
            baseTotalAmmo = 90,
            fireModes = ['semi'],
            fireRate = 10,
            burstCount = 3
        } = options;

        const twoLimitModes = fireModes.slice(0, 2).map(fm => fm.toLowerCase());

        const baseName = twoLimitModes
            .map(fm => fm.split(' ').map(w => w[0].toUpperCase() + w.slice(1)).join(' '))
            .join(' ') + ' Rifle';

        super(
            owner,
            'rifle',
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

        this.fireModes = twoLimitModes;
        this.cooldown = 0;
        this.fireRate = fireRate;
        this.burstCount = burstCount;

        this.hasSemi = this.fireModes.includes('semi');
        this.fireFlags = {};
        this.fireModes.forEach(mode => {
            if (!['auto', 'burst'].includes(mode)) this.fireFlags[mode] = true;
        });
    }

    static createPelletMode(name, pelletCount, spread, shots = 1, delay = 0) {
        return {
            bullets: shots,
            behavior: (weapon, dir) => {
                if (!weapon.hasSemi || weapon.fireFlags[name]) {
                    for (let s = 0; s < shots; s++) {
                        setTimeout(() => weapon.ammo_manager.pelletsHandler(pelletCount, spread, dir), s * delay);
                    }
                    if (weapon.hasSemi) weapon.fireFlags[name] = false;
                }
            }
        };
    }

    static Modes = {
        'semi': { bullets: 1, behavior: (weapon, dir) => weapon.fire(dir) },
        'auto': { bullets: 1, behavior: (weapon, dir) => weapon.fire(dir) },
        'dual': { bullets: 2, behavior: (weapon, dir, passedBehavior) => {
            for (let i = 0; i < 2; i++) {
                setTimeout(() => passedBehavior(weapon, dir), i * 50);
            }
        }},
        'buck': Rifle.createPelletMode('buck', 5, 0.25, 1),
        'doublebarrel': Rifle.createPelletMode('doublebarrel', 2, 0.2, 2),
    };

    shoot() {
        if (this.cooldown > 0 || this.ammo_manager.current_ammo <= 0) return;
        const dir = player_direction;
        if (!dir) return;

        const currentModes = this.fireModes
            .map(mode => Rifle.Modes[mode])
            .filter(Boolean);

        if (currentModes.length === 0) return;

        const modesBehavior = currentModes.find(b => b !== Rifle.Modes['dual']) || currentModes[0];
        const behavior = modesBehavior.behavior;

        const firedModes = new Set();
        currentModes.forEach(mode => {
            if (mode === Rifle.Modes['dual']) {
                mode.behavior(this, dir, behavior);
                firedModes.add(modesBehavior);
            } else if (!firedModes.has(mode)) {
                mode.behavior(this, dir);
            }
        });

        const maxBullets = currentModes.reduce((max, b) => Math.max(max, b.bullets), 0);
        this.ammo_manager.current_ammo = Math.max(0, this.ammo_manager.current_ammo - maxBullets);

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
            if (this.hasSemi) {
                for (const mode in this.fireFlags) {
                    this.fireFlags[mode] = true;
                }
            }
            player_shooting = false;
        }

        if (this.cooldown > 0) this.cooldown--;
    }
}
