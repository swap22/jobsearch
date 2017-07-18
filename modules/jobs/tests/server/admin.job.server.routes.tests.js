'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Job = mongoose.model('Job'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  job;

/**
 * Job routes tests
 */
describe('Job Admin CRUD tests', function () {
  before(function (done) {
    // Get application
    app = express.init(mongoose.connection.db);
    agent = request.agent(app);

    done();
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      usernameOrEmail: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create a new user
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      roles: ['user', 'admin'],
      username: credentials.usernameOrEmail,
      password: credentials.password,
      provider: 'local'
    });

    // Save a user to the test db and create new job
    user.save()
      .then(function () {
        job = {
          title: 'Job Title',
          content: 'Job Content'
        };

        done();
      })
      .catch(done);
  });

  it('should be able to save an job if logged in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new job
        agent.post('/api/jobs')
          .send(job)
          .expect(200)
          .end(function (jobSaveErr, jobSaveRes) {
            // Handle job save error
            if (jobSaveErr) {
              return done(jobSaveErr);
            }

            // Get a list of jobs
            agent.get('/api/jobs')
              .end(function (jobsGetErr, jobsGetRes) {
                // Handle job save error
                if (jobsGetErr) {
                  return done(jobsGetErr);
                }

                // Get jobs list
                var jobs = jobsGetRes.body;

                // Set assertions
                (jobs[0].user._id).should.equal(userId);
                (jobs[0].title).should.match('Job Title');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to update an job if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new job
        agent.post('/api/jobs')
          .send(job)
          .expect(200)
          .end(function (jobSaveErr, jobSaveRes) {
            // Handle job save error
            if (jobSaveErr) {
              return done(jobSaveErr);
            }

            // Update job title
            job.title = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing job
            agent.put('/api/jobs/' + jobSaveRes.body._id)
              .send(job)
              .expect(200)
              .end(function (jobUpdateErr, jobUpdateRes) {
                // Handle job update error
                if (jobUpdateErr) {
                  return done(jobUpdateErr);
                }

                // Set assertions
                (jobUpdateRes.body._id).should.equal(jobSaveRes.body._id);
                (jobUpdateRes.body.title).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an job if no title is provided', function (done) {
    // Invalidate title field
    job.title = '';

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new job
        agent.post('/api/jobs')
          .send(job)
          .expect(422)
          .end(function (jobSaveErr, jobSaveRes) {
            // Set message assertion
            (jobSaveRes.body.message).should.match('Title cannot be blank');

            // Handle job save error
            done(jobSaveErr);
          });
      });
  });

  it('should be able to delete an job if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new job
        agent.post('/api/jobs')
          .send(job)
          .expect(200)
          .end(function (jobSaveErr, jobSaveRes) {
            // Handle job save error
            if (jobSaveErr) {
              return done(jobSaveErr);
            }

            // Delete an existing job
            agent.delete('/api/jobs/' + jobSaveRes.body._id)
              .send(job)
              .expect(200)
              .end(function (jobDeleteErr, jobDeleteRes) {
                // Handle job error error
                if (jobDeleteErr) {
                  return done(jobDeleteErr);
                }

                // Set assertions
                (jobDeleteRes.body._id).should.equal(jobSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a single job if signed in and verify the custom "isCurrentUserOwner" field is set to "true"', function (done) {
    // Create new job model instance
    job.user = user;
    var jobObj = new Job(job);

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new job
        agent.post('/api/jobs')
          .send(job)
          .expect(200)
          .end(function (jobSaveErr, jobSaveRes) {
            // Handle job save error
            if (jobSaveErr) {
              return done(jobSaveErr);
            }

            // Get the job
            agent.get('/api/jobs/' + jobSaveRes.body._id)
              .expect(200)
              .end(function (jobInfoErr, jobInfoRes) {
                // Handle job error
                if (jobInfoErr) {
                  return done(jobInfoErr);
                }

                // Set assertions
                (jobInfoRes.body._id).should.equal(jobSaveRes.body._id);
                (jobInfoRes.body.title).should.equal(job.title);

                // Assert that the "isCurrentUserOwner" field is set to true since the current User created it
                (jobInfoRes.body.isCurrentUserOwner).should.equal(true);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  afterEach(function (done) {
    Job.remove().exec()
      .then(User.remove().exec())
      .then(done())
      .catch(done);
  });
});
