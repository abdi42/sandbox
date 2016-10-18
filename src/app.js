var sandbox = require("./api/sandbox.js")
var kue = require('kue')
 , queue = kue.createQueue();

queue.process('singleRun', function(job, done){
  singleRun(job.data);
});


function singleRun(jobData){
  sandbox.create(jobData,function(err,data){
    if(err) return done(err);
    sandbox.runCode(data,function(err,data){
      if(err) return done(err);
      sandbox.checkCode(data,function(err,data){
        if(err) return done(err);

        done(null,data.output)
      })
    })
  })
}


var kue = require('kue')
var queue = kue.createQueue();

var job = queue.create('singleRun',{
  source:"// extract to string\n#include <iostream>\n#include <string>\n\nint main ()\n{\n  std::string str;\n\n  std::getline (std::cin,str);\n\n  std::cout << str;\n\n  return 0;\n}\n",
  input:["Hello World"],
  lang:"C++"
}).removeOnComplete(true).save( function(err,output){
   if( !err ) console.log(output);
});
