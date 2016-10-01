var express = require('express');
var router = express.Router();
var sandbox = require("../api/sandbox.js")
var dockerhttp = require("../lib/dockerhttp.js");
var langs = require("../lib/langs.js");
var cuid = require("cuid");
var fs = require("fs");
var exec = require("child_process").exec;
var dockerContainer = require("../lib/container.js");
var eval = require("../lib/eval.js")

router.post('/',sandbox.create,sandbox.create,sandbox.runCode,removeContainer);

function removeContainer(req,res,callback){
  console.log("REMOVING")
  dockerhttp.post("/containers/"+req.body.containerId+"/stop",{},function(err){
    console.log("RAN")
      if(err) res.status(500).send(err)

      dockerhttp.delete("/containers/"+req.body.containerId,{},function(err){
        if(err)
          res.status(500).send(err)

        res.json({});
      })
  })
}

module.exports = router;
