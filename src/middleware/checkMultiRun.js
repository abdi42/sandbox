var langs = require("../lib/langs.js");

module.exports = function(req,res,callback){

  if(!req.body.timeout){
    req.body.timeout = 3000;
  }

  if(!req.body.testcases){
    var err = new Error("TestCases not provided");
    err.status = 400;
    return callback(err)
  }

  if(!req.body.expectedOutputs){
    var err = new Error("expectedOutput not provided")
    err.status = 400;
    return callback(err);
  }

  req.body.output = req.body.expectedOutputs
  req.body.input = req.body.testcases;

  if(Array.isArray(req.body.input)){
    if(!req.body.input.length > 0){
      var err = new Error("testcases empty");
      err.status = 400;
      return callback(err)
    }
  }
  else{
    var err = new Error("TestCases needs to be an array or matrix");
    err.status = 400;
    return callback(err)
  }

  if(!req.body.source.length > 0){
    res.status(400)
    res.json({
      status:400,
      error:"Source code empty"
    })
  }

  if(!langs[req.body.lang]){
    res.status(400)
    res.json({
      status:400,
      error:"Unknown language"
    })
  }

  var containsOther = false;
  var containsArray = false;

  for(var i=0;i<req.body.testcases.length;i++){
    if(Array.isArray(req.body.testcases[i])){
      containsArray = true;
    }
    else{
      containsOther = true;
    }
  }

  if(containsArray && containsOther){
    var err = new Error("Incorrect testcases format")
    err.status = 400;
    return callback(err);
  }
  else if(containsArray){
    var testcases = req.body.testcases;
    for(var i=0;i<testcases.length;i++){
      for(var c=0;c<testcases[i].length;c++){
        if(Array.isArray(testcases[i][c])){
          var err = new Error("Incorrect testcases format")
          err.status = 400;
          return callback(err);
        }
      }
    }

  }
  else if(containsOther){
    req.body.input = [req.body.input]
  }

  if(req.body.testcases.length != req.body.expectedOutputs.length){
    if(req.body.testcases.length > req.body.expectedOutputs.length){
      var err = new Error("the length of testcases must be the same as the length of expected outputs")
      err.status = 400;
      return callback(err);
    }
    else{
      var err = new Error("the length of expected outputs must be the same as the length of testcases")
      err.status = 400;
      return callback(err);
    }
  }


  return callback();
}
