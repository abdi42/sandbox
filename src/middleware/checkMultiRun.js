var langs = require("../lib/langs.js");

module.exports = function(req,res,callback){

  if(!req.body.timeout){
    req.body.timeout = 3000;
  }

  if(!req.body.testcases){
    var err = new Error("testcases not specified");
    err.status = 400;
    return callback(err);
  }

  req.body.input = [];
  req.body.output = [];

  for(var i=0;i<req.body.testcases.length;i++){
    if(req.body.testcases[i].input.length > 0){
      req.body.input.push(req.body.testcases[i].input)
    }
    else{
      req.body.input.push([null]);
    }
    
    if(req.body.testcases[i].expectedOutput.length > 0){
      req.body.output.push(req.body.testcases[i].expectedOutput)  
    }
    else{
      req.body.output.push([null]);
    }
  }
  
  if(!req.body.source.length > 0){
    var err = new Error("Source code empty");
    err.status = 400;
    return callback(err);
  }

  if(!langs[req.body.lang]){
    var err = new Error("Unknown language provided");
    err.status = 400;
    return callback(err)
  }


  return callback();
}
