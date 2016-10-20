var dockerhttp = require("./dockerhttp.js");
var jsonfile = require("jsonfile");
var langs = require("./langs.js");
var fs = require("fs")
var cuid = require("cuid");
var asyncUtil = require("async");

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

    try {
      //Creating a directory synchronously
      fs.mkdirSync("temp/" + config.dirname);
    } catch (err) {
      console.error(err);
      return callback(err);
    }


    var sourceFile = {
        path: "temp/" + config.dirname + "/" + config.lang.fileName + config.lang.compileExt,
        data: config.source
    }


    fs.writeFile(sourceFile.path, sourceFile.data, 'utf8',function(err){
      if(err) return callback(err)
      return callback(null)
    })


    /*
    createDirectories(folders, function(err) {
        if (err) return callback(err);
        createFilesAsync(files, function(err) {
            if (err) return callback(err)

            var file = "temp/" + config.dirname + "/data.json";
            config.source = "";

            jsonfile.writeFileSync(file, config, {
                spaces: 2
            })
            return callback(null);

        })
    })
    */

}

exports.containerExec = function (containerId,commands,callback){
    var execOpts = {
      AttachStdout: true,
      AttachStderr: true,
      Tty: false,
      Cmd: commands
    }

    dockerhttp.post("/containers/"+containerId+"/exec",execOpts,function(err,body){
        if(err) return callback(err)
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

  createFilesAsync(files,function(err){
    if(err) return callback(err)

    var file = "temp/" + config.dirname + "/data.json";
    config.source = "";

    jsonfile.writeFileSync(file, config, {
        spaces: 2
    })

    return callback(null);
  })

}

exports.removeContainer = function (data,callback){
  dockerhttp.post("/containers/"+data.containerId+"/stop",{},function(err){
      dockerhttp.delete("/containers/"+data.containerId,{},function(err){
      })
  })
}

function createDirectories(directories,callback){
  if(directories.length == 0){
    return callback(new Error("directories not specified"));
  }
  //loop throught directories array and create directory specified
  for(var i=0;i<directories.length;i++){
    var directory = directories[i];
    if(!directory.path){
      return callback(new Error("directory path not specified"))
    }
    try {
      //Creating a directory synchronously
      fs.mkdirSync(directory.path);
    } catch (err) {
      console.error(err);
      return callback(err);
    }
  }

  return callback(null);
}

function createFilesAsync(files,callback){
  var createFiles = [];
  if(files.length == 0){
    return callback(new Error("files not specified"))
  }


  for(var i=0;i<files.length;i++){
    (function(i){
      var file = files[i]
      if(!file.path){
        return callback(new Error("file path not specified"))
      }

      createFiles.push(function(callback){
        fs.writeFile(file.path, file.data, 'utf8',function(err){
          if(err) return callback(err)
          callback(null)
        })
      })
    })(i)
  }

  asyncUtil.parallel(createFiles,function(err, results) {
      return callback(err);
  });

}
