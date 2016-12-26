var Program = require("./programRunner.js");
var langs = require("./langs.js");
var fs = require("fs");
var jsonfile = require('jsonfile');

var compileError = false;
var executionError = false;

var payload = jsonfile.readFileSync('tempDir/payload.json');

//if(!payload.testcases){
  console.log(payload)
  runCode(payload,function(err){
    if(err)
      console.error("Error: " + err)
  })
//}


function runCode(payload,done){
  var program = new Program('tempDir',langs[payload.lang]);

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
