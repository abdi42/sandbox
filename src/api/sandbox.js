var cuid = require("cuid");
var fs = require("fs");
var codeEval = require("../lib/eval.js")
var exec = require("child_process").exec;
var dockerContainer = require("../lib/container.js");
var Program = require("../container_source/programRunner.js");
var asyncUtil = require('async');
var kue = require('kue')
  , queue = kue.createQueue();
var langs = require("../container_source/langs.js");

//Sandbox object in charge of creating,organizing,and removing containers
var Sandbox = {
    create: function(data, callback) {
      var dirname = cuid.slug();
      data.dirname = dirname;
      asyncUtil.parallel({
          one: function(next) {
            createContainer(data,next);
          },
          two: function(next) {
            compileCode(data,next)
          }
      }, function(err, results) {
          if(err)
            console.log(err);

          console.log(results)
          return callback(null,results.one);
      });
    },
    runCode:function(data,callback){
      dockerContainer.containerExec(data.containerId,['node','app.js'],function(err){
        if(err) return callback(err)

        return callback(null,data);
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

//creating & staring docker container
function createContainer(data,callback){
  dockerContainer.createTemps(data, function(err) {
      if (err) return next(err)

      var containerConfig = data;
      containerConfig.image = "coderunner"
      containerConfig.volume = "/codetree/tempDir"
      containerConfig.binds = ["/home/abdullahi/sandbox/src/temp/" + containerConfig.dirname + ":/codetree/tempDir:rw"]
      containerConfig.commands = ['/bin/bash']

      dockerContainer.createContainer(containerConfig,function(err, containerId) {
          if (err) return next(err);

          data.containerId = containerId;

          return next(null,data);
      })
  })
}

function compileCode(data,callback){
  var program = new Program('/home/abdullahi/sandbox/src/temp/'+dirname,langs[data.lang]);
  program.compile(function(err){
    if(err){
      fs.writeFile('/home/abdullahi/sandbox/src/temp/'+data.dirname+"/compileout.txt",err);
      compileError = true;
      return callback(err);
    }
    else{
      return callback(null,"Done")
    }
  })
}


function evalute(dirname,data,callback){
  codeEval.checkFiles("temp/"+dirname+"/src/output",data.expectedOutput,function(err,result){
    if(err) return callback(err);

    return callback(null,result);
  })
}


function checkStatus(data,callback){
  //dockerContainer.removeContainer(data);
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
