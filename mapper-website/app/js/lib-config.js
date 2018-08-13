'use strict';

var moment = require('moment');

// set moment to use '1' instead of 'a' for singular things
moment.locale('en', {
    relativeTime: {
        future: "in %s",
        past: "%s ago",
        s: "seconds",
        m: "1 minute",
        mm: "%d minutes",
        h: "1 hour",
        hh: "%d hours",
        d: "1 day",
        dd: "%d days",
        M: "1 month",
        MM: "%d months",
        y: "1 year",
        yy: "%d years"
    }
});