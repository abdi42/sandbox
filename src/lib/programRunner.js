var topDir = process.env.topDir || process.env.PWD;
var exec = require("child_process").exec;
var execSync = require("child_process").execSync;
var fs = require("fs");
var count = 0;
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


Program.prototype.singleRun = function(payload,callback){
  console.time("singleRun");
  var options = {}
  var lang = this.lang;
  var path = this.path;

  var error = null;
  var execute = null;


  if(payload.stdin[0].length > 0){
    options = {
      cwd:path,
      input: payload.stdin.join('\n'),
      timeout:payload.timeout
    }
  }
  else {
    options = {
      cwd:path,
      timeout:payload.timeout
    }
  }

  try {
    execute = execSync(lang.execute + lang.fileName+lang.executeExt ,options)
  } catch (e) {
    error = e;
  } finally {
    if(error)
      return callback(error)

    var output = execute.toString("utf8")
    fs.writeFile(path+"/0.txt",output,"utf8");
    return callback(null);
  }

}

Program.prototype.multiRun = function(payload,callback){
  var program = this;
  var lang = this.lang;

  count = payload.testcases.length-1;

  payload.testcases.forEach(function(testcase,index){
    run(testcase,payload.timeout,lang,index,callback);
  })

}

function run(payload,timeout,lang,index,callback){
  var error = null;
  var execute = null;

  options = {
    cwd:"tempDir",
    input: payload.stdin.join('\n'),
    timeout:timeout
  }

  try {
    execute = execSync(lang.execute + lang.fileName+lang.executeExt,options)
  } catch (e) {
    error = e;
  } finally {
    if(error)
      return callback(error)

    next(index,callback);

    var output = execute.toString("utf8")
    fs.writeFile(path+"/"+index+".txt",output,"utf8");
  }

}

function next(index,callback){
  if(index == count){
    return callback(null);
  }
}

module.exports = Program;
