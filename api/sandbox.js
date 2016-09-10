var dockerhttp = require("../lib/dockerhttp.js");
var filesystem = require("../lib/filesystem.js");
var jsonfile = require("jsonfile");
var langs = require("../lib/langs.js");
var cuid = require("cuid");
var fs = require("fs");
var eval = require("../lib/eval.js")
var exec = require("child_process").exec;

var Sandbox = {
    create: function(req, res, callback) {
        console.log("Creating sandbox")
        req.body.dirname = cuid();

        createTemps(req.body.dirname, req, function(err) {
            if (err) return callback(err)

            createContainer(req.body.dirname, function(err, containerId) {
                if (err) return callback(err);

                req.body.containerId = containerId;

                return callback();
            })
        })
    },
    runCode:function(req,res,callback){
        console.log("Running code")
        updateCode(req.body.dirname,req,function(err){
            if(err) return callback(err)

            containerExec(req.body.containerId,function(err){
                if(err) return callback(err)

                return callback();
            })
        })
    },
    checkCode:function(req,res,callback){
      done = false;
      console.log("Checking code");

      fs.readFile("temp/"+req.body.dirname+"/src/compileout.txt","utf8", function(err,data) {
          if (err) {
            return;
          }
          else{

            exec("rm temp/"+req.body.dirname+"/src/compileout.txt",function(err,stdout,stderr){
              if(err)
                res.status(500).send(stderr)

              res.status(500).send(data);
            })

          }
      });


        fs.access("temp/"+req.body.dirname+"/completed.txt", fs.F_OK, function(err) {
            if (err) {
                return;
            }
            else{
              console.log("completed")
              evalute(req.body.dirname,{
                input:req.body.input,
                expectedOutput:req.body.output
              },function(err,result){

                if(err){
                  res.status(500).send(err);
                }

                exec("rm temp/"+req.body.dirname+"/completed.txt",function(err,stdout,stderr){
                  if(err)
                    res.status(500).send(stderr)

                  req.body.result = result;
                  res.json(req.body);
                })

              })

            }
        });
    },
    remove:function(req,res,callback){
        dockerhttp.post("/containers/"+req.body.containerId+"/stop",{},function(err){
            if(err) return callback(err)

            dockerhttp.delete("/containers/"+req.body.containerId+"?v=1",{},function(err){
                if(err) return callback(err)

                return callback();
            })
        })
    }
}


function createContainer(dirname, callback) {
    var containerOpts = {
        AttachStdout: true,
        AttachStderr: true,
        Image: "coderunner",
        OpenStdin: true,
        Volumes: {
            "/tempDir": {}
        },
        Cmd: ['/bin/bash']
    }

    dockerhttp.post("/containers/create", containerOpts, function(err, body) {
        if (err) return callback(err)

        var containerId = body.Id;

        dockerhttp.post("/containers/" + containerId + "/start", {
            Binds: ["/root/sandbox/temp/" + dirname + ":/codetree/tempDir:rw"]
        }, function(err, body) {
            if (err) return callback(err)

            return callback(null, containerId);
        })
    })
}

function containerExec(containerId,callback){
    var execOpts = {
      AttachStdout: true,
      AttachStderr: true,
      Tty: false,
      Cmd: ['node' , 'app.js']
    }

    dockerhttp.post("/containers/"+containerId+"/exec",execOpts,function(err,body){
        dockerhttp.post("/exec/"+body.Id+"/start",{ Detach: false,Tty: false },function(err){
            if(err) return callback(err)

            return callback(null);
        })
    })
}

function createTemps(dirname, req, callback) {

    var config = {
        source: req.body.source,
        lang: langs[req.body.lang],
        dirname: dirname,
        data: {
            input: req.body.input,
            expectedOutput: req.body.output
        }
    }

    var folders = [{
        path: "temp/" + config.dirname,
    }, {
        path: "temp/" + config.dirname + "/src"
    }, {
        path: "temp/" + config.dirname + "/src/output"
    }, {
        path: "temp/" + config.dirname + "/src/input"
    }]

    var files = [{
        path: "temp/" + config.dirname + "/src/" + config.lang.fileName + config.lang.compileExt,
        data: config.source
    }]

    for (var i = 0; i < config.data.input.length; i++) {
        var inputStr = config.data.input[i].join('\n');

        files.push({
            path: "temp/" + config.dirname + "/src/input/" + i + ".txt",
            data: inputStr
        })
    }

    filesystem.createDirectory(folders, function(err) {
        if (err) return callback(err);
        filesystem.createFile(files, function(err) {
            if (err) return callback(err)

            var file = "temp/" + dirname + "/data.json";
            config.source = "";

            jsonfile.writeFileSync(file, config, {
                spaces: 2
            })

            return callback(null);

        })
    })



}

function evalute(dirname,data,callback){
  eval.checkFiles("temp/"+dirname+"/src/output",data.expectedOutput,function(err,result){
    if(err) return callback(err);

    return callback(null,result);
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

module.exports = Sandbox;
