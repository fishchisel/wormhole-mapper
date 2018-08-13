'use strict';

var WormholeDetails = function (wormhole) {
    this.wormhole = wormhole;

    // setup systems data
    this.startSystem = wormhole.getStartSystem();
    this.endSystem = wormhole.getEndSystem();
    var closest = wormhole.getClosestEndToHome();
    if (closest) {
        this.nearSystem = closest;
        this.farSystem = closest === this.startSystem ? this.endSystem : this.startSystem;
    }
    else {
        var near = this.startSystem.systemName < this.endSystem.systemName;
        this.nearSystem = near ? this.startSystem : this.endSystem;
        this.farSystem = near ? this.endSystem : this.startSystem;
    }

    // setup dates/times
    this.dateFound = wormhole.getDateFoundPretty();
    this.dateFoundFuzzy = wormhole.getDateFoundFuzzy();

    this.dateExpires = wormhole.getDateExpiresPretty();
    this.dateExpiresFuzzy = wormhole.getDateExpiresFuzzy();

    // setup wormhole class data
    this.className = wormhole.getClassNamePretty();
    this.wormholeClass = wormhole.getWormholeClass();

    this.maxShipSize = wormhole.getMaxShipSizePretty();

    // jump/ distance info
    this.staticJumps = wormhole.getStaticJumps();
    this.staticJumpsNoHighsec = wormhole.getStaticJumpsNoHighsec();

    var infinity = "\u221E";
    this.equivJumps = this.staticJumps ? this.staticJumps : infinity;
    this.equivLowsecJumps = this.staticJumpsNoHighsec ? this.staticJumpsNoHighsec : infinity;

    this.closestEndName = closest ? closest.systemName : "(no route)";

    this.distanceFromHome = closest ? closest.getStaticJumpsToSystem(siteConfig.homeSystem) : infinity;

    this.isDuplicate = wormhole.hasDuplicate();
    this.transientDuplicate = false;

    this.note = wormhole.getShortNote();
    this.longNote = wormhole.noteIsShort() ? null : wormhole.note;

    var usr = wormhole.getCreator();
    this.user = usr ? usr.name : null;
};

module.exports = WormholeDetails;