var sandbox = require("./api/sandbox.js")
var kue = require('kue')
 , queue = kue.createQueue();

queue.process('singleRun',25, function(job, done){
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
    console.log("created container")
    sandbox.runCode(data,function(err,data){
      if(err) return done(err);
      console.log("run code")
      sandbox.getOutput(data,function(err,data){
        if(err) return done(err);
        console.log('returning output ' + data)
        done(null,data.output)
      })
    })
  })
}
