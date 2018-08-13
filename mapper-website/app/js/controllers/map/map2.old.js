var sysRep = require('local/repositories/system'),
    scannedSysRep = require('local/repositories/scanned-system'),
    wrmRep = require('local/repositories/wormhole'),
    pathfinder = require('local/pathfinder');

//var vivaMap = require('../../services/viva-map-js-service.js');

var Viva = require('local/third-party/viva-graph-js');

var q = require('q'),
    store = require('store');

var modifierKeyIsDown = false;

module.exports = function ($scope, $state) {

    var rendererData = {


    };

    $scope.setBodyClass('hide-background-image');
    
    q.all([
        sysRep.initialize(),
        wrmRep.initialize(),
        scannedSysRep.initialize(),
    ]).done(function () {
        rendererData = render();
        $scope.safeApply(function () {
            $scope.hasInitialized = true;
        });
    });

    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('keyup', keyUpHandler);

    function keyDownHandler(e) {
        if (e.which === 16) { // shift key
            modifierKeyIsDown = true;
        }
    }
    function keyUpHandler(e) {
        if (e.which === 16) { 
            modifierKeyIsDown = false;
        }
    }

    $scope.isAutolaying = function () {
        return rendererData.isLayingOut;
    }

    $scope.toggleAutolayout = function () {
        if (rendererData && rendererData.renderer) {
            if (!rendererData.isLayingOut) rendererData.renderer.resume();
            if (rendererData.isLayingOut) rendererData.renderer.pause();
            rendererData.isLayingOut = !rendererData.isLayingOut;
        }
    }

    $scope.savePositions = function () {
        savePositions(rendererData.graph, rendererData.layout);
    }
    $scope.loadPositions = function () {
        loadPositions(rendererData.graph, rendererData.layout,rendererData.renderer);
    }
    $scope.resetPositions = function () {
        resetPositions(rendererData.graph, rendererData.layout, rendererData.renderer);
    }

    $scope.toggleWormholes = function () {
        if (rendererData.hasWormholes) {
            removeWormholes(rendererData.graph, rendererData.renderer);
        }
        else {
            addWormholes(rendererData.graph, rendererData.renderer);
        }
        rendererData.hasWormholes = !rendererData.hasWormholes;
    }
    $scope.hasWormholes = function () { return rendererData.hasWormholes; };

    $scope.$on('$destroy', function () {
        $scope.setBodyClass(null);

        document.removeEventListener('keydown', keyDownHandler);
        document.removeEventListener('keyup', keyUpHandler);
    });
};

function render() {

    var sysObj = sysRep.getSystems();
    var systems = sysRep.getSystemsArray();

    //var graphics = Viva.Graph.View.webglGraphics();

    var graph = Viva.Graph.graph();

    //var layout = Viva.Graph.Layout.constant(graph);
    var layout = Viva.Graph.Layout.forceDirected(graph, {
        springLength: 30,
        springCoeff: 0.0008,
        gravity: -1.2,
        //gravity: -10,
        theta: 0.8,
        dragCoeff: 0.02,
        timeStep: 20
    });

    var graphics = makeSvgGraphics(layout);


    var renderer = Viva.Graph.View.renderer(graph, {
        layout: layout, // use our custom 'constant' layout
        graphics: graphics,
        container: document.getElementById('map-container'),
        zoomSpeed: 4
    });

    // Add nodes
    var regions = {};
    for (i = 0; i < systems.length; ++i) {
        var sys = systems[i];
        sys = scannedSysRep.getSystem(sys.id);
        if (!isRelevantSystem(sys)) continue;

        var data = { system: sys };
        if (sys.id === siteConfig.homeSystemId || sys.isStarred) {
            data.special = true;
        }
        var node = graph.addNode(sys.id, data);
        
        if (sys.isLowsec()) {
            if (!regions[sys.regionName]) regions[sys.regionName] = [];
            regions[sys.regionName].push(node);
        }
    }
    // add edges
    for (i = 0; i < systems.length; ++i) {
        var sys = systems[i];
        if (!isRelevantSystem(sys)) continue;

        var connected = sys.getGates();
        for (j = 0; j < connected.length; j++) {
            var conSys = connected[j];
            if (!isRelevantSystem(conSys)) continue;
            if (sys.id < conSys.id)
                graph.addLink(sys.id, conSys.id);

        }
    }

    for (regionName in regions) {
        var nodes = regions[regionName];
        graph.addLabel(regionName, { nodes: nodes });
    }

    loadPositions(graph,layout,renderer);
    
    renderer.run();
    renderer.pause();

    var homePosition = layout.getNodePosition(siteConfig.homeSystemId);
    renderer.moveTo(homePosition.x, homePosition.y);

    var graphRect = layout.getGraphRect();
    var graphSize = Math.min(graphRect.x2 - graphRect.x1, graphRect.y2 - graphRect.y1);
    var screenSize = Math.min(document.body.clientWidth, document.body.clientHeight);

    var desiredScale = (screenSize / graphSize) * 1.5;
    //zoomOut(desiredScale, 1);

    function zoomOut(desiredScale, currentScale) {
        // zoom API in vivagraph 0.5.x is silly. There is no way to pass transform
        // directly. Maybe it will be fixed in future, for now this is the best I could do:
        if (desiredScale < currentScale) {
            currentScale = renderer.zoomOut();
            setTimeout(function () {
                zoomOut(desiredScale, currentScale);
            }, 16);
        }
    }

    return {
        renderer: renderer,
        isLayingOut: false,
        graph: graph,
        layout: layout,
        hasWormholes: false
    }
}

function addWormholes(graph, renderer) {
    var wormholes = wrmRep.getArray();
    for (var i = 0; i < wormholes.length; i++) {
        var wrm = wormholes[i];
        if (isRelevantSystem(wrm.getStartSystem()) && isRelevantSystem(wrm.getEndSystem())) {
            var data = { wormhole: wrm }

            graph.addLink(wrm.getStartSystem().id, wrm.getEndSystem().id, data);
        }
    }
    renderer.rerender();
}
function removeWormholes(graph, renderer) {
    var toRemove = [];
    graph.forEachLink(function (link) {
        if (link.data && link.data.wormhole)
            toRemove.push(link);
    });
    toRemove.forEach(function (x) {
        graph.removeLink(x);
    });
    renderer.rerender();
}

function resetPositions(graph, layout,renderer) {
    graph.forEachNode(function (node) {
        var position = layout.getNodePosition(node.id);
        var sys = node.data.system;
        position.x = sys.xpos * 100;
        position.y = -sys.zpos * 100;
    });
    renderer.rerender();
}

function savePositions(graph, layout) {
    var data = {};
    graph.forEachNode(function (node) {
        var position = layout.getNodePosition(node.id);
        data[node.id] = { x: position.x, y: position.y };
    });
    store.set('vivaGraphLocations', data);
}

function loadPositions(graph, layout, renderer) {
    var data = store.get('vivaGraphLocations');
    if (data) {
        Object.keys(data).forEach(function (key) {
            var position = layout.getNodePosition(key);
            var savedPosition = data[key];
            position.x = savedPosition.x;
            position.y = savedPosition.y;
        });
        renderer.rerender();
    }
    else {
        resetPositions(graph, layout,renderer);
    }
}

function isRelevantSystem(sys) {
    if (sys.isWormholeSpace()) return false;
    if (sys.isNullsec()) {
        if (!connectedToLow(sys)) return false;
    }
    if (sys.isHighsec()) {
        //if (!connectedToLow(sys)) return false;
        return false;
    }
    return true;
}
function connectedToLow(sys) {
    return sys.getGates().some(function (x) {
        return x.isLowsec();
    })
}

function makeSvgGraphics(layout) {
    var g = Viva.Graph.View.svgGraphics();

    g.node(function (node) {
        try {
            var ui = Viva.Graph.svg('g');
            ui = makeNodeGraphics(ui,node);

            ui.addEventListener('click', function () {
                node.data.pinned = !node.data.pinned;
                layout.pinNode(node, node.data.pinned);

                if (modifierKeyIsDown) {
                    node.data.special = !node.data.special;
                }
                makeNodeGraphics(ui, node);
            });
            return ui;

        } catch (e) { console.log(e) };
    }).placeNode(function(nodeUI, pos) {
        // 'g' element doesn't have convenient (x,y) attributes, instead
        // we have to deal with transforms: http://www.w3.org/TR/SVG/coords.html#SVGGlobalTransformAttribute

        var sizeX = nodeUI.attr('nodeSizeX');
        var sizeY = nodeUI.attr('nodeSizeY');

        nodeUI.attr('transform',
                    'translate(' +
                          (pos.x - sizeX/2) + ',' + (pos.y - sizeY/2) +
                    ')');
    })

    //place links
    g.link(function (link) {
        if (link.data && link.data.wormhole) {
            return Viva.Graph.svg('path')
               .attr('stroke', '#9400D3')
               .attr('stroke-dasharray', '5, 5');
        }
        else {
            return Viva.Graph.svg('path')
               .attr('stroke', '#DDDDDD');
        }
    }).placeLink(function (linkUI, fromPos, toPos) {
        // linkUI - is the object returend from link() callback above.
        var data = 'M' + fromPos.x + ',' + fromPos.y +
                   'L' + toPos.x + ',' + toPos.y;
        // 'Path data' (http://www.w3.org/TR/SVG/paths.html#DAttribute )
        // is a common way of rendering paths in SVG:
        linkUI.attr("d", data);
    });


    g.placeLabel(function (labelUi, pos,label) {
        var nodes = label.data.nodes;

        var totalX = 0, totalY = 0;
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            var pos = layout.getNodePosition(node.id);
            totalX += pos.x;
            totalY += pos.y;
        }
        var x = totalX / nodes.length;
        var y = totalY / nodes.length;

        labelUi.attr('x', x - 20);
        labelUi.attr('y', y);
    });


    return g;
}

function makeNodeGraphics(ui, node) {
    while (ui.lastChild) {
        ui.removeChild(ui.lastChild);
    }
    if (node.data.special)
        return makeSpecialNode(ui, node);
    else
        return makeRegularNode(ui,node);
}

function makeRegularNode(ui, node) {
    var system = node.data.system;

    var size = 10;
    var nodeColor = '#ffffff';
    if (system.isHighsec()) nodeColor = '#00be39';
    if (system.isLowsec()) nodeColor = '#b95f00';
    if (system.isNullsec()) nodeColor = '#be0000';

    var svgText = Viva.Graph.svg('text')
        .attr('x', size + 2 + 'px')
        .attr('y', (size) + 'px')
        .attr('font-size', '80%')
        .attr('fill', '#ffffff')
        .text(system.systemName);

    var rect = Viva.Graph.svg('rect')
        .attr('width', size)
        .attr('height', size)
        .attr('fill', nodeColor);

    ui.attr('nodeSizeX', size);
    ui.attr('nodeSizeY', size);
    ui.attr('special', false);
    ui.append(svgText)
    ui.append(rect)

    if (node.data.pinned) {
        var x = 3 * size / 8;
        var y = 3 * size / 8;
        var width = size/4;
        var height = size/4;
        var rect2 = Viva.Graph.svg('rect')
            .attr('x', x)
            .attr('y', y)
            .attr('width', width)
            .attr('height', height)
            .attr('fill', 'black')
        ui.append(rect2);
    }

    return ui;
}

function makeSpecialNode(ui,node) {
    var system = node.data.system;

    var size = 20;
    var nodeColor = '#ffffff';
    if (system.isHighsec()) nodeColor = '#00be39';
    if (system.isLowsec()) nodeColor = '#b95f00';
    if (system.isNullsec()) nodeColor = '#be0000';

    var svgText = Viva.Graph.svg('text')
        .attr('x', size + 2 + 'px')
        .attr('y', (size) + 'px')
        .attr('font-size','150%')
        .attr('fill', '#ffffff')
        .text(system.systemName);

    var rect = Viva.Graph.svg('rect')
        .attr('width', size)
        .attr('height', size)
        .attr('fill', nodeColor);

    ui.attr('nodeSizeX', size);
    ui.attr('nodeSizeY', size);
    ui.attr('special', false);
    ui.append(svgText)
    ui.append(rect)

    if (node.data.pinned) {
        var x = 3 * size / 8;
        var y = 3 * size / 8;
        var width = size / 4;
        var height = size / 4;
        var rect2 = Viva.Graph.svg('rect')
            .attr('x', x)
            .attr('y', y)
            .attr('width', width)
            .attr('height', height)
            .attr('fill', 'black')
        ui.append(rect2);
    }

    return ui;
}