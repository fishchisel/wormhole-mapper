'use strict';

var app = require('angular').module('wormholeMapper');

require('./directives');

app.directive('toggleList',
              require('./toggle-list'));

app.directive('toggleListPopover',
              ['$compile',
               require('./toggle-list-popover')]);


app.directive('editWormhole',
              require('./system-list-directives/edit-wormhole'));

app.directive('editSignature',
              require('./system-list-directives/edit-signature'));


app.directive('systemSearch',
              ['$compile',
               require('./repository-search/system-search')]);

app.directive('wormholeSearch',
              ['$compile',
               require('./repository-search/wormhole-class-search')]);

app.directive('leaderboardPart',
               require('./leaderboard-part'));

app.directive('sigmaJs',
               require('./sigma.js'));