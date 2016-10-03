var express = require('express');
var router = express.Router();
var sandbox = require("../../api/sandbox.js")
var fs = require("fs");
var eval = require("../../lib/eval.js")

router.post('/',sandbox.create,sandbox.runCode,function(req,res,callback){
  fs.readFile("temp/"+req.body.dirname+"/compileout.txt","utf8", function(err,data) {
      if (err) {
        return;
      }
      else{

        removeContainer(req)

        res.status(400).json({
          status:400,
          error:data
        })
      }
  });

  fs.readFile("temp/"+req.body.dirname+"/executionError.txt","utf8", function(err,data) {
      if (err) {
        return;
      }
      else{

        removeContainer(req)

        res.status(400).json({
          status:400,
          error:data
        })
      }
  });


  fs.access("temp/"+req.body.dirname+"/completed.txt", fs.F_OK, function(err) {
      if (err) {
          return;
      }
      else{
        evalute(req.body.dirname,{
          input:req.body.input,
          expectedOutput:req.body.output
        },function(err,result){

          if(err) return callback(err);

          removeContainer(req)

          req.body.result = result;

          res.json({
            status:200,
            result:req.body.result,
            dirname:req.body.dirname,
            containerId:req.body.containerId
          })

        })

      }
  });


});

function removeContainer(req,callback){
  dockerhttp.post("/containers/"+req.body.containerId+"/stop",{},function(err){
      dockerhttp.delete("/containers/"+req.body.containerId,{},function(err){
      })
  })
}

function evalute(dirname,data,callback){
  eval.checkFiles("temp/"+dirname+"/src/output",data.expectedOutput,function(err,result){
    if(err) return callback(err);

    return callback(null,result);
  })
}


module.exports = router;
