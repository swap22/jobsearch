(function () {
  'use strict';

  angular
    .module('jobs.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('jobs', {
        abstract: true,
        url: '/jobs',
        template: '<ui-view/>'
      })
      .state('jobs.list', {
        url: '',
        templateUrl: '/modules/jobs/client/views/list-jobs.client.view.html',
        controller: 'JobsListController',
        controllerAs: 'vm'
      })
      .state('jobs.view', {
        url: '/:jobId',
        templateUrl: '/modules/jobs/client/views/view-job.client.view.html',
        controller: 'JobsController',
        controllerAs: 'vm',
        resolve: {
          jobResolve: getJob
        },
        data: {
          pageTitle: '{{ jobResolve.title }}'
        }
      });
  }

  getJob.$inject = ['$stateParams', 'JobsService'];

  function getJob($stateParams, JobsService) {
    return JobsService.get({
      jobId: $stateParams.jobId
    }).$promise;
  }
}());
