var dockerhttp = require("./dockerhttp.js");
var filesystem = require("./filesystem.js");
var jsonfile = require("jsonfile");
var langs = require("./langs.js");
var fs = require("fs")
var cuid = require("cuid");

exports.createContainer = function(config,callback){
    var containerOpts = {
        AttachStdout: true,
        AttachStderr: true,
        Image: config.image,
        OpenStdin: true,
        Volumes: {},
        NetworkDisabled:true,
        HostConfig:{
          Binds:config.binds
        },
        Cmd: config.commands
    }

    containerOpts.Volumes[config.volume] = {};


    dockerhttp.post("/containers/create", containerOpts, function(err, body) {
        if (err) return callback(err)

        var containerId = body.Id;

        dockerhttp.post("/containers/" + containerId + "/start", {}, function(err, body) {
            if (err) return callback(err)

            return callback(null, containerId);
        })
    })

}

exports.createTemps = function(data, callback){
    var config = {
        source: data.source,
        lang: langs[data.lang],
        dirname: data.dirname,
        timeout:data.timeout,
        data: {
            input: data.input,
            expectedOutput: data.output
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

            var file = "temp/" + config.dirname + "/data.json";
            config.source = "";

            jsonfile.writeFileSync(file, config, {
                spaces: 2
            })
            return callback(null);

        })
    })

}

exports.containerExec = function (containerId,commands,callback){
    var execOpts = {
      AttachStdout: true,
      AttachStderr: true,
      Tty: false,
      Cmd: commands
    }

    dockerhttp.post("/containers/"+containerId+"/exec",execOpts,function(err,body){
        dockerhttp.post("/exec/"+body.Id+"/start",{ Detach: false,Tty: false },function(err){
            if(err) return callback(err)

            return callback(null);
        })
    })
}

exports.update = function (data,callback){
  var config = {
    source:data.source,
    lang:langs[data.lang],
    dirname:data.dirname,
    timeout:data.timeout,
    data: {
        input: data.input,
        expectedOutput: data.output
    }
  }

  var files = [
    {
      path:"temp/"+config.dirname+"/src/"+config.lang.fileName+config.lang.compileExt,
      data:config.source
    }
  ]

  filesystem.createFile(files,function(err){
    if(err) return callback(err)

    var file = "temp/" + config.dirname + "/data.json";
    config.source = "";

    jsonfile.writeFileSync(file, config, {
        spaces: 2
    })

    return callback(null);
  })

}

exports.removeContainer = function (req,callback){
  dockerhttp.post("/containers/"+req.body.containerId+"/stop",{},function(err){
      dockerhttp.delete("/containers/"+req.body.containerId,{},function(err){
      })
  })
}
