var Program = require("./programRunner.js");
var langs = require("./langs.js");
var fs = require("fs");
var ArgumentParser = require('argparse').ArgumentParser;
var parser = new ArgumentParser({
  version: '0.0.1',
});

parser.addArgument(
  [ '-i', '--input' ],
  {
    help: 'program input'
  }
);

parser.addArgument(
  [ '-l', '--lang' ],
  {
    help: 'program language'
  }
);

var args = parser.parseArgs();

var payload = {
  stdin:args.split("\n"),
  lang:args.lang
}
console.log('payload')

/*
runCode(payload,function(err){
  if(err)
    return throw new Error(err);
})
*/

function runCode(payload,done){
  var program = new Program(payload.lang);

  program.compile(function(err){
    if(err){
      done(err)
    }
    else{
      program.singleRun(payload,function(err,output){
        if(err){
          done(err)
        }
        done(null,output)
      })
    }
  })
}
