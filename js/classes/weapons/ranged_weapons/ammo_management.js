class AmmoManagement {
    constructor(capacity, total_ammo) {
        this.capacity = capacity;
        this.current_ammo = capacity;
        this.total_ammo = total_ammo;
    }

    reload() {
        const max_bullets = this.capacity - this.current_ammo;
        const reload_bullets = Math.min(max_bullets, this.total_ammo);
        this.current_ammo += reload_bullets;
        this.total_ammo -= reload_bullets;
        console.log(`Reloaded. Current magazine: ${this.current_ammo}/${this.capacity}, Total ammo: ${this.total_ammo}`);
    }

    fire() {
        if (this.current_ammo > 0) {
            this.current_ammo--;
            console.log(`${this.current_ammo}/${this.capacity}`);
            return true; 
        } else {
            console.log('Click! Magazine is empty.');
            return false;
        }
    }

    isEmpty() {
        return this.current_ammo <= 0;
    }
}