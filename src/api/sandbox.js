var cuid = require("cuid");
var fs = require("fs");
var codeEval = require("../lib/eval.js")
var exec = require("child_process").exec;
var dockerContainer = require("../lib/container.js");
var kue = require('kue')
  , queue = kue.createQueue();

//Sandbox object in charge of creating,organizing,and removing containers
var Sandbox = {
    //creating & staring docker container
    create: function(data, callback) {
      //generating a random
      data.dirname = cuid.slug();

      dockerContainer.createTemps(data, function(err) {
          if (err) return callback(err)

          var containerConfig = data;
          containerConfig.image = "coderunner"
          containerConfig.volume = "/codetree/tempDir"
          containerConfig.binds = ["/home/abdullahimahamed0987/sandbox/temp/" + containerConfig.dirname + ":/codetree/tempDir:rw"]
          containerConfig.commands = ['/bin/bash']

          dockerContainer.createContainer(containerConfig,function(err, containerId) {
              if (err) return callback(err);

              data.containerId = containerId;

              return callback(null,data);
          })
      })
    },
    runCode:function(data,callback){
      dockerContainer.update(data,function(err){
        if(err) return callback(err)

        dockerContainer.containerExec(data.containerId,['node','app.js','-i',data.input[0].join('\n'),'-l',data.lang],function(err){
          if(err) return callback(err)

          return callback(null,data);
        })

      })
    },
    checkCode:function(data,callback){
      checkStatus(data,function(err,data){
        if(err){
            return callback(err);
        }
        else{
          evalute(data.dirname,{
            input:data.input,
            expectedOutput:data.output
          },function(err,result){

            if(err) return callback(err);

            data.result = result;

            return callback(null,data)

          })
        }
      })
    },
    getOutput:function(data,callback){
      checkStatus(data,function(err){
        if(err){
            return callback(err);
        }
        else{
          var fileData = fs.readFileSync("temp/" + data.dirname + "/0.txt","utf8");

          var outputArr = fileData.split("\n");
          data.output = outputArr;

          return callback(null,data);
        }
      })
    }
}

function evalute(dirname,data,callback){
  codeEval.checkFiles("temp/"+dirname+"/src/output",data.expectedOutput,function(err,result){
    if(err) return callback(err);

    return callback(null,result);
  })
}


function checkStatus(data,callback){
  dockerContainer.removeContainer(data);
  fs.readFile("temp/"+data.dirname+"/compileout.txt","utf8", function(err,fileData) {
      if (err) {
        return;
      }
      else{
        return callback(fileData)
      }
  });

  fs.readFile("temp/"+data.dirname+"/executionError.txt","utf8", function(err,fileData) {
      if (err) {
        return;
      }
      else{
        return callback(fileData)
      }
  });


  fs.access("temp/"+data.dirname+"/completed.txt", fs.F_OK, function(err) {
      if (err) {
          return;
      }
      else{
        return callback(null)
      }
  });
}



module.exports = Sandbox;
