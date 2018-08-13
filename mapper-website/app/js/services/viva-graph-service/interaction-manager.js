
module.exports = InteractionManager;

function InteractionManager(graph, messenger) {


    // highlight wormholes on mouseover
    messenger.refire('link.wormhole.mouseenter', 'link.highlight');
    messenger.refire('link.wormhole.mouseleave', 'link.unhighlight');

    // highlight nodes and all connected links on mouseoever
    messenger.subscribe('node.system.mouseenter', highlightNode);
    messenger.subscribe('node.system.mouseleave', unhighlightNode);
    messenger.subscribe('node.region.mouseenter', highlightNode);
    messenger.subscribe('node.region.mouseleave', unhighlightNode);

    // highlight region label, nodes and all connected links on mouseover region label
    messenger.subscribe('label.region.mouseenter', highlightRegion);
    messenger.subscribe('label.region.mouseleave', unhighlightRegion);


    function highlightNode(node) {
        messenger.fire('node.highlight', node);
        var links = graph.getLinks(node.id);
        links.forEach(function (link) {
            messenger.fire('link.highlight', link);
        });
    }
    function unhighlightNode(node) {
        messenger.fire('node.unhighlight', node);
        var links = graph.getLinks(node.id);
        links.forEach(function (link) {
            messenger.fire('link.unhighlight', link);
        });
    }

    function highlightRegion(label) {
        messenger.fire('label.highlight', label);
        var nodes = label.data.region.getNodes();
        for (var id in nodes) {
            highlightNode(nodes[id]);
        }
    }

    function unhighlightRegion(label) {
        messenger.fire('label.unhighlight', label);
        var nodes = label.data.region.getNodes();
        for (var id in nodes) {
            unhighlightNode(nodes[id]);
        }
    }

}