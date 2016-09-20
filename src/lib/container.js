function createContainer(config,callback){
    var volume = config.volume;
    var binds = config.binds;
    var commands = config.commands;

    var containerOpts = {
        AttachStdout: true,
        AttachStderr: true,
        Image: config.image,
        OpenStdin: true,
        Volumes: {
            volume:{}
        },
        NetworkDisabled:true,
        HostConfig:{
          Binds:binds
        },
        Cmd: commands
    }

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

exports.exec = function containerExec(containerId,commands,callback){
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

exports.update = function updateCode(data,callback){
  var config = {
    source:data.source,
    lang:langs[data.lang],
    dirname:data.dirname,
  }

  var files = [
    {
      path:"temp/"+config.dirname+"/src/"+config.lang.fileName+config.lang.compileExt,
      data:config.source
    }
  ]

  filesystem.createFile(files,function(err){
    if(err) return callback(err)

    var file = "temp/" + dirname + "/data.json";
    config.source = "";

    jsonfile.writeFileSync(file, config, {
        spaces: 2
    })

    return callback(null);
  })

}

var config = {
    input:[["Hello World"],["hello"]],
    output:[["Hello World"],["hello"]],
    source:"#include <cmath>\r\n#include <cstdio>\r\n#include <vector>\r\n#include <iostream>\r\n#include <algorithm>\r\nusing namespace std;\r\n\r\n\r\nint solveMeFirst(int a, int b) {\r\n // Hint: Type return a+b; below\r\n  return a+b;\r\n}\r\nint main() {\r\n  int num1, num2;\r\n  int sum;\r\n  cin>>num1>>num2;\r\n  sum = solveMeFirst(num1,num2);\r\n  cout<<sum;\r\n  return 0;\r\n}\r\n",
    lang:"C++",
    name:"abdi42"
}
config.image = "coderunner"
config.volume = "/codetree/tempDir"
config.binds = ["/home/abdullahimahamed0987/sandbox/temp/" + config.dirname + ":/codetree/tempDir:rw"]
config.commands = ['/bin/bash']


createContainer(config,function(err,containerId){
  if(err) throw Error(err)

  console.log(containerId)
})
