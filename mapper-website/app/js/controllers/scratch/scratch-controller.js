
//var Viva = require('local/third-party/viva-graph-js');


//var pixi = require('local/third-party/pixi');

//var sysRep = require('local/repositories/system'); 


module.exports = function ($scope, $state) {

    var elm = document.querySelector('#container');
    var h = elm.clientHeight;
    var w = elm.clientWidth;

    var renderer = PIXI.autoDetectRenderer(w, h, {
        transparent: true,
        view: elm
    });

    sysRep.initialize().done(function () {
        main();
    });

};

function main() {
    // First we setup PIXI for rendering:
    var stage = new PIXI.Stage(0xFFFFFF, true);
    stage.interactive = true;
    var width = window.innerWidth,
        height = window.innerHeight;
    var renderer = PIXI.autoDetectRenderer(width, height, {
        view: document.getElementById('container')
    });
    var graphics = new PIXI.Graphics();
    graphics.position.x = width / 2;
    graphics.position.y = height / 2;
    graphics.scale.x = 0.2;
    graphics.scale.y = 0.2;
    stage.addChild(graphics);


    var graph = Viva.Graph.graph();

    var layout = Viva.Graph.Layout.forceDirected(graph, {
        springLength: 30,
        springCoeff: 0.0008,
        gravity: -1.2,
        theta: 0.8,
        dragCoeff: 0.02,
        timeStep: 20
    });

    //var graphics = makeSvgGraphics(layout, graph, messenger);

    //var renderer = Viva.Graph.View.renderer(graph, {
    //    layout: layout,
    //    graphics: graphics,
    //    container: element,
    //    zoomSpeed: 4
    //});

    var systems = sysRep.getSystems();
    addNodes(graph, systems);
    addGateEdges(graph, systems);



    // Store node and link positions into arrays for quicker access within
    // animation loop:
    var nodePositions = [],
        linkPositions = [];
    graph.forEachNode(function (node) {
        nodePositions.push(layout.getNodePosition(node.id));
    });
    graph.forEachLink(function (link) {
        linkPositions.push(layout.getLinkPosition(link.id));
    });
    // Finally launch animation loop:
    requestAnimationFrame(animate);
    function animate() {
        layout.step();
        drawGraph(graphics, nodePositions, linkPositions);
        renderer.render(stage);
        requestAnimationFrame(animate);
    }
    function drawGraph(graphics, nodePositions, linkPositions) {
        // No magic at all: Iterate over positions array and render nodes/links
        graphics.clear();
        graphics.beginFill(0xFF3300);
        var i, x, y, x1, y1;
        graphics.lineStyle(1, 0xcccccc, 1);
        for (i = 0; i < linkPositions.length; ++i) {
            var link = linkPositions[i];
            graphics.moveTo(link.from.x, link.from.y);
            graphics.lineTo(link.to.x, link.to.y);
        }
        graphics.lineStyle(0);
        for (i = 0; i < nodePositions.length; ++i) {
            x = nodePositions[i].x - 5;
            y = nodePositions[i].y - 5;
            graphics.drawRect(x, y, 10, 10);
        }
    }
}




function addNodes(graph, relevantSystems) {

    var nodePartitions = {};

    Object.keys(relevantSystems).forEach(function (sysId) {
        var sys = relevantSystems[sysId];

        var data = {
            system: sys
        }

        var node = graph.addNode(sys.id, data);
    });
    return nodePartitions;
}

function addGateEdges(graph, relevantSystems) {
    Object.keys(relevantSystems).forEach(function (sysId) {
        var sys = relevantSystems[sysId];

        var connected = sys.getGates();
        for (j = 0; j < connected.length; j++) {
            var conSys = connected[j];
            if (!relevantSystems[conSys.id]) continue;
            if (sys.id < conSys.id) {
                var data = {
                    gate: true,
                    from: sys.id,
                    to: conSys.id
                }
                graph.addLink(sys.id, conSys.id);
            }
        }
    });
}