'use strict';

var sigma = require('local/third-party/sigma');

var me = function () {

    var directive = {
        //restrict: 'E',
        link: function (scope, element, attrs) {

            element = jQuery(element);
            //var viewportHeight = jQuery(window).height();
            //var elementTop = element.parent().position().top;
            //var maxHeight = viewportHeight - elementTop;
            //var desiredHeight = maxHeight - 20;
            //element.height(desiredHeight);

            var th_col_txt = '#fff';
            var th_col = '#000'

            var s = new sigma({
                renderers: [
                  {
                      container: element[0],
                      type: 'webgl'
                  }
                ],
                settings: {
                    //performance (canvas)
                    mouseZoomDuration: 200,
                    mouseInteriaDuration: 200,
                    doubleClickZoomDuration: 1000,
                    mouseInertiaRatio: 5,
                    hideEdgesOnMove: false,
                    //global	
                    verbose: true, //log sigma errors
                    immutable: false,
                    zoomMin: 0.075,
                    zoomMax: 1.5,
                    //node
                    defaultNodeColor: '#50abff',
                    minNodeSize: 0,
                    maxNodeSize: 0,
                    //edge
                    defaultEdgeColor: '#326ba0', // rgba not working??
                    minEdgeSize: 0,
                    maxEdgeSize: 0,
                    //type: 'fast',
                    //label
                    defaultLabelColor: th_col_txt,
                    //defaultLabelSize: 11,
                    //labelSize: 'fixed', //proportional
                    //font: "EEMfontMono", //13//11 if arial
                    labelThreshold: 3.2,
                    //hover
                    enableHovering: true,
                    defaultLabelHoverColor: th_col_txt,
                    defaultHoverLabelBGColor: th_col
                },
            });


            if (scope.sigmaLoaded) {
                scope.sigmaLoaded(s);
            }
        }
    }

    return directive;
};

module.exports = me;