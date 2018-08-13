

module.exports = Messenger;


function Messenger(config) {
    if (!config) config = {};

    var messageTypes = {};

    var me = {

        fire: function (messageName, arg) {
            me.fireMultiArg(messageName, [arg]);
        },
        fireMultiArg: function(messageName,args) {
            var listeners = messageTypes[messageName]

            if (config.debug) {
                var lis = listeners ? listeners.length : 0;
                console.log("firing: ", messageName, " args: ", args, "listeners: ", lis);
                if (!Array.isArray(args)) {
                    throw "Arguments must be an array";
                }
            }
            if (!listeners) return;

            for (var i = 0; i < listeners.length; i++) {
                var func = listeners[i];
                func.apply(null, args);
            }
        },
        subscribe: function(messageTypes, func) {
            
            if (Array.isArray(messageTypes)) {
                messageTypes.forEach(function (msg) {
                    subscribe(messageTypes, func);
                })
            }
            else {
                subscribe(messageTypes, func);
            }
        },
        refire: function (sourceMessage, refireMessage) {
            subscribe(sourceMessage, function () {
                //https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#3-managing-arguments
                var args = new Array(arguments.length);
                for (var i = 0; i < args.length; ++i) {
                    args[i] = arguments[i];
                }
                me.fireMultiArg(refireMessage, args);
            });
        }
    };

    function subscribe(messageName, func) {
        if (!messageTypes[messageName]) {
            messageTypes[messageName] = [];
        }
        messageTypes[messageName].push(func);
    }

    return me;
}