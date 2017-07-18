(function () {
  'use strict';

  angular
    .module('jobs.admin')
    .controller('JobsAdminListController', JobsAdminListController);

  JobsAdminListController.$inject = ['JobsService'];

  function JobsAdminListController(JobsService) {
    var vm = this;

    vm.jobs = JobsService.query();
  }
}());
