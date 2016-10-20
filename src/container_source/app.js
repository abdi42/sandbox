var Program = require("./programRunner.js");
var langs = require("./langs.js");
var fs = require("fs");
var kue = require('kue')
var queue = kue.createQueue({
  redis: {
    port: 6379,
    host: process.env.DB_PORT_6379_TCP_ADDR,
  }
})

queue.process('runCode', function(job, done){
  runCode(job.data, done);
});

function runCode(payload,done){
  var program = new Program(payload.lang);
  program.compile(function(err){
    if(err){
      done(err)
    }
    else{
      program.singleRun(payload,function(err,output){
        if(err){
          done(err)
        }
        done(null,output)
      })
    }
  })
}
