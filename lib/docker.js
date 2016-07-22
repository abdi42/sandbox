var Dockerode = require('dockerode');
var dockerapi = new Dockerode({host: 'http://104.131.183.223', port: 4243});
var request = require("request");

var Docker = function(opts){
  this.image = opts.image;
  this.executeFile = opts.executeFile;
}

Docker.prototype.createContainer = function (callback) {
  dockerapi.createContainer({
    AttachStdout: true,
    AttachStderr: true,
    Image: 'coderunner',
  	OpenStdin:true,
  	Volumes:{
  		"/tempDir": {}
  	},
  	Cmd: ['/bin/bash']
  },function(err,container){
    if(err)
      return callback(err)
    else
      return callback(null,container);
  });
};

Docker.prototype.startContainer = function (container,commands,callback) {
  var options = {
    AttachStdout: true,
    AttachStderr: true,
    Tty: false,
    Cmd: commands
  };

  container.start({},function(err){
    if(err)
      return callback(err);

    container.exec(options, function(err, exec) {
      if (err)
        return callback(err);
      else{
        return callback(null,exec.id);
      }
    });

  });
};


Docker.prototype.runCode = function (id,callback) {
  request({
    url:"http://104.131.183.223:4243/exec/"+id+"/start",
    method:"POST",
    body:{
     Detach: false,
     Tty: false
    },
    json:true
  },function(error, response, body){
    if(error){
      callback(response.statusCode+ " " + body);
    }
    else{
      callback(null);
    }
  })
};

Docker.prototype.removeContainer = function (containerId,callback) {
  var container = dockerapi.getContainer(containerId);

  container.stop(function(err){
    if(err)
      callback(err)
    else
      container.remove(null,callback);
  })
};

var dock = new Docker("ubuntu")


dock.createContainer(function(err,container){
  if(err){
    console.error(err)
  }
  else{
      if(err){
        console.error(err)
      }
      else{
        dock.startContainer(container,['touch' , 'wow.js'],function(err,execId){
          if(err){
            return callback(err)
          }
          else{
            dock.runCode(execId,function(err,exec){
              if(err){
                console.error(err)
              }
              else{
                dock.removeContainer(container.id,function(err){
                  if(err)
                    console.error(err)
                })
              }
            })
          }
        })
      }
  }

})
