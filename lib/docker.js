var Dockerode = require('dockerode');
var dockerapi = new Docker({socketPath: '/var/run/docker.sock'});
var request = require("request");

var Docker = function(image,executeFile){
  this.image = image;
  this.executeFile = executeFile;
}

Docker.prototype.createContainer = function (callback) {
  var that = this;
  dockerapi.createContainer({
    AttachStdout: true,
    AttachStderr: true,
    Image: that.image,
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

Docker.prototype.startContainer = function (container,dirname,commands,callback) {
  var options = {
    AttachStdout: true,
    AttachStderr: true,
    Tty: false,
    Cmd: commands
  };

  container.start({
    	Binds: [ "/root/sandbox/temp/"+dirname+":/codetree/tempDir:rw" ]
    },function(err){
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


module.exports = Docker;
