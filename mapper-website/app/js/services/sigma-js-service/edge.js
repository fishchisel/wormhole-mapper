
module.exports = Edge;


function Edge(sys1, sys2, type) {
    if (!type) type = 'g';
    var direction = sys1.id < sys2.id;

    this.sys1 = direction ? sys1 : sys2;
    this.sys2 = direction ? sys2 : sys1;

    this.id = this.sys1.id + '_' + this.sys2.id + '_' + type;
    this.source = this.sys1.id + '';
    this.target = this.sys2.id + '';
}