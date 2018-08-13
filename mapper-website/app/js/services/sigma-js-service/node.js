
module.exports = Node;

function Node(system) {
    this.system = system;

    this.id = system.id + '';
    this.x = this.system.xpos;
    this.y = -this.system.zpos;
    if (this.system.isWormholeSpace()) {
        this.y -= 1000;
        this.x -= 650
    }        
    else if (this.system.getGates().length === 0) { //hide jove space
        this.hide = true;
    }

    this.label = system.systemName;

    if (this.system.isHighsec()) {
        this.color = '#00be39';
    }
    if (this.system.isLowsec()) {
        this.color = '#b95f00';
    }
    if (this.system.isNullsec()) {
        this.color = '#be0000';
    }
    if (this.system.isWormholeSpace()) {
        this.color = '#428bca';
    }

    this.size = 1;
}