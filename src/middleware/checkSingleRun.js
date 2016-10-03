var langs = require("../lib/langs.js");

module.exports = function(req,res,callback){
  if(!req.body.input){
    req.body.input = [[" "]]
  }
  else {
    if(Array.isArray(req.body.input)){
      if(req.body.input.length > 0){
        if(Array.isArray(req.body.input[0])){
          var err = new Error("Input can't be array")
          err.status = 400
          return callback(err);
        }
        else{
          req.body.input = [req.body.input];
        }
      }
      else{
        req.body.input = [[" "]]
      }
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
