var spawn = require("child_process").spawn;
var topDir = process.env.topDir || process.env.PWD;
var fs = require("fs");
console.log(topDir);
var exec = require("child_process").exec;
var count = 0;

var Program = function(path,lang){
  this.path = path || null;
  this.lang = lang || null;
}

Program.prototype.compile = function(callback){
  if(!this.path){
    return callback(new Error("path not specified"));
  }
  else if(!this.lang){
    return callback(new Error("language not specified"));
  }

  var program = this;
  var lang = this.lang;

  //Go into the folder
  process.chdir(this.path+"/src");

  //spawn new process
  var compile =  exec(lang.compile + lang.fileName+lang.compileExt,function(err,stdout,stderr){
    if(err){
      process.chdir(topDir);
      return callback(stderr);
    }
    else{
      process.chdir(topDir);
      return callback(null);
    }
  })

}

var options = {}

Program.prototype.execute = function(inputs,timeout,callback){
  options = {
    timeout: timeout,
    killSignal: 'SIGKILL'
  }

  var program = this;
  var lang = this.lang;

  //Go into the folder
  process.chdir(this.path+"/src");

  count = inputs.length-1;

  inputs.forEach(function(input,index){
    run(lang,index,callback);
  })

}

function run(lang,index,callback){
  //spawn new process
  var execute = exec(lang.execute + lang.fileName+lang.executeExt + " < " + "input/" + index + ".txt" + " > " + "output/" + index + ".txt",options);

  execute.stderr.on('data', (data) => {
    if(data){
      //Get back to top level directory
      process.chdir(topDir);
      execute.kill();
    }
  });

  execute.on('close', (code) => {
    return next(index,callback);
  });

}

function next(index,callback){
  if(index == count){
    //Get back to top level directory
    process.chdir(topDir);
    return callback(null);
  }
}

module.exports = Program;
