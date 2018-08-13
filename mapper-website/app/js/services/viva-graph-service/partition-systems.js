
module.exports = partitionSystems;

var MIN_NAMED_PARTITION_SIZE = 4;


function partitionSystems(systems) {

    var visitedSystems = {};    
    var partitions = [];

    var sysPartitionLookup = {};

    for (var sysId in systems) {

        var sys = systems[sysId];
        if (!visitedSystems[sysId]) {
            var newPartition = makePartition(sys, systems, visitedSystems);
            partitions.push(newPartition);
            var partitionName = namePartition(newPartition, partitions);

            Object.keys(newPartition).forEach(function(sysId) {
                sysPartitionLookup[sysId] = partitionName;
            })
            partitions[partitionName] = newPartition;
        }
    }

    partitions = partitions.sort(function (a, b) {
        a = Object.keys(a); b = Object.keys(b);
        if (a.length === b.length) return 0;
        return a.length < b.length;
    });


    var namedPartitions = {};
    var sysPartitionLookup = {};
    for (var i = 0; i < partitions.length; i++) {
        var partition = partitions[i];
        var partitionName = namePartition(partition, namedPartitions);

        Object.keys(partition).forEach(function (sysId) {
            sysPartitionLookup[sysId] = partitionName;
        })
        namedPartitions[partitionName] = partition;
    }


    return { lookup: sysPartitionLookup, partitions: namedPartitions };
}

function namePartition(partition, previousPartitions) {
    var numSystems = Object.keys(partition).length;

    var rootName = numSystems < MIN_NAMED_PARTITION_SIZE ? 'Fragment' : getName(partition);
    var partitionName = rootName;
    var count = 0;
    while (previousPartitions[partitionName]) {
        partitionName = rootName + ' #' + ++count;
    }
    return partitionName;
}

function makePartition(system,allValidSystems,visitedSystems) {
    var partition = {}
    var initialRegion = system.regionName;
    var remainingNodes = [system];

    while (remainingNodes.length > 0) {

        var currSys = remainingNodes.pop();
        partition[currSys.id] = currSys;
        visitedSystems[currSys.id] = true;

        currSys.getGates().forEach(function (conSys) {
            if (visitedSystems[conSys.id]) return;
            if (!allValidSystems[conSys.id]) return;
            if (conSys.regionName !== initialRegion) return;

            remainingNodes.push(conSys);
        });
    }

    return partition;
}

function getName(partition) {

    var keys = Object.keys(partition);
    return partition[keys[0]].regionName;
}
