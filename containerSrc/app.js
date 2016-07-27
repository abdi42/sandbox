var jsonfile = require('jsonfile');
var file = './tempDir/data.json'
var Program = require("./program.js");
var config = jsonfile.readFileSync(file)
var exec = require("child_process").exec;
var fs = require("fs");
var compileError = false;
program = new Program("tempDir/",config.lang);
program.compile(function(err){
  if(err){
    fs.writeFile("compileout.txt",err);
    compileError = true;
  }
  program.execute(config.data.input,function(err){
    if(err) console.error(err);

    var file = {
      path:"tempDir/completed.txt",
      data:""
    }

    if(!compileError){
      try {
        //Creating a file synchronously
        fs.writeFileSync(file.path, file.data, 'utf8');
      } catch (err) {
        return;
      }
    }

    exec("rm tempDir/src/a.cpp")

    return;
  })
})
