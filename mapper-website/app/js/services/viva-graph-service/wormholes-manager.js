
module.exports = WormholesManager;


function WormholesManager(graph,renderer,regionController, messenger) {

    messenger.subscribe('wormholes-manager.add-wormholes', addWormholes);
    messenger.subscribe('wormholes-manager.remove-wormholes', removeWormholes);

    var me = {
        addWormholes: addWormholes,
        removeWormholes: removeWormholes
    }

    return me;

    function addWormholes(wormholes) {
        for (var i = 0; i < wormholes.length; i++) {
            var wrm = wormholes[i];
            var startId = wrm.getStartSystem().id,
                endId = wrm.getEndSystem().id;

            //for case where regions have been collapsed
            var id1 = regionController.getNodeIdForSystemId(startId),
                id2 = regionController.getNodeIdForSystemId(endId);

            if (graph.getNode(id1) && graph.getNode(id2)) {
                var data = {
                    initialFrom: startId,
                    initialTo: endId,
                    wormhole: wrm
                }
                regionController.trackLink(startId, endId, data);
                var link = graph.addLink(id1, id2, data);
            }
        }
        renderer.rerender();
    }
    function removeWormholes() {
        var toRemove = [];
        graph.forEachLink(function (link) {
            if (link.data && link.data.wormhole)
                toRemove.push(link);
        });
        toRemove.forEach(function (link) {
            var initialFrom = link.data.initialFrom;
            var initialTo = link.data.initialTo;

            regionController.untrackLink(initialFrom, initialTo, link.data)
            graph.removeLink(link);
        });
        renderer.rerender();
    }

}