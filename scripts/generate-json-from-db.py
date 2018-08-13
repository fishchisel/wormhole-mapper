#-------------------------------------------------------------------------------
# Name:        generate-json-from-db
# Purpose:     generates a json representation of some EVE Online tables: the
#              systems table, the systems jumps table, and the regions table.
#
# Author:      Olix
# Created:     06/10/2014
#-------------------------------------------------------------------------------

#--------------
# CHANGE THIS -
#--------------
DATABASE_FILE = "./database/universeDataDx.db"
OUTFILE_LOCATION = "systems.json"


# Script begins below
import sqlite3
import json

SYS_Q = "SELECT solarSystemID, regionID, solarSystemName, security, x,y,z FROM mapsolarsystems"
JMP_Q = "SELECT fromSolarSystemId, toSolarSystemId FROM mapsolarsystemjumps"
REG_Q = "SELECT regionId, regionName FROM mapregions"

LY_MOD = 9460528450000000

def main():
	conn = sqlite3.connect(DATABASE_FILE)
	c = conn.cursor()

	systems = c.execute(SYS_Q).fetchall()
	jumps = c.execute(JMP_Q).fetchall()
	regions = c.execute(REG_Q).fetchall()

	outSystems = []
	count = 0
	for system in systems:
		outSys = {
			'systemId': system[0],
			'systemName': system[2],
			'regionId': system[1],
			'security': system[3],
			'xpos': system[4] / LY_MOD,
			'ypos': system[5] / LY_MOD,
			'zpos': system[6] / LY_MOD,
			'connectedSystems': []}
		outSys['regionName'] = (next(x for x in regions if x[0] == outSys['regionId'])[1])

		for jump in jumps:
			if jump[0] == outSys['systemId']:
				outSys['connectedSystems'].append(jump[1])
			#if jump[1] == outSys['systemId']:
			#	outSys['connectedSystems'].append(jump[0])

		outSystems.append(outSys)
		count = count + 1
		print(count)
	conn.close()

	with open(OUTFILE_LOCATION,'w') as file:
		json.dump(outSystems,file, indent=4)
		#json.dump(outSystems,file)


main()
