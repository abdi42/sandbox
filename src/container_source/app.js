var Program = require("./programRunner.js");
var langs = require("./langs.js");
var fs = require("fs");
var jsonfile = require('jsonfile');

var compileError = false;
var executionError = false;

var args = parser.parseArgs();

var payload = jsonfile.readFileSync('temp/payload.json');

if(!payload.testcases){
  runCode(payload,function(err){
    if(err)
      console.error(err)

    console.timeEnd("runCode");
  })
}


function runCode(payload,done){
  var program = new Program('tempDir',payload.lang);

  program.compile(function(err){
    if(err){
      fs.writeFile("tempDir/compileout.txt",err);
      compileError = true;
      done(err);
    }
    else{
      program.singleRun(payload,function(err){
        if(err){
          fs.writeFile("tempDir/executionError.txt",err);
          executionError = true;
          done(err);
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
            done(err)
          }
        }

        done(null);

      })
    }
  })
}
