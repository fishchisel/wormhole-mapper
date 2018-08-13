
var LinkManager = require('./link-manager.js');

module.exports = RegionController;

function RegionController(graph, layout,renderer, messenger) {

    messenger.subscribe('region-controller.collapse-region', collapseRegion);
    messenger.subscribe('region-controller.expand-region', expandRegion);

    var regions = {};

    var trackedLinksManager = LinkManager();

    var me = {
        addRegion: addRegion,
        addNodeToRegion: addNodeToRegion,
        collapseRegion: collapseRegion,
        expandRegion: expandRegion,
        expandAllRegions: expandAllRegions,
        getNodeIdForSystemId: getNodeIdForSystemId,
        trackLink: trackLink,
        untrackLink: untrackLink
    }
    return me;

    function trackLink(fromId,toId,data) {
        trackedLinksManager.add({
            fromId: fromId,
            toId: toId,
            data: data
        });
    }
    function untrackLink(fromId, toId, data) {
        trackedLinksManager.remove({
            fromId: fromId,
            toId: toId,
            data: data
        });
    }

    function addRegion(regionId,data) {
        var region = {
            id: regionId,
            nodes: {},
            getCenter: function () {
                return findRegionCenter(regions[regionId].nodes);
            },
            getNodes: function () {
                return regions[regionId].nodes;
            }
        }
        if (!data) data = {};
        Object.assign(region, data);
        regions[regionId] = region;
        var label = graph.addLabel(regionId, { region: region });
        regions[regionId].label = label;
    }

    function getNodeIdForSystemId(systemId) {
        for (var regionName in regions) {
            var region = regions[regionName];
            if (!region.isCollapsed) continue;

            for (var sysId in region.nodes) {
                if (sysId == systemId) return regionName;
            }
        }

        return systemId;
    }

    function addNodeToRegion(node, regionId) {
        if (!regions[regionId]) addRegion(regionId);

        regions[regionId].nodes[node.id] = node;
    }

    function expandAllRegions() {
        Object.keys(regions).forEach(function (regionId) {
            expandRegion(regionId);
        });
    }

    function collapseRegion(regionId) {
        /* We need to:
         * - Remove & store internal links
         * - Remove & store external links
         * - Store old positions of all nodes
         * - Remove all nodes
         * - Add a region node
         * - Add external links for the region node
         */

        var region = regions[regionId];
        var nodes = region.nodes;
        var nodeIds = Object.keys(region.nodes);

        if (region.isCollapsed) return;


        var externalLinks = [];
        var oldNodes = {};

        for (var i = 0; i < nodeIds.length; i++) {
            var nodeId = nodeIds[i];

            // remove & store links
            var links = graph.getLinks(nodeId);
            for (var j = 0; j < links.length; j++) {
                var link = links[j];
                if (!nodes[link.toId] || !nodes[link.fromId])
                    externalLinks.push(link);

                graph.removeLink(link);
            }

            // remove & store nodes
            var node = graph.getNode(nodeId);
            var pos = layout.getNodePosition(nodeId);
            var nodeRep = {
                id: nodeId,
                position: pos,
                data: node.data
            };
            oldNodes[nodeRep.id] = nodeRep;
            graph.removeNode(nodeId);
        }

        // create & position region node
        var regionSize = nodeIds.length;
        var regionNode = graph.addNode(regionId, { region: region });
        var currPos = layout.getNodePosition(regionId);
        var desiredPos = findRegionCenter(oldNodes);
        currPos.x = desiredPos.x;
        currPos.y = desiredPos.y;

        // add external links
        var previousTargets = {};
        for (var i = 0; i < externalLinks.length; i++) {
            var link = externalLinks[i];
            var externalId = findExternalNodeForLink(link, nodes);

            if (!previousTargets[externalId]) {
                var length = getDistanceBetweenNodes(regionId, externalId);
                length = Math.max(length, 150);

                graph.addLink(regionId, externalId, link.data, length);
                previousTargets[externalId] = true;

            }
        }

        region.regionNode = regionNode;
        region.removedNodes = oldNodes;
        region.isCollapsed = true;
        region.initialPosition = desiredPos;

        graph.removeLabel(regionId);
        renderer.rerender();
    }

    function expandRegion(regionId) {
        var region = regions[regionId];
        var oldNodes = region.removedNodes;
        var oldLinks = region.removedLinks;

        if (!region.isCollapsed) return;

        var regionPos = layout.getNodePosition(regionId);
        var offsetFromStart = {
            x: region.initialPosition.x - regionPos.x,
            y: region.initialPosition.y - regionPos.y
        };

        region.removedNodes = null;
        region.regionNode = null;
        region.initialPosition = null;
        region.isCollapsed = false;

        // remove old region node and external links
        graph.removeNode(regionId);

        // add in the hidden nodes
        for (var nodeId in oldNodes) {
            var oldNode = oldNodes[nodeId];
            graph.addNode(nodeId, oldNode.data);
            var currPos = layout.getNodePosition(nodeId);
            var desiredPos = oldNode.position;
            currPos.x = desiredPos.x - offsetFromStart.x;
            currPos.y = desiredPos.y - offsetFromStart.y;
        }
        for (var nodeId in oldNodes) {
            // add missing links;
            var links = trackedLinksManager.getLinksForId(nodeId);
            for (var i = 0; i < links.length; i++) {
                var link = links[i];

                var fromId = getNodeIdForSystemId(link.fromId);
                var toId = getNodeIdForSystemId(link.toId);
                var data = link.data;

                if (!graph.hasLink(fromId, toId)) {
                    var length = undefined;
                    if (isRegion(fromId) || isRegion(toId)) {
                        length = getDistanceBetweenNodes(fromId, toId);
                    }

                    graph.addLink(fromId, toId, data, length);
                }
            }
        }
        
        graph.addLabel(regionId, { region: region });

        renderer.rerender();
    }

    function findRegionCenter(nodes) {
        var totalX = 0, totalY = 0;
        for (var nodeId in nodes) {
            var node = nodes[nodeId];

            if (node.position) {
                var pos = node.position;
            }
            else {
                var pos = layout.getNodePosition(node.id);
            }
            totalX += pos.x;
            totalY += pos.y;
        }

        var nodeCount = Object.keys(nodes).length;
        var x = totalX / nodeCount;
        var y = totalY / nodeCount;

        return { x: x, y: y };
    }

    function isRegion(nodeId) {
        var node = graph.getNode(nodeId);
        return !!node.data.region;
    }

    function getDistanceBetweenNodes(nodeId1,nodeId2) {
        var pos1 = layout.getNodePosition(nodeId1);
        var pos2 = layout.getNodePosition(nodeId2);
        return getDistanceBetweenPositions(pos1,pos2);
    }

}

function getDistanceBetweenPositions(pos1, pos2) {
    var xdiff = pos1.x - pos2.x;
    var ydiff = pos1.y - pos2.y;

    return Math.sqrt((xdiff * xdiff) + (ydiff * ydiff));
}

function findExternalNodeForLink(link, regionNodes) {
    var toId = link.toId;
    var fromId = link.fromId;

    if (regionNodes[toId]) return fromId;
    return toId;
}