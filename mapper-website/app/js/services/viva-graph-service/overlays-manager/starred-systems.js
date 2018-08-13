
var scannedSysRep = require('local/repositories/scanned-system');
var NodeEditor = require('../make-graphics/node-editor');

module.exports = StarredSystems;

function StarredSystems(messenger) {

    var starredSystems = {
        initialize: initialize,

        mutateNode: mutateNode,
        //mutateLink: mutateLink,
        //mutateLabel: mutateLabel

        clearNode: clearNode,
        //clearLink: clearLink,
        //clearLabel: clearLabel
    };

    return starredSystems;

    function initialize() {
        return scannedSysRep.initialize();
    }

    function mutateNode(node, nodeUi) {
        var system = node.data.system;

        if (system) {
            var scannedSys = scannedSysRep.getSystem(system.id);

            if (scannedSys.isStarred) {
                nodeUi.addClass('special');
                var editor = NodeEditor(nodeUi);
                editor.setIconRect(20, 20);
            }
        }
        return nodeUi;
    }

    function clearNode(node, nodeUi) {
        nodeUi.removeClass('special');
        editor.setToDefault();
    }

    function mutateLink(link, linkUi) {

    }

    function clearLink(link, linkUi) {

    }

    function mutateLabel(label, labelUi) {

    }

    function clearLabel(label, labelUi) {

    }


}





