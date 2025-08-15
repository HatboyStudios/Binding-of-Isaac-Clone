const WeaponTiers = {
    Crude:     { damage: 1.0, range: 1.0, speed: 1.0 },
    Tempered:  { damage: 1.1, range: 1.05, speed: 1.05 },
    Cursed:    { damage: 1.25, range: 1.1, speed: 1.1 },
    Withered:  { damage: 1.4, range: 1.15, speed: 1.1 },
    Forsaken:  { damage: 1.6, range: 1.2, speed: 1.15 },
    Eldritch:  { damage: 2.0, range: 1.25, speed: 1.2 }
};

const MaterialTiers = {
    Bone:       { capacity: 1.0, reloadSpeed: 1.0 },
    Ribcage:    { capacity: 1.1, reloadSpeed: 0.95 },
    Femur:      { capacity: 1.2, reloadSpeed: 0.9 },
    Tendon:     { capacity: 1.3, reloadSpeed: 0.85 },
    Heart:      { capacity: 1.4, reloadSpeed: 0.8 }
};

const Effects = {
    None: {
        apply: () => {},
        chance: 0,
        description: "No magical effect."
    },
    Pestilent: {
        apply: (target) => target.applyDot(3, 120),
        chance: 0.4,
        description: "Poisons foes, dealing damage slowly."
    },
    Wither: {
        apply: (target) => target.applyDot(6, 60),
        chance: 0.3,
        description: "Rots flesh with corrosive decay."
    },
    Frigid: {
        apply: (target) => target.applySlow(0.5, 90),
        chance: 0.25,
        description: "Freezes movement, chilling to the bone."
    },
    Shiver: {
        apply: (target) => target.applyStun(30),
        chance: 0.2,
        description: "Paralyzes with icy dread."
    },
    Bane: {
        apply: (target) => target.reduceArmor(20, 180),
        chance: 0.25,
        description: "Curses armor, leaving foes vulnerable."
    },
    Isaac: {
        apply: (target) => {
            if (Math.random() < 0.5) {
                target.applyDot(4, 80); 
            } else {
                target.applyConfusion(60); 
            }
        },
        chance: 0.3,
        description: "Unleashes cursed tears, confusing and damaging foes."
    }
};

function getRandomKey(obj) {
  const keys = Object.keys(obj);
  return keys[Math.floor(Math.random() * keys.length)];
}

function getRandomEffect() {
  const effectKeys = Object.keys(Effects);
  let selected = "None";
  let highestChance = 0;
  for (const key of effectKeys) {
    if (Math.random() < Effects[key].chance && Effects[key].chance > highestChance) {
      selected = key;
      highestChance = Effects[key].chance;
    }
  }
  return selected;
}

