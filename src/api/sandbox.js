var cuid = require("cuid");
var fs = require("fs");
var codeEval = require("../lib/eval.js")
var exec = require("child_process").exec;
var dockerContainer = require("../lib/container.js");


//Sandbox object in charge of creating,organizing,and removing containers
var Sandbox = {
    //creating & staring docker container
    create: function(req, res, callback) {
      //generating a random
      req.body.dirname = cuid.slug();

      var containerConfig = req.body
      containerConfig.image = "coderunner"
      containerConfig.volume = "/codetree/tempDir"
      containerConfig.binds = ["/home/abdullahimahamed0987/sandbox/temp/" + containerConfig.dirname + ":/codetree/tempDir:rw"]
      containerConfig.commands = ['/bin/bash']

      dockerContainer.createTemps(req.body, function(err) {
          if (err) return callback(err)

          dockerContainer.createContainer(containerConfig,function(err, containerId) {
              if (err) return callback(err);

              req.body.containerId = containerId;

              return callback();
          })
      })
    },
    runCode:function(req,res,callback){
      dockerContainer.update(req.body,function(err){
          if(err) return callback(err)

          dockerContainer.containerExec(req.body.containerId,['node','app.js'],function(err){
              if(err) return callback(err)

              return callback();
          })
      })
    },
    checkCode:function(req,res,callback){
      checkStatus(req,function(err,data){
        if(err){
            res.status(400).json({
              status:400,
              error:err
            })
        }
        else{
          evalute(req.body.dirname,{
            input:req.body.input,
            expectedOutput:req.body.output
          },function(err,result){

            if(err) return callback(err);

            req.body.result = result;

            res.json({
              status:200,
              result:req.body.result
            })

          })
        }
      })
    },
    getOutput:function(req,res,callback){
      checkStatus(req,function(err){
        if(err){
            res.status(400).json({
              status:400,
              error:err
            })
        }
        else{
          var data = fs.readFileSync("temp/" + req.body.dirname + "/src/output/0.txt","utf8");
          
          var outputArr = data.split("\n");
          req.body.output = outputArr;

          res.json({
            status:200,
            output:req.body.output
          })
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


function checkStatus(req,callback){
  //dockerContainer.removeContainer(req);
  fs.readFile("temp/"+req.body.dirname+"/compileout.txt","utf8", function(err,data) {
      if (err) {
        return;
      }
      else{
        return callback(data)
      }
  });

  fs.readFile("temp/"+req.body.dirname+"/executionError.txt","utf8", function(err,data) {
      if (err) {
        return;
      }
      else{
        return callback(data)
      }
  });


  fs.access("temp/"+req.body.dirname+"/completed.txt", fs.F_OK, function(err) {
      if (err) {
          return;
      }
      else{
        return callback(null)
      }
  });
}



module.exports = Sandbox;
