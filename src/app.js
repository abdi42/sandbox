var sandbox = require("./api/sandbox.js")
var kue = require('kue')
 , queue = kue.createQueue();

queue.process('singleRun',25, function(job, done){
  singleRun(job.data);
});


function singleRun(jobData){
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
