module.exports = SigmaJsService;

var Node = require('./node.js'),
    Edge = require('./edge.js');

function SigmaJsService(element) {
    this.element = element;
    this.nodes = [];
    this.edges = [];

    this.sigma = initialize(element);
}

SigmaJsService.prototype.createData = function (systems, wormholes) {
    var a = createNodesAndGateEdges(systems);
    var b = createWormholeEdges(wormholes);
    this.nodes = a.nodes;
    this.edges = a.edges.concat(b);
    this.sigma.graph.clear();


    this.sigma.graph.read({ nodes: this.nodes, edges: this.edges });
}
SigmaJsService.prototype.render = function () {

    this.sigma.refresh();

    console.log(this.sigma.graph.nodes()[0]);
}


function initialize(element) {
    var sigma = require('local/third-party/sigma');
    var sigmaSettings = require('./sigma-settings.js');

    var s = new sigma({
        renderers: [
          {
              container: element,
              type: 'webgl'
          }
        ],
        settings: sigmaSettings
    });

    return s;
}

function createNodesAndGateEdges(systems) {
    var nodes = [],
        edges = [];
    if (!systems) systems = [];

    for (var i = 0, l = systems.length; i < l; i++) {
        var system = systems[i];

        nodes.push(new Node(system));
        
        system.getGates().forEach(function (conSys) {
            if (system.id < conSys.id) edges.push(new Edge(system, conSys));
        });
    }

    return {
        nodes: nodes,
        edges: edges
    }
}

function createWormholeEdges(wormholes) {
    if (!wormholes) wormholes = [];

    // careful to ensure uniqueness of ids - wormholes map have duplicates.
    var edges = {};
    for (var i = 0; i < wormholes.length; i++) {
        var wrm = wormholes[i];
        var edge = new Edge(wrm.getStartSystem(), wrm.getEndSystem(), 'w');
        edges[edge.id] = edge;
    }
    return Object.keys(edges).map(function (x) { return edges[x]; });
}

function includeNode(node, exclusions) {
    return true;
}