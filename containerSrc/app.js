var jsonfile = require('jsonfile');
var file = './tempDir/data.json'
var Program = require("./program.js");
var config = jsonfile.readFileSync(file)
var fs = require("fs");

program = new Program("tempDir/",config.lang);
program.compile(function(err){
  if(err) console.error(err);
  program.execute(config.data.input,function(err){
    if(err) fs.writeFile("compileout.txt",compileErr);

    var file = {
      path:"tempDir/completed.txt",
      data:""
    }

    try {
      //Creating a file synchronously
      fs.writeFileSync(file.path, file.data, 'utf8');
    } catch (err) {
      return;
    }

    return;
  })
})
