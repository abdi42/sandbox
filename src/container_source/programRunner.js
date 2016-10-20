var topDir = process.env.topDir || process.env.PWD;
var exec = require("child_process").exec;
var execSync = require("child_process").execSync;
var fs = require("fs");

var Program = function(lang){
  this.lang = lang || null;
}

Program.prototype.compile = function(callback){
  if(!this.lang){
    return callback(new Error("language not specified"));
  }
  var program = this;
  var lang = this.lang;

  //spawn new process
  var compile =  exec(lang.compile + lang.fileName+lang.compileExt,function(err,stdout,stderr){
    if(err){
      return callback(stderr);
    }
    else{
      return callback(null);
    }
  })

}

var options = {}

Program.prototype.singleRun = function(payload,callback){
  console.time("singleRun");

  var error = null;
  var execute = null;
  var options = {
    input: payload.stdin.join('\n'),
    timeout:payload.timeout
  }

  var lang = this.lang;

  try {
    execute = execSync(lang.execute + lang.fileName+lang.executeExt,options)
  } catch (e) {
    error = e;
  } finally {
    if(error)
      return callback(error)

    var output = execute.toString("utf8")
    return callback(null,output.split('\n'));
  }

}


module.exports = Program;
