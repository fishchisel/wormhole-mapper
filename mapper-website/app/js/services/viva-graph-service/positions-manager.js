var store = require('store');

module.exports = PositionsManager;

function PositionsManager(graph, layout, renderer, regionController, messenger) {

    messenger.subscribe('positions-manager.save-positions', savePositions);
    messenger.subscribe('positions-manager.reset-positions', resetPositions);
    messenger.subscribe('positions-manager.load-positions', loadPositions);

    return {
        resetPositions: resetPositions,
        savePositions: savePositions,
        loadPositions: loadPositions
    }

    function resetPositions() {
        regionController.expandAllRegions();
        graph.forEachNode(function (node) {
            var position = layout.getNodePosition(node.id);
            var sys = node.data.system;
            position.x = sys.xpos * 100;
            position.y = -sys.zpos * 100;
        });
        renderer.rerender();
    }

    function savePositions() {
        var data = {};
        graph.forEachNode(function (node) {
            var position = layout.getNodePosition(node.id);
            data[node.id] = { x: position.x, y: position.y };
        });
        store.set('vivaGraphLocations', data);
    }

    function loadPositions() {
        var data = store.get('vivaGraphLocations');
        if (data) {
            Object.keys(data).forEach(function (key) {
                if (!graph.getNode(key)) return;

                var position = layout.getNodePosition(key);
                var savedPosition = data[key];
                position.x = savedPosition.x;
                position.y = savedPosition.y;
            });
            renderer.rerender();
        }
        else {
            resetPositions();
        }
    }
}