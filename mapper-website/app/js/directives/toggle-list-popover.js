var clickOutsideToCloseSet;

var me = function ($compile) {

    // we have a bit of iffy jquery here to force the popup to close when the user clicks
    // outside of it somewhere.
    if (!clickOutsideToCloseSet) {
        $('body').on('click', function (e) {
            $('[data-toggle-list-popover]').each(function () {
                if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
                    $(this).popover('hide');
                }
            });
        });
        clickOutsideToCloseSet = true;
    }

    return {
        restrict: "A",
        scope: {
            data: '=toggleListPopover',
            placement: '@'
        },
        link: function (scope, element, attrs) {
            scope.placement = scope.placement ? scope.placement : "left";

            // so lazy
            var content = '<div class="list-group" data-toggle-list="data"></div>';
            var template =
                '<div class="popover popover-toggle-list" role="tooltip">' +
                    '<div class="arrow"></div><div class="popover-content"></div>' +
                '</div>';

            var options = {
                content: $compile($(content))(scope),
                template: template,
                placement: scope.placement,
                html: true,
                date: scope.date
            };

            $(element).popover(options);

        }
    };


};

module.exports = me;