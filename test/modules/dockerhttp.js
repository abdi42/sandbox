var should = require("should");
var dockerhttp = require("../../src/lib/dockerhttp.js");
var fs = require('fs');
var container = {};

function containerExec(containerId,callback){
    var execOpts = {
      AttachStdout: true,
      AttachStderr: true,
      Tty: false,
      Cmd: ['touch' , 'temp/file.txt']
    }

    dockerhttp.post("/containers/"+containerId+"/exec",execOpts,function(err,body){
        dockerhttp.post("/exec/"+body.Id+"/start",{ Detach: false,Tty: false },function(err){
            if(err) return callback(err)

            return callback(null);
        })
    })
}

describe("DockerHttp",function(){

  before(function(done){
    var containerOpts = {
        AttachStdout: true,
        AttachStderr: true,
        Image: "node",
        Volumes: {
          "/codetree/temp": {}
        },
        HostConfig:{
          Binds:["/home/abdullahimahamed0987/codetree/test/temp:/codetree/temp:rw"]
        },
        OpenStdin: true,
        NetworkDisabled:true,
        Cmd: ['/bin/bash']
    }

    dockerhttp.post("/containers/create",containerOpts,function(err,body){
      container = body;
      body.Id.should.be.an.String();
      done()
    })
  })

  it("should connect to docker daemon and return list of container",function(){
    dockerhttp.get('/containers/json',function(err,body){
      body.should.be.an.Array();
      done()
    })
  })


  it("should start a docker container",function(){
    console.log(container);
    dockerhttp.post("/containers/" + container.Id + "/start", {}, function(err, body) {
        if (err) throw new Error(err)
        done();
    })
  })

  it("should create a file called test.txt",function(){
    containerExec(container.Id,function(err){
      if(err){
        throw new Error(err)
      }
      else{
        fs.stat("test/temp/test.txt",function(err,stats){
          if(err) throw err;
          if(stats.isFile()){
            done()
          }
        })
      }

    })
  })

  it("should stop and remove container",function(){
    dockerhttp.post("/containers/"+container.Id+"/stop",{},function(err){
        if(err) throw new Error(err)

        dockerhttp.delete("/containers/"+container.Id+"?force=1",{},function(err){
            if(err) throw new Error(err)

            done();
        })
    })
  })


})
