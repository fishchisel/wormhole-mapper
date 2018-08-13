'use strict'

function initialize() {
	var config = {
		firebaseUrl: 'https://wormhole-mapper.firebaseio.com/',
		firebaseSecretKey: 'KPSpzIjetS5EsKtcs4qwf0OUeYp8SoXbZcBH7VHQ',
	}
	var repositories = require('local/repositories');
	var login = require('local/server-login');
	require('local');
	repositories.setFirebaseUrl(config.firebaseUrl);

	return login("db script", config.firebaseSecretKey).then(function() {
		console.log("logged in");
	});
}

initialize().done(function() {
	console.log("ll");
	var userRep = require('local/repositories/user');
	
	console.log("processing users...");
	userRep.initialize().then(function() {
		var allUsers = userRep.getArray();
		var i = 0;
		allUsers.forEach(function(user) {
			user.lastActivity = user.lastLogin;
			userRep.update(user);
			console.log(i++);
		});	
	});
});