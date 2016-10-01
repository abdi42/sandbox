var express = require('express');
var router = express.Router();
var sandbox = require("../api/sandbox.js")
var dockerhttp = require("../lib/dockerhttp.js");
var langs = require("../lib/langs.js");
var cuid = require("cuid");
var fs = require("fs");
var exec = require("child_process").exec;
var dockerContainer = require("../lib/container.js");


router.post('/',sandbox.create,sandbox.create,sandbox.runCode);

function removeContainer(req,callback){
  dockerhttp.post("/containers/"+req.body.containerId+"/stop",{},function(err){
      if(err) return callback(stderr)

      dockerhttp.delete("/containers/"+req.body.containerId,{},function(err){
        if(err)
          return callback(stderr)

        return callback()
      })
  })
}

module.exports = router;
