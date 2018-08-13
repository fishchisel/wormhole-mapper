var MODES = {
    securityStatus: require('./security-status.js'),
    starredSystems: require('./starred-systems.js'),
    homeSystem: require('./home-system.js')
};

module.exports = OverlaysManager;

var Viva = require('local/third-party/viva-graph-js');

var q = require('q');

function OverlaysManager(graph, graphics, messenger) {

    var possibleModes = {};
    Object.keys(MODES).forEach(function (key) {
        possibleModes[key] = MODES[key](messenger);
    });

    var currentMode = {};
    var overlays = {};

    messenger.subscribe('overlays-manager.add-overlay', addOverlay);
    messenger.subscribe('overlays-manager.add-overlays', addOverlays);

    messenger.subscribe('overlays-manager.remove-overlay', removeOverlay);
    messenger.subscribe('overlays-manager.clear', clearAllOverlays);

    var me = {
        addOverlay: addOverlay,
        addOverlays: addOverlays,
        removeOverlay: removeOverlay,
        clear: clearAllOverlays,
        getCurrentMode: function () { return currentMode; }
    }

    return me;

    /* Initializes the given overlay if necessary */
    function addOverlay(overlayName) {
        if (!possibleModes[overlayName]) throw "Invalid overlay";

        var overlay = possibleModes[overlayName];
        if (overlays[overlayName]) return;

        if (overlay.initialize) {
            overlay.initialize().done(function () { _addOverlay(overlayName); });
        }
        else { _addOverlay(overlayName); }
    }

    /* Applies the given overlay */
    function _addOverlay(overlayName) {
        var newOverlay = possibleModes[overlayName];

        overlays[overlayName] = newOverlay;
        currentMode = composeMode(overlays)

        mutateToMode(newOverlay);
        messenger.fire('overlays-manager.changed', currentMode);
    }

    /* Initializes the array of overlay names if necessary */
    function addOverlays(overlayNamesArray) {
        var toInitialize = [];
        var newOverlays = [];
        for (var i = 0; i < overlayNamesArray.length; i++) {
            var overlayName = overlayNamesArray[i];
            var overlay = possibleModes[overlayName];

            if (!overlay) throw "Invalid overlay";
            if (overlays[overlayName]) continue;

            if (overlay.initialize) toInitialize.push(overlay.initialize());
            newOverlays.push(overlayName);
        }
        if (newOverlays.length > 0) {
            q.all(toInitialize).done(function () {
                _addOverlays(newOverlays);
            });
        }
    }

    /* Applies the given array of overlay names */
    function _addOverlays(overlayNamesArray) {
        var newOverlays = {};
        for (var i = 0; i < overlayNamesArray.length; i++) {
            var overlayName = overlayNamesArray[i];
            var overlay = possibleModes[overlayName];

            overlays[overlayName] = overlay;
            newOverlays[overlayName] = overlay;

        }

        newOverlays = composeMode(newOverlays);
        mutateToMode(newOverlays);

        currentMode = composeMode(overlays)
        messenger.fire('overlays-manager.changed', currentMode);
    }

    /* removes the given overlay */
    function removeOverlay(modeName) {
        var overlay = overlays[modeName];
        if (!overlay) return;

        delete overlays[modeName];
        currentMode = composeMode(overlays)
        clearMode(currentMode);
        mutateToMode(mode);

        messenger.fire('overlays-manager.changed', currentMode);
    }

    function clearAllOverlays() {
        clearMode(currentMode);
        overlays = {};
        currentMode = {};
        messenger.fire('overlays-manager.changed', currentMode);
    }

    function mutateToMode(mode) {

        if (mode.mutateNode) {
            graph.forEachNode(function (node) {
                var ui = graphics.getNodeUI(node.id);
                mode.mutateNode(node, ui);
            });
        }
        if (mode.mutateLink) {
            graph.forEachLink(function (link) {
                var ui = graphics.getLinkUI(link.id);
                mode.mutateLink(link, ui);
            });
        }
        if (mode.mutateLabel) {
            graph.forEachNode(function (label) {
                var ui = graphics.getLabelUI(label.id);
                mode.mutateLabel(label, ui);
            });
        }
    }

    function clearMode(mode) {

        if (mode.clearNode) {
            graph.forEachNode(function (node) {
                var ui = graphics.getNodeUI(node.id);
                mode.clearNode(node, ui);
            });
        }
        if (mode.clearLink) {
            graph.forEachLink(function (link) {
                var ui = graphics.getLinkUI(link.id);
                mode.clearLink(link, ui);
            });
        }
        if (mode.clearLabel) {
            graph.forEachNode(function (label) {
                var ui = graphics.getLabelUI(label.id);
                mode.clearLabel(label, ui);
            });
        }
    }
}

function composeMode(overlays) {
    var composedMode = {}

    for (var key in overlays) {
        var overlay = overlays[key];
        composedMode.mutateNode = composeFunc(composedMode.mutateNode, overlay.mutateNode);
        composedMode.mutateLink = composeFunc(composedMode.mutateLink, overlay.mutateLink);
        composedMode.mutateLabel = composeFunc(composedMode.mutateLabel, overlay.mutateLabel);
        composedMode.clearNode = composeFunc(composedMode.clearNode, overlay.clearNode);
        composedMode.clearLink = composeFunc(composedMode.clearLink, overlay.clearLink);
        composedMode.clearLabel = composeFunc(composedMode.clearLabel, overlay.clearLabel);
    }
    return composedMode;
}

function composeFunc(func1, func2) {
    if (!func1 && !func2) return null;
    if (func1 && !func2) return func1;
    if (!func1 && func2) return func2;

    return function (item, ui) {
        ui = func1.call(this, item, ui);
        return func2.call(this, item, ui);
    }
}