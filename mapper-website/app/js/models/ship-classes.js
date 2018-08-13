'use strict';

var ShipClasses = {};
	
ShipClasses['frigate'] = {
	friendlyName: "Frigate",
	mass: 1600000, // enyo, 400mm plate
	alignTime: 4,
	warpTime20: 20
}
ShipClasses['cruiser'] = {
	friendlyName: "Cruiser",
	mass: 15000000, // ishtar, 1600mm plate
	alignTime: 6,
	warpTime20: 33
}
ShipClasses['battlecruiser'] = {
	friendlyName: "Battlecruiser",
	mass: 17000000, // prophecy, 1600mm plate
	alignTime: 8,
	warpTime20: 44
}
ShipClasses['battleship'] = {
	friendlyName: "Battleship",
	mass: 100000000, // Apocalypse 2x 1600mm plate
	alignTime: 11,
	warpTime20: 54
}
ShipClasses['capital'] = {
	friendlyName: "Capital Ship",
	mass: 1200000000, // Dreadnought
	alignTime: 31,
	warpTime20: 71
}

module.exports = ShipClasses;