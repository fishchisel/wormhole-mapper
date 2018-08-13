
module.exports = SecurityStatus;

function SecurityStatus(messenger) {

    var securityStatus = {
        //initialize: initialize,

        mutateNode: mutateNode,
        //mutateLink: mutateLink,
        //mutateLabel: mutateLabel

        clearNode: clearNode,
        //clearLink: clearLink,
        //clearLabel: clearLabel
    };

    return securityStatus;




    function mutateNode(node, nodeUi) {
        var system = node.data.system;

        if (system) {
            if (system.isHighsec()) nodeUi.addClass('highsec');
            if (system.isLowsec()) nodeUi.addClass('lowsec');
            if (system.isNullsec()) nodeUi.addClass('nullsec');
            if (system.isWormholeSpace()) nodeUi.addClass('wormholespace');
        }
        return nodeUi;
    }

    function clearNode(node, nodeUi) {
        nodeUi.removeClasses([
            'highsec', 'lowsec', 'nullsec', 'wormholespace'
        ]);
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







