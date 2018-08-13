'use strict';

var cosmicAnomalyNames = [
    "Cosmic Anomaly",
    "Kosmische Anomalie",
    "Космическая Аномалия"
];
var cosmicSignatureNames = [
    "Cosmic Signature",
    "Kosmische Signatur",
    "Источник Сигналов"
];
var typeNames = {
    "wormhole": [
        "Wormhole",
        "Wurmloch",
        "Червоточина"
    ],
    "gas": [
        "Gas Site",
        "Gasgebiet",
        "ГАЗ: район добычи газа"
    ],
    "relic": [
        "Relic Site",
        "Reliktgebiet",
        "АРТЕФАКТЫ: район поиска артефактов"
    ],
    "combat": [
        "Combat Site",
        "Kampfgebiet",
        "ОПАСНО: район повышенной опасности"
    ],
    "data": [
        "Data Site",
        "Datengebiet",
        "ДАННЫЕ: район сбора данных",
    ],
    "ore": [
        "Ore Site",
        "Mineraliengebiet",
        "РУДА: район добычи руды"
    ]
}


var me = {}


me.parseData = function (pastedSigData) {
    try {
        var lines = pastedSigData.trim().split('\n');

        var sigs = lines.map(function (line) {
        	var data = line.split('\t');

        	if (data.length < 6)
        		return null;

        	return {
        		id: data[0].trim(),
        		scanGroup: data[1].trim(),
        		group: data[2].trim(),
        		type: data[3].trim(),
        		readingStrength: data[4].trim(),
        		distance: data[5].trim()
        	};
        }).filter(function (x) { return x !== null; });
    }
    catch (e) {
        console.error(e);
        return null;
    }
    return sigs;
}

me.getSignatures = function (currentSystemId, pastedSigData) {

    var data = me.parseData(pastedSigData);
    if (!data || data.length === 0)
        return null;

    var sigs = data.filter(function (sig) {
        return cosmicSignatureNames.indexOf(sig.scanGroup) > -1;
    });
            
    sigs = sigs.map(function (sig) {
        return {
            id: sig.id,
            systemId: currentSystemId,
            type: allowedTypeFromInput(sig.group),                    
        }
    });
    return sigs;
}

function allowedTypeFromInput(input) {
    input = input.trim();

    return Object.keys(typeNames).find(function (type) {
        var langTypes = typeNames[type];
        return (langTypes.indexOf(input) > -1)
    });
};




module.exports = me;


