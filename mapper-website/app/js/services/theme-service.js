var store = require('store');


var me = {};

var themes = {
    'default': {
        main: "https://maxcdn.bootstrapcdn.com/bootstrap/3.2.0/css/bootstrap.min.css",
        custom: "css/theme.default.custom.css"
    },
    cerulean: {
        main: "css/theme.cerulean.min.css",
    },
    cyborg: {
        main: "css/theme.cyborg.min.css",
    },
    darkly: {
        main: "css/theme.darkly.min.css",
    },
    journal: {
        main: "css/theme.journal.min.css",
    },
    readable: {
        main: "css/theme.readable.min.css",
    },
    sandstone: {
        main: "css/theme.sandstone.min.css",
    },
    simplex: {
        main: "css/theme.simplex.min.css",
    },
    slate: {
        main: "css/theme.slate.min.css",
    },
    united: {
        main: "css/theme.united.min.css",
    },
    yeti: {
        main: "css/theme.yeti.min.css",
    },
    'adamYawl': {
        main: "https://maxcdn.bootstrapcdn.com/bootstrap/3.2.0/css/bootstrap.min.css",
        custom: "css/theme.adamYawl.custom.css"
    }
}

me.getAllThemes = function () {
    return Object.keys(themes);
}

me.getCurrentTheme = function () {
    var name = store.get('theme');
    if (themes[name])
        return name;
    return "default";
}

me.saveTheme = function (themeName) {
    store.set('theme', themeName);
    me.setTheme(themeName);
}
me.loadTheme = function () {
    var theme = store.get('theme');
    me.setTheme(theme);
}

me.setTheme = function (themeName) {

    var theme = themes[themeName];
    if (!theme) theme = themes["default"];

    var mainCss = document.getElementById("bootstrap-css");
    var customCss = document.getElementById("theme-css");

    var main = theme.main;
    var custom = theme.custom ? theme.custom : "";

    mainCss.href = main;
    customCss.href = custom;
}

module.exports = me;
