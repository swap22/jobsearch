(function () {
  'use strict';

  angular
    .module('jobs.admin')
    .controller('JobsAdminController', JobsAdminController);

  JobsAdminController.$inject = ['$scope', '$state', '$window', 'jobResolve', 'Authentication', 'Notification'];

  function JobsAdminController($scope, $state, $window, job, Authentication, Notification) {
    var vm = this;

    vm.job = job;
    vm.authentication = Authentication;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Job
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.job.$remove(function () {
          $state.go('admin.jobs.list');
          Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Job deleted successfully!' });
        });
      }
    }

    // Save Job
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.jobForm');
        return false;
      }

      // Create a new job, or update the current instance
      vm.job.createOrUpdate()
        .then(successCallback)
        .catch(errorCallback);

      function successCallback(res) {
        $state.go('admin.jobs.list'); // should we send the User to the list or the updated Job's view?
        Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Job saved successfully!' });
      }

      function errorCallback(res) {
        Notification.error({ message: res.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Job save error!' });
      }
    }
  }
}());
