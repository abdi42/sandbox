var express = require('express');
var router = express.Router();
var sandbox = require("../api/sandbox.js")
var dockerhttp = require("../lib/dockerhttp.js");
var langs = require("../lib/langs.js");
var cuid = require("cuid");
var fs = require("fs");
var exec = require("child_process").exec;
var dockerContainer = require("../lib/container.js");
var eval = require("../lib/eval.js")

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
  done = false;

  fs.readFile("temp/"+req.body.dirname+"/compileout.txt","utf8", function(err,data) {
      if (err) {
        return;
      }
      else{

        exec("rm temp/"+req.body.dirname+"/compileout.txt",function(err,stdout,stderr){
          if(err) return callback(err)

          return callback();
        })

      }
  });


  fs.access("temp/"+req.body.dirname+"/completed.txt", fs.F_OK, function(err) {
      if (err) {
          return;
      }
      else{
        evalute(req.body.dirname,{
          input:req.body.input,
          expectedOutput:req.body.output
        },function(err,result){

          if(err) return callback(err)


          exec("rm temp/"+req.body.dirname+"/completed.txt",function(err,stdout,stderr){
            if(err) return callback(err)

            req.body.result = result;

            return callback();
          })

        })

      }
  });

},function(req,res,callback){
  dockerhttp.post("/containers/"+req.body.containerId+"/stop",{},function(err){
      if(err) res.status(500).send(stderr)

      dockerhttp.delete("/containers/"+req.body.containerId,{},function(err){
        if(err)
          res.status(500).send(stderr)

        res.json(req.body);
      })
  })
});

function evalute(dirname,data,callback){
  eval.checkFiles("temp/"+dirname+"/src/output",data.expectedOutput,function(err,result){
    if(err) return callback(err);

    return callback(null,result);
  })
}

module.exports = router;
