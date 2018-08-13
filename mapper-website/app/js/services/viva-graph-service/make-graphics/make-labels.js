
module.exports = MakeLabels;

var Viva = require('local/third-party/viva-graph-js');


function MakeLabels(layout, graph, graphics, messenger) {
    var mutatorFunc = null;

    messenger.subscribe('label.highlight', highlight);
    messenger.subscribe('label.unhighlight', unhighlight);

    messenger.subscribe('overlays-manager.changed', function (newMode) {
        mutatorFunc = newMode.mutateLabel;
    });

    return {
        make: make,
        place: place,
        highlight: highlight,
        unhighlight: unhighlight
    }

    function highlight(label) {
        var ui = graphics.getLabelUI(label.id);
        ui.addClass('highlight');
    }

    function unhighlight(label) {
        var ui = graphics.getLabelUI(label.id);
        ui.removeClass('highlight');
    }

    function make(label) {
        if (label.data.region) {
            var content = label.data.region.name;
            var labelText = Viva.Graph.svg("text").text(content)
                .addClass('viva-label')
                .addClass('region');
            labelText.data = label;

            labelText.addEventListener('mouseenter', handleLabelMouseenter);
            labelText.addEventListener('mouseleave', handleLabelMouseleave);
            labelText.addEventListener('click', handleLabelClick);

            return mutatorFunc ? mutatorFunc(label, labelText) : labelText;
        }
    }

    function place(labelUi, position, label) {
        if (label.data.region) {
            var region = label.data.region;
            var func = region.getCenter;
            var pos = func();
            labelUi.attr('x', pos.x - 20);
            labelUi.attr('y', pos.y);
        }
    }

    function handleLabelClick(args) {
        var labelUi = args.currentTarget;
        var label = labelUi.data;

        messenger.fire('label.region.click', label);
    }

    function handleLabelMouseenter(args) {
        var labelUi = args.currentTarget;
        var label = labelUi.data;

        messenger.fire('label.region.mouseenter', label);
    }
    function handleLabelMouseleave(args) {
        var labelUi = args.currentTarget;
        var label = labelUi.data;

        messenger.fire('label.region.mouseleave', label);
    }
}