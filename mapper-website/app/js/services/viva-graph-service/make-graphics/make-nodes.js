
module.exports = MakeNodes;

var Viva = require('local/third-party/viva-graph-js');

var NodeEditor = require('./node-editor.js');

var SYSTEM_BOX_SIZE = 10;
var REGION_CIRC_RADIUS = 30;

function MakeNodes(layout, graph, graphics, messenger) {
    var mutatorFunc = null;
    
    messenger.subscribe('node.highlight', highlight);
    messenger.subscribe('node.unhighlight', unhighlight);

    messenger.subscribe('overlays-manager.changed', function (newMode) {
        mutatorFunc = newMode.mutateNode;
    });

    return {
        make: make,
        place: place,
        highlight: highlight,
        unhighlight: unhighlight
    }

    function make(node) {
        var ui;
        if (node.data.system) {
            ui = Viva.Graph.svg('g').addClasses(['viva-node', 'system']);
        }
        else if (node.data.region) {
            ui = Viva.Graph.svg('g').addClasses(['viva-node', 'region']);
        }
        ui.data = node;

        var editor = NodeEditor(ui);
        if (node.data.system) {
            editor.setLabel(Viva.Graph.svg('text').text(node.data.system.systemName));
            editor.setIconRect(10, 10);
        }
        else {
            editor.setLabel(Viva.Graph.svg('text').text(node.data.region.name));
            editor.setIconCircle(20);
        }
        editor.saveAsDefault();

        ui.addEventListener('click', handleNodeClick);
        ui.addEventListener('mouseenter', handleNodeMouseenter);
        ui.addEventListener('mouseleave', handleNodeMouseleave);
        return mutatorFunc ? mutatorFunc(node, ui) : ui;
    }

    function place(nodeUi, pos, node) {
        var adj = 0;//nodeUi.centerOffset;

        nodeUi.attr('transform',
                    'translate(' + (pos.x - adj) + ',' + (pos.y - adj) + ')');
    }

    function highlight(node) {
        var ui = graphics.getNodeUI(node.id);
        ui.addClass('highlight');
    }

    function unhighlight(node) {
        var ui = graphics.getNodeUI(node.id);
        ui.removeClass('highlight');
    }

    function handleNodeClick(args) {
        var nodeUi = args.currentTarget;
        var node = nodeUi.data;

        var messageName = msgPrefix(node) + "click";
        messenger.fire(messageName, [node]);
    }

    function handleNodeMouseenter(args) {
        var nodeUi = args.currentTarget;
        var node = nodeUi.data;

        var messageName = msgPrefix(node) + "mouseenter";
        messenger.fire(messageName, node);
    }
    function handleNodeMouseleave(args) {
        var nodeUi = args.currentTarget;
        var node = nodeUi.data;

        var messageName = msgPrefix(node) + "mouseleave";
        messenger.fire(messageName, node);
    }
}

function msgPrefix(node) {
    return node.data.system ? "node.system." : "node.region.";
}


function defaultIcon(node) {
    var node = this.data; // this assumed to be a nodeUi;
    if (node.data.system) {
        return Viva.Graph.svg('rect')
            .attr('x', -SYSTEM_BOX_SIZE / 2)
            .attr('y', -SYSTEM_BOX_SIZE / 2)
            .attr('width', SYSTEM_BOX_SIZE)
            .attr('height', SYSTEM_BOX_SIZE)
    }
    else {
        return Viva.Graph.svg('circle')
            .attr('r', REGION_CIRC_RADIUS);
    }
}

function defaultLabel() {
    var node = this.data; // this assumed to be a nodeUi;
    if (node.data.system) {
        return Viva.Graph.svg('text').text(node.data.system.systemName);
    }
    else {
        return Viva.Graph.svg('text').text(node.data.region.name);
    }
}