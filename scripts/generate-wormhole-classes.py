#-------------------------------------------------------------------------------
# Name:        generate-wormhole-classes
# Purpose:     generates a json representation of the eve wormhole classes based
#              on the format found on eve uni website (converted to .csv)
#              http://wiki.eveuniversity.org/Wormhole_Types
#
# Author:      Olix
# Created:     08/10/2014
#-------------------------------------------------------------------------------

#--------------
# CHANGE THIS -
#--------------
CSV_FILE = "wormhole-classes-eve-uni-2015-10-02.csv"
OUTFILE_LOCATION = "wormhole-classes.json"


import csv
import json

def parseMass(massStr):
	try:
		return int(massStr.replace(',',""))
	except ValueError:
		return massStr

def rowToObject(row):
	wormhole_class = {
		'className': row[0],
		'destinationType': row[1],
		'totalMass': parseMass(row[2]),
		'maxIndividualMass': parseMass(row[3]),
		'massRegeneration': parseMass(row[4]),
		'wormholeGrade': int(row[5]),
		'maxStableTime': int(row[6])
	}
	return wormhole_class

def go():
	data = []

	csvFile = open(CSV_FILE, 'r')
	csvReader = csv.reader(csvFile)
	for row in csvReader:
		data.append(rowToObject(row))
	csvFile.close()

	outFile = open(OUTFILE_LOCATION,'w')
	json.dump(data,outFile, indent=4)
	outFile.close()


go()

