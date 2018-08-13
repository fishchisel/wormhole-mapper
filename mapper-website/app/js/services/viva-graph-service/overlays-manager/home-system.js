
var Viva = require('local/third-party/viva-graph-js');
var NodeEditor = require('../make-graphics/node-editor');
var homeSysId = siteConfig.homeSystemId;

module.exports = HomeSystem;

function HomeSystem(messenger) {

    var homeSystem = {
        //initialize: initialize,

        mutateNode: mutateNode,
        //mutateLink: mutateLink,
        //mutateLabel: mutateLabel

        clearNode: clearNode,
        //clearLink: clearLink,
        //clearLabel: clearLabel
    };
    return homeSystem;

    function mutateNode(node, nodeUi) {
        var system = node.data.system;

        if (system.id == homeSysId) {
            var editor = NodeEditor(nodeUi);
            editor.setIconStar(5, 10, 20);
            nodeUi.addClass('special');
        }
        return nodeUi;
    }

    function clearNode(node, nodeUi) {
        NodeEditor(nodeUi).setToDefault();
        nodeUi.removeClass('special');
    }

}