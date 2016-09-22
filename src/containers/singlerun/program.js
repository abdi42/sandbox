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

/*
  var compileErr = null;

  compile.stderr.on('data', (data) => {
    if(data){
      compileErr = data;
    }
  });

  compile.on('close', (code) => {
    //Get back to top level directory
    if(compileErr){
      process.chdir(topDir);
      return callback(compileErr);
    }
    else if(code == 1){
      process.chdir(topDir);
      return callback(compileErr);
    }
    else{
      process.chdir(topDir);
      return callback(null);
    }
  });
*/

}

Program.prototype.execute = function(cases,callback){
  var program = this;
  var lang = this.lang;

  //Go into the folder
  process.chdir(this.path+"/src");

  count = cases.length-1;

  cases.forEach(function(cases,index){
    run(lang,index,callback);
  })

}

var options = {
  timeout: 10000,
  killSignal: 'SIGKILL'
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
