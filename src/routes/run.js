var express = require('express');
var router = express.Router();
var sandbox = require("../api/sandbox.js")
var dockerhttp = require("../lib/dockerhttp.js");
var langs = require("../lib/langs.js");
var cuid = require("cuid");
var fs = require("fs");
var exec = require("child_process").exec;
var dockerContainer = require("../lib/container.js");


router.post('/',function(req,res,callback){
  req.body.dirname = cuid();

  var config = req.body
  config.image = "coderunner"
  config.volume = "/codetree/tempDir"
  config.binds = ["/home/abdullahimahamed0987/sandbox/temp/" + config.dirname + ":/codetree/tempDir:rw"]
  config.commands = ['/bin/bash']

  dockerContainer.createTemps(req.body, function(err) {
      if (err) return callback(err)

      dockerContainer.createContainer(config,function(err, containerId) {
          if (err) return callback(err);

          req.body.containerId = containerId;

          return callback();
      })
  })
},function(req,res,callback){
  dockerContainer.update(req.body,function(err){
      if(err) return callback(err)

      dockerContainer.containerExec(req.body.containerId,['node','app.js'],function(err){
          if(err) return callback(err)

          return callback();
      })
  })
},function(req,res,callback){

  fs.readFile("temp/"+req.body.dirname+"/compileout.txt","utf8", function(err,data) {
      if (err) {
        return;
      }
      else{

        removeContainer(req,function(){

          res.status(400).json({
            status:400,
            error:data
          })

        })
      }
  });


  fs.access("temp/"+req.body.dirname+"/completed.txt", fs.F_OK, function(err) {
      if (err) {
          return;
      }
      else{
        removeContainer(req,function(){

          var data = fs.readFileSync("temp/" + req.body.dirname + "/src/output/0.txt","utf8");
          var outputArr = data.split("\n");
          req.body.output = outputArr;

          res.json({
            status:200,
            output:req.body.output
          })

        })
      }
  });

});

function removeContainer(req,callback){
  dockerhttp.post("/containers/"+req.body.containerId+"/stop",{},function(err){
      if(err) return callback(stderr)

      dockerhttp.delete("/containers/"+req.body.containerId,{},function(err){
        if(err)
          return callback(stderr)

        return callback()
      })
  })
}

module.exports = router;
