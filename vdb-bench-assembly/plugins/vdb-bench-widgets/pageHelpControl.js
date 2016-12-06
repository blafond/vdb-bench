(function () {
    'use strict';

    var pluginName = 'vdb-bench.widgets';
    var pluginDirName = 'vdb-bench-widgets';

    angular.module( pluginName )
           .directive( 'pageHelpControl', PageHelpControl );

    PageHelpControl.$inject = [ 'CONFIG', 'SYNTAX' ];

    function PageHelpControl( config, syntax ) {
        var directive = {
            restrict: 'E', // used as element only
            replace: true, // replaces the <page-help-control> tag with the template
            scope: {},
            bindToController: {
                helpId: '@'
            },
            controller: PageHelpController,
            controllerAs: 'vm',
            templateUrl: config.pluginDir + syntax.FORWARD_SLASH + pluginDirName + syntax.FORWARD_SLASH + 'pageHelpControl.html',
        };

        return directive;
    }

    PageHelpController.$inject = [ '$sce', 'HelpService' ];

    function PageHelpController( $sce, helpService ) {
        var vm = this;

        // flag to show/hide page help
        vm.showPageHelp = false;

        vm.togglePageHelp = function() {
        	vm.showPageHelp = !vm.showPageHelp;
        };
        
        vm.getHelpPageUrl = function() {
            if ( vm.showPageHelp ) {
                    return  $sce.trustAsResourceUrl( helpService.getHelpPageUrl( vm.helpId ) );
            }
            
            return "";
    };
    }
})();