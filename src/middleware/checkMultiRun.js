var langs = require("../lib/langs.js");

module.exports = function(req,res,callback){

  if(!req.body.timeout){
    req.body.timeout = 3000;
  }

  for(var i=0;i<req.body.testcases.lenght;i++){
    if(req.body.testcases[i].input.length > 0){
      req.body.inputs.push(req.body.testcases[i])
    }
    else{
      req.body.inputs.push([""]);
    }
  }

  return callback();
}
