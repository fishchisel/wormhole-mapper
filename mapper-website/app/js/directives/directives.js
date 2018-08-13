var app = require('angular').module('wormholeMapper');


app.directive('triggerOnEnter', function () {
	var directive = {
		restrict: "A",
	}
	directive.link = function (scope, el, attr) {
		$(el).keypress(function (event) {
			if (event.which == 13) {
			    scope.$eval(attr.triggerOnEnter);
			}
		});
	};
	return directive;
})
app.directive('systemDetailsTooltip', function () {
	var directive = {
		restrict: "A"
	}
	directive.scope = {
		system: '=systemDetailsTooltip',
		tooltipPlacement: '@',
	}
	directive.controller = ['$scope','$state', function ($scope, $state) {

		$scope.clicked = function () {
			$state.go('system-list.details', { systemName: $scope.system.systemName });
		}
	}],
	directive.link = function (scope, el, attr) {
		el = $(el);

		var system = scope.system;
		var whs = system.getWormholes();
		if (whs.length > 0) {
			var whTt = whs.length === 1 ? "1 wormhole" : "{0} wormholes".format(whs.length);
		}

		var tooltip = "{0} / {1}".format(system.getSecurityPretty(), system.regionName);
		if (whTt)
			tooltip = tooltip + " / " + whTt;


		var options = {
			title: tooltip,
			placement: scope.tooltipPlacement
		};
		el.tooltip(options);

		if (el.is('a')) {
			el.on('click', function (e) {
				scope.clicked();
				e.stopPropagation();
			});
		}
	};

	return directive;
})
app.directive('wormholeClassDetailsTooltip', function () {
	var directive = {
		restrict: "A"
	}
	directive.scope = {
		'class': '=wormholeClassDetailsTooltip',
		tooltipPlacement: '@'
	}
	directive.link = function (scope, el, attr) {
		if (!scope.class) return;

		el = $(el);

        // setup tooltip
		var tooltipOptions = {
			title: scope.class.getTooltip(),
			placement: scope.tooltipPlacement,
            trigger:'hover'
		};
		el.tooltip(tooltipOptions);

		var popoverHtmlFragment = "<div><strong>{0}</strong>: {1}</div>";
		var popoverHtml = "<div>";
		var data = scope.class.getPopoverData();

		for (key in data) {
		    popoverHtml += popoverHtmlFragment.format(key, data[key]);
		}
		popoverHtml += "</div>";
        
		var popoverOptions = {
		    title: scope.class.className,
            content: popoverHtml,
            html: true,
            trigger: 'focus'
		}
		el.attr('tabindex', 0);
		el.popover(popoverOptions);


		if (el.is('a')) {
		    el.on('click', function (e) {
		        console.log("lol");
		        el.tooltip('hide');
		        e.stopPropagation();
		    });
		}
	};

	return directive;
})

app.directive('focusOnCondition', ['$timeout', function ($timeout) {
	return {
		restrict: 'A',
		link: function (scope, el, attr) {
			scope.$watch(attr.focusOnCondition, function (value) {
				if (value) {
					$timeout(function () {
						el[0].focus();
					});
				}
			});
		}
	};
}]);