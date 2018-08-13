
module.exports = MakeLinks;

var Viva = require('local/third-party/viva-graph-js');


function MakeLinks(layout, graph, graphics, messenger) {
    var mutatorFunc = null;

    messenger.subscribe('link.highlight', highlight);
    messenger.subscribe('link.unhighlight', unhighlight);

    messenger.subscribe('overlays-manager.changed', function (newMode) {
        mutatorFunc = newMode.mutateLink;
    });

    return {
        make: make,
        place: place
    }

    function highlightNodeConnections(node) {
        graph.getLinks(node.id).forEach(highlight);
    }

    function unhighlightNodeConnections(node) {
        graph.getLinks(node.id).forEach(unhighlight);
    }

    function highlight(link) {
        var ui = graphics.getLinkUI(link.id).visiblePath;
        ui.addClass('highlight');
    }

    function unhighlight(link) {
        var ui = graphics.getLinkUI(link.id).visiblePath;
        ui.removeClass('highlight');
    }

    function make(link) {
        var ui = Viva.Graph.svg('g');
        ui.data = link;

        // visible path: this is visible to the user.
        var visiblePath = Viva.Graph.svg('path').addClass('viva-edge');
        if (link.data && link.data.wormhole) {
            visiblePath.addClass('wormhole');
        }
        else {
            visiblePath.addClass('gate');

            var node1 = graph.getNode(link.toId);
            var node2 = graph.getNode(link.fromId);

            if (node1.data.region || node2.data.region) {
                visiblePath.addClass('regional-gate');
            }
            else if (node1.data.system.regionName !== node2.data.system.regionName) {
                visiblePath.addClass('regional-gate');
            }
        }

        //event holder: thicker path to make mouseover/mouseleave/click events easier for user
        // to trigger.
        var eventHolder = Viva.Graph.svg('path')
            .attrs({
                'stroke-width': 8,
                'opacity': 0,
                'stroke': 'white'
            })

        eventHolder.addEventListener('click', handleClick);
        eventHolder.addEventListener('mouseenter', handleMouseenter);
        eventHolder.addEventListener('mouseleave', handleMouseleave);

        ui.visiblePath = visiblePath;
        ui.append(visiblePath);
        ui.append(eventHolder);

        return mutatorFunc ? mutatorFunc(link, ui) : ui;
    }

    function place(linkUi, fromPos, toPos) {
        var data = 'M' + fromPos.x + ',' + fromPos.y +
                   'L' + toPos.x + ',' + toPos.y;

        for (var i = 0; i < linkUi.childNodes.length; i++) {
            var node = linkUi.childNodes[i];
            node.attr('d', data);
        }
    }

    function handleClick(args) {
        var ui = args.currentTarget.parentElement;
        var link = ui.data;

        var messageName = msgPrefix(link) + "mouseclick";
        messenger.fire(messageName, link);
    }

    function handleMouseenter(args) {
        var ui = args.currentTarget.parentElement;
        var link = ui.data;

        var messageName = msgPrefix(link) + "mouseenter";
        messenger.fire(messageName, link);
    }
    function handleMouseleave(args) {
        var ui = args.currentTarget.parentElement;
        var link = ui.data;

        var messageName = msgPrefix(link) + "mouseleave";
        messenger.fire(messageName, link);
    }

    function msgPrefix(link) {
        return link.data && link.data.wormhole ? "link.wormhole." : "link.gate.";
    }
}