var jsonfile = require('jsonfile');
var file = './tempDir/data.json'
var Program = require("./program.js");
var config = jsonfile.readFileSync(file)
var exec = require("child_process").exec;
var fs = require("fs");
var compileError = false;
console.time("runProgram");

program = new Program("tempDir/",config.lang);
program.compile(function(err){
  if(err){
    fs.writeFile("tempDir/compileout.txt",err);
    compileError = true;
  }
  var input = []
  input.push(config.data.input)

  program.execute(input,function(err){
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


    console.timeEnd("runProgram")

  })
})
