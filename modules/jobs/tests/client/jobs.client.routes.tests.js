(function () {
  'use strict';

  describe('Jobs Route Tests', function () {
    // Initialize global variables
    var $scope,
      JobsService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _JobsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      JobsService = _JobsService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('jobs');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/jobs');
        });

        it('Should be abstract', function () {
          expect(mainstate.abstract).toBe(true);
        });

        it('Should have template', function () {
          expect(mainstate.template).toBe('<ui-view/>');
        });
      });

      describe('List Route', function () {
        var liststate;
        beforeEach(inject(function ($state) {
          liststate = $state.get('jobs.list');
        }));

        it('Should have the correct URL', function () {
          expect(liststate.url).toEqual('');
        });

        it('Should not be abstract', function () {
          expect(liststate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(liststate.templateUrl).toBe('/modules/jobs/client/views/list-jobs.client.view.html');
        });
      });

      describe('View Route', function () {
        var viewstate,
          JobsController,
          mockJob;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('jobs.view');
          $templateCache.put('/modules/jobs/client/views/view-job.client.view.html', '');

          // create mock job
          mockJob = new JobsService({
            _id: '525a8422f6d0f87f0e407a33',
            title: 'An Job about MEAN',
            content: 'MEAN rocks!'
          });

          // Initialize Controller
          JobsController = $controller('JobsController as vm', {
            $scope: $scope,
            jobResolve: mockJob
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:jobId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.jobResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            jobId: 1
          })).toEqual('/jobs/1');
        }));

        it('should attach an job to the controller scope', function () {
          expect($scope.vm.job._id).toBe(mockJob._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('/modules/jobs/client/views/view-job.client.view.html');
        });
      });

      describe('Handle Trailing Slash', function () {
        beforeEach(inject(function ($state, $rootScope, $templateCache) {
          $templateCache.put('/modules/jobs/client/views/list-jobs.client.view.html', '');

          $state.go('jobs.list');
          $rootScope.$digest();
        }));

        it('Should remove trailing slash', inject(function ($state, $location, $rootScope) {
          $location.path('jobs/');
          $rootScope.$digest();

          expect($location.path()).toBe('/jobs');
          expect($state.current.templateUrl).toBe('/modules/jobs/client/views/list-jobs.client.view.html');
        }));
      });
    });
  });
}());
