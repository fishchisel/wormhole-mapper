
module.exports = LinkManager;


function LinkManager () {

    var links = {};
    var linksArray = []


    var me = {
        add: function (link) {

            var from = link.fromId;
            var to = link.toId;

            getArray(from).push(link);
            getArray(to).push(link);
            linksArray.push(link);
        },
        remove: function (link) {            
            var from = link.fromId;
            var to = link.toId;

            deleteFromArray(getArray(from), from, to);
            deleteFromArray(getArray(to), from,to);
        },
        getLinksForId: function (id) {
            return getArray(id);
        },
        getExisting: function (fromId, toId) {
            var existing = getArray(fromId);

            for (var i = 0; i < existing.length; i++) {
                if (existing[i].toId === toId) return existing[i];
            }
            return null;
        },
        getArray: function () {
            return linksArray;
        },
        countUpOrAdd: function (link) {
            var existing = me.getExisting(link.fromId, link.toId);
            if (existing) {
                existing.count++;
                return existing;
            }
            else {
                link.count = 1;
                me.add(link);

                return link;
            }
        },
        countDownOrRemove: function (link) {
            if (link.count > 1) {
                link.count--;
                return false;
            }
            else {
                me.remove(link);
                return true;
            }
        }

    }

    return me;

    function getArray(id) {
        if (!links[id]) links[id] = [];
        return links[id];
    }

    function deleteFromArray(array,from,to) {

        for (var i = 0; i < array.length; i++) {
            var link = array[i];
            if (link.fromId === from && link.toId === to) {
                array.splice(i, 1);
                return;
            }
        }
    }

}