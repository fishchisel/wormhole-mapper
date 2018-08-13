module.exports = makeSvgGraphics;

var Viva = require('local/third-party/viva-graph-js');


var MakeNodes = require('./make-nodes.js');
var MakeLinks = require('./make-links.js');
var MakeLabels = require('./make-labels.js');

function makeSvgGraphics(layout, graph, messenger) {

    var g = Viva.Graph.View.svgGraphics();

    var nodes = MakeNodes(layout, graph, g, messenger),
        links = MakeLinks(layout, graph, g, messenger),
        labels = MakeLabels(layout, graph, g, messenger);

    g.node(nodes.make);
    g.placeNode(nodes.place);
    g.link(links.make);
    g.placeLink(links.place);
    g.label(labels.make);
    g.placeLabel(labels.place);
    
    return g;

}

