
var Viva = require('local/third-party/viva-graph-js');

module.exports = NodeEditor;


function NodeEditor(ui) {

    var me = {
        setIconRect: setIconRect,
        setIconCircle: setIconCircle,
        setIconStar: setIconStar,
        //setIconCustom: setIconCustom,
        getIcon: getIcon,
        setLabel: setLabel,
        getLabel: getLabel,
        setToDefault: setToDefault,
        saveAsDefault: saveAsDefault
    }

    return me;

    function setIconRect(width, height) {
        var icon = Viva.Graph.svg('rect')
            .attr('width', width)
            .attr('height',height)
            .attr('x', -width / 2)
            .attr('y', -height / 2)
        _setIcon(icon,width/2,height/2);
    }

    function setIconCircle(radius) {
        var icon = Viva.Graph.svg('rect')
            .attr('r', radius)
        _setIcon(icon, radius, radius);
    }

    function setIconStar(numPoints, innerRadius, outerRadius) {
        var points = CalculateStarPoints(0, 0, numPoints, 10, 20);
        var icon = Viva.Graph.svg('polygon')
            .attr('points', points);
        _setIcon(icon, outerRadius, outerRadius/2);
    }

    function getIcon() {
        return ui.querySelector('.node-icon');
    }

    function setLabel(newLabel) {
        var curr = ui.querySelector('.node-label');
        if (curr) ui.removeChild(curr);
        newLabel.addClass('node-label');
        ui.append(newLabel);

        var labx = ui._labOffsetX || 0;
        var laby = ui._labOffsetY || 0;

        positionLabel(labx,laby);
    }

    function getLabel() {
        return ui.querySelector('.node-label');
    }

    function setToDefault() {
        var icon = ui._defaultIcon;
        var label = ui._defaultLabel;

        _setIcon(icon);
        setLabel(label);
    }

    function saveAsDefault() {
        ui._defaultIcon = getIcon();
        ui._defaultLabel = getLabel();
    }

    function _setIcon(newIcon,labx,laby) {
        var curr = ui.querySelector('.node-icon');
        if (curr) ui.removeChild(curr);
        newIcon.addClass('node-icon');
        ui.append(newIcon);

        ui._labOffsetX = labx;
        ui._labOffsetY = laby;
        positionLabel(labx,laby);
    }

    function positionLabel(labx,laby) {
        var label = getLabel();
        if (!label) return;

        label.attr('x', labx + 1 + 'px');
        label.attr('y', laby + 'px');
    }
}

//function getClientBoundingBox(elm) {
//    return {
//        x: elm.clientLeft,
//        y: elm.clientTop,
//        width: elm.clientWidth,
//        height: elm.clientHeight
//    }
//}

//function guessBoundingBox(elm) {
//    var tag = elm.tagName.toLowerCase()

//    if (tag === "rect") {
//        return {
//            x: Number(elm.attr('x')),
//            y: Number(elm.attr('y')),
//            width: Number(elm.attr('width')),
//            height: Number(elm.attr('height'))
//        }
//    }
//    console.log("problem in node-editor: can't guess bounding box." + tag);
//}

function CalculateStarPoints(centerX, centerY, arms, outerRadius, innerRadius) {
    var results = "";

    var angle = Math.PI / arms;
    //var phase = Math.PI / 2;

    for (var i = 0; i < 2 * arms; i++) {
        // Use outer or inner radius depending on what iteration we are in.
        var r = (i & 1) == 0 ? outerRadius : innerRadius;

        var currY = centerX + Math.cos((i * angle)) * r;
        var currX = centerY + Math.sin((i * angle)) * r;

        // Our first time we simply append the coordinates, subsequet times
        // we append a ", " to distinguish each coordinate pair.
        if (i == 0) {
            results = currX + "," + currY;
        }
        else {
            results += ", " + currX + "," + currY;
        }
    }

    return results;
}