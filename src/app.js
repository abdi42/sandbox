var sandbox = require("./api/sandbox.js")
var kue = require('kue')
 , queue = kue.createQueue();

queue.process('singleRun',25, function(job, done){
  console.log("Running singleRun")
  singleRun(job.data,done);
});

queue.process('testcasesRun',25, function(job, done){
  singleRun(job.data,done);
});

function testcasesRun(jobData,done){
  sandbox.create(jobData,function(err,data){
    if(err) return done(err);
    sandbox.runCode(data,function(err,data){
      if(err) return done(err);
      sandbox.checkCode(data,function(err,data){
        if(err) return done(err);

        done(null,data.results)
      })
    })
  })
}

function singleRun(jobData,done){
  sandbox.create(jobData,function(err,data){
    if(err) return done(err);
    sandbox.runCode(data,function(err,data){
      if(err) return done(err);
      sandbox.getOutput(data,function(err,data){
        if(err) return done(err);

        done(null,data.output)
      })
    })
  })
}
