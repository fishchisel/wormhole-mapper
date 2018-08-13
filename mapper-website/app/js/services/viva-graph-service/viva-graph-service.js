module.exports = VivaGraphService;

var sysRep = require('local/repositories/system'),
    scannedSysRep = require('local/repositories/scanned-system');

var Viva = require('local/third-party/viva-graph-js');

var makeSvgGraphics = require('./make-graphics'),
    partitionSystems = require('./partition-systems.js'),
    RegionController = require('./region-controller.js'),
    Messenger = require('./messenger.js'),
    InteractionManager = require('./interaction-manager.js'),
    WormholesManager = require('./wormholes-manager.js'),
    PositionsManager = require('./positions-manager.js'),
    OverlaysManager = require('./overlays-manager');


function VivaGraphService(element) {

    var messenger = Messenger({ debug: false });

    // initialize Viva Maps
    var initData = initialize(element, messenger),
        graph = initData.graph,
        layout = initData.layout,
        graphics = initData.graphics,
        renderer = initData.renderer,
        autoLayoutRunning = false;

    // find systems for map, and partition them into regions
    var relevantSystems = getRelevantSystems(),
        res = partitionSystems(relevantSystems);
    
    // initialize various controllers/managers/whatevers to handle funtionality.
    var regionController = RegionController(graph, layout, renderer, messenger),
        overlaysManager = OverlaysManager(graph, graphics, messenger),
        interactionManager = InteractionManager(graph, messenger),
        wormholesManager = WormholesManager(graph, renderer, regionController, messenger),
        positionsManager = PositionsManager(graph, layout, renderer, regionController, messenger);

    
    //messenger.fire('overlays-manager.add-overlays', ['securityStatus','importantSystems']);
    messenger.fire('overlays-manager.add-overlays', ['securityStatus','starredSystems','homeSystem']);

    // add all the nodes, regions,and gates to the map
    var nodePartitions = addNodes(graph, relevantSystems, res.lookup);
    addGateEdges(graph, relevantSystems,regionController);
    addRegions(nodePartitions,regionController);

    var me = {
        run: function () {
            renderer.run();
            me.panToHome();
            autoLayoutRunning = true;
        },
        resetPositions: function () { messenger.fire('positions-manager.reset-positions') },
        savePositions: function () { messenger.fire('positions-manager.save-positions') },
        loadPositions: function () { messenger.fire('positions-manager.load-positions') },
        panToHome: function () {
            var homePosition = layout.getNodePosition(siteConfig.homeSystemId);
            renderer.moveTo(homePosition.x, homePosition.y);
        },
        toggleAutoLayout: function () {
            if (autoLayoutRunning) renderer.pause();
            else renderer.resume();
            autoLayoutRunning = !autoLayoutRunning;
        },
        addWormholes: function (wormholes) {
            messenger.fire('wormholes-manager.add-wormholes', wormholes);
        },
        removeWormholes: function () {
            messenger.fire('wormholes-manager.remove-wormholes');
        }
    }

    me.loadPositions();
    return me;
        
}

function addNodes(graph, relevantSystems, partitionLookup) {
    
    var nodePartitions = {};

    Object.keys(relevantSystems).forEach(function (sysId) {
        var sys = relevantSystems[sysId];

        var data = {
            system: sys,
            special: isSpecialSystem(sys)
        }

        var node = graph.addNode(sys.id, data);

        var partitionName = partitionLookup[sysId];
        if (!partitionName.startsWith('Fragment')) {
            if (!nodePartitions[partitionName]) nodePartitions[partitionName] = [];
            nodePartitions[partitionName].push(node);
        }
    });
    return nodePartitions;
}

function addGateEdges(graph, relevantSystems, regionController) {
    Object.keys(relevantSystems).forEach(function(sysId) {
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

                var link = graph.addLink(sys.id, conSys.id, data);
                regionController.trackLink(sys.id,conSys.id,data);
            }
        }
    });
}

function addRegions(nodePartitions, regionController) {
    Object.keys(nodePartitions).forEach(function (partitionName) {
        var nodes = nodePartitions[partitionName];
        var niceName = partitionName.split('#')[0].trim();
        regionController.addRegion(partitionName, { name: niceName });

        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            regionController.addNodeToRegion(node, partitionName);
        }
    });
}

function getRelevantSystems() {

    var systems = sysRep.getSystemsArray();
    var returnVal = {};
    for (var i = 0, l = systems.length; i < l; i++) {
        var sys = systems[i];
        if (isRelevantSystem(sys)) returnVal[sys.id] = sys;
    }
    return returnVal;
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

function isSpecialSystem(sys) {
    sys = scannedSysRep.getSystem(sys.id);
    return (sys.id === siteConfig.homeSystemId || sys.isStarred);
}

function initialize(element, messenger) {
    var graph = Viva.Graph.graph();

    var layout = Viva.Graph.Layout.forceDirected(graph, {
        springLength: 30,
        springCoeff: 0.0008,
        gravity: -1.2,
        theta: 0.8,
        dragCoeff: 0.02,
        timeStep: 20
    });

    var graphics = makeSvgGraphics(layout, graph, messenger);

    var renderer = Viva.Graph.View.renderer(graph, {
        layout: layout,
        graphics: graphics,
        container: element,
        zoomSpeed: 4
    });

    return { graph: graph, layout: layout, graphics: graphics, renderer: renderer }
}
