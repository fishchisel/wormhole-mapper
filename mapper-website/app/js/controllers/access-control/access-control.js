'use strict';

var authRepository = require('local/repositories/authorization'),
    Authorization = require('local/repositories/authorization/authorization.js'),
    entitySearch = require('local/eve-api/entity-search'),
    imageServer = require('local/eve-api/image-server'),
    metadataRepository = require('local/repositories/metadata');

var q = require('q'),
    moment = require('moment');

var Details = function (auth) {
    this.data = auth;

    this.name = auth.name;
    this.type = auth.type;

    this.picUrl = auth.getPortraitUrl(32);

    this.lastModified = auth.lastModified;
    this.lastModifiedPretty = auth.getLastModifiedPretty();
    this.lastModifiedFuzzy = auth.getLastModifiedFuzzy();

    this.note = auth.getShortNote();
    this.longNote = auth.noteIsShort() ? null : auth.note;
}

var sortingFunctions = {
    name: function (a, b) {
        return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1;
    },
    type: function (a,b) {
        return a.type < b.type ? -1 : 1;
    },
    lastModified: function (a, b) {
        if (a.lastModified === b.lastModified) return sortingFunctions.name(a, b);
        return a.lastModified < b.lastModified ? 1 : -1;
    },
};

module.exports = function ($scope, $state) {

    authRepository.initialize().then(display);
    authRepository.changed(display);

    var sortFunc = sortingFunctions['name'];

    function display() {
        $scope.safeApply(function () {
            var items = authRepository.getArray().map(function (auth) {
                return new Details(auth);
            }).sort(sortFunc);

            $scope.items = items;
        });
    };

    $scope.sort = function (type) {
        var newFunc = sortingFunctions[type];
        if (newFunc === sortFunc) {
            var oldFunc = sortFunc
            sortFunc = function (a, b) { return oldFunc(a, b) * -1; };
        }
        else {
            sortFunc = newFunc;
        }
        display();
    }

    $scope.authSelect = function (query) {
        $scope.searchQuery = query;
    }

    $scope.$watch('searchQuery', function (value) {
        $scope.search(value);
    });

    $scope.search = function (query) {
        entitySearch(query).then(function (result) {
            $scope.safeApply(function () {
                if (!result)
                    $scope.searchResult = null;
                else {
                    $scope.searchResult = {
                        id: result.id,
                        name: result.name,
                        type: result.type,
                        corp: result.corporation,
                        alliance: result.alliance,
                        picUrl: imageServer(result.id, result.type, 128)
                    }
                    var existing = authRepository.getArray().find(function (x) {
                        console.log(x, result);
                        return x.id === result.id && x.type === result.type;
                    });
                    console.log("existing", existing);
                    if (existing) $scope.searchAuth = existing.clone();
                    else $scope.searchAuth = new Authorization();
                }
            });
        });
    }

    $scope.add = function (result, note) {
        authRepository.set(result.id, result.name, result.type,note);
    }
    $scope.delete = function (item) {
        authRepository.delete(item);
    }

    // home system stuff
    metadataRepository.initialize().then(function () {
        $scope.safeApply(function () {
            $scope.currentHomeSystem = $scope.siteConfig.homeSystem.systemName;
        });
    });
    $scope.canSaveHomeSystem = function () {
        return $scope.newHomeSystem != null;
    };
    $scope.saveHomeSystem = function () {
        metadataRepository.set('homeSystemId', $scope.newHomeSystem.id);
        $scope.currentHomeSystem = $scope.newHomeSystem.systemName;
        $scope.newHomeSystemQuery = '';
    };

    $scope.$on('$destroy', function () {
        authRepository.changedRemoveHandler(display);
    });
};
