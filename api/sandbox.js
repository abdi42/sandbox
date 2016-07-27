var Docker = require("../lib/docker.js");
var docker = new Docker("coderunner")
var fsController = require("../controller/filesystem.js");
var langs = require("../lib/langs.js");
var jsonfile = require('jsonfile')
var fs = require("fs");
var filesystem = require("../lib/filesystem.js");
var cuid = require("cuid");
var eval = require("../lib/eval.js");

var Sandbox = {
  create:function(req,res,callback){
    var dirname = cuid();

    createTemps(dirname,req,function(err){
      if(err){
        return callback(err)
      }
      docker.createContainer(function(err,container){
        if(err){
          return callback(err);
        }
        else{
          docker.startContainer(container,dirname,['node' , 'app.js'],function(err,execId){
            if(err){
              return callback(err);
            }
            else{
              req.body.dirname = dirname;
              req.body.containerId = container.id;
              req.body.execId = execId;
              return callback();
            }
          })
        }
      })
    })

  },
  runCode:function(req,res,callback){
    updateCode(req.body.dirname,req,function(err){
      if(err){
        return callback(err);
      }
      else{
        docker.runCode(req.body.execId,function(err,exec){
          if(err){
            return callback(err);
          }
          else{
            return callback();
          }
        })
      }
    })
  },
  checkCode:function(req,res,callback){
    var intid = setInterval(function(){
      fs.access("temp/"+req.body.dirname+"/completed.txt", fs.F_OK, function(err) {
          if (err) {
              return;
          }
          else{
            evalute(req.body.dirname,{
              input:req.body.input,
              expectedOutput:req.body.output
            },function(err,result){
              clearInterval(intid);

              if(err){
                res.status(500).send(err);
              }
              else{
                res.json(result);
              }
            })

          }
      });

    },1)
  },
  remove:function(err,req,res,callback){
    docker.removeContainer(req.body.containerId,function(err){
      if(err)
        return res.status(500).send(err);
      else
        return res.send({
          containerId:req.body.containerId,
        })
    })
  }
}


function createTemps(dirname,req,callback){
  var config = {
    source:req.body.source,
    lang:langs[req.body.lang],
    dirname:dirname,
    data:{
      input:req.body.input,
      expectedOutput:req.body.output
    }
  }

  fsController.createTemp(config,function(err){
    if(err){
      return callback(err)
    }
    else{
      var file = "temp/"+dirname+"/data.json";
      config.source = "";
      jsonfile.writeFileSync(file, config, {spaces: 2})

      return callback(null);
    }
  })
}


function updateCode(dirname,req,callback){
  var config = {
    source:req.body.source,
    lang:langs[req.body.lang],
    dirname:dirname,
  }

  var files = [
    {
      path:"temp/"+config.dirname+"/src/"+config.lang.fileName+config.lang.compileExt,
      data:config.source
    }
  ]

  filesystem.createFile(files,function(err){
    if(err) return callback(err)
    return callback(null);
  })

}


function evalute(dirname,data,callback){
  eval.checkFiles("temp/"+dirname+"/src/output",data.expectedOutput,function(err,result){
    if(err) return callback(err);
    return callback(null,result);
  })
}



module.exports = Sandbox;
