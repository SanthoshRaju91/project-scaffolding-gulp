(function() {

  function chart() {
    return {
      restrict: 'E',
      templateUrl: 'template/chart-template.html',
      link: function(scope, element, attr) {
        var chartOptions = {};
        chartOptions.size = {
          height: attr.height,
          width: attr.width
        };
        chartOptions.data = scope.data;
        var chart = c3.generate(chartOptions);
      }
    };
  }

  angular.module('app', [])
    .controller('chartController', ['$scope', function($scope) {
      $scope.data = {
              columns: [
                ['IE', 30],
                ['chrome', 120],
            ],
            type: 'donut'
          };
    }])
    .directive('chart', chart);
}());
