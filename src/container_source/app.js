var jsonfile = require('jsonfile');
var file = './tempDir/data.json'
var Program = require("./program.js");
var config = jsonfile.readFileSync(file)
var exec = require("child_process").exec;
var fs = require("fs");
var compileError = false;
var executionError = false;
program = new Program("tempDir/",config.lang);
program.compile(function(err){
  if(err){
    fs.writeFile("tempDir/compileout.txt",err);
    compileError = true;
  }
  else{
    program.execute(config.data.input,config.timeout,function(err){
      if(err){
        fs.writeFile("tempDir/executionError.txt",err);
        executionError = true;
      }

      var file = {
        path:"tempDir/completed.txt",
        data:""
      }

      if(!executionError){
        try {
          //Creating a file synchronously
          fs.writeFileSync(file.path, file.data, 'utf8');
        } catch (err) {
          return;
        }
      }

    })
  }
})
