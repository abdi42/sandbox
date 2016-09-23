var express = require('express');
var router = express.Router();
var sandbox = require("../../api/sandbox.js")

router.post('/',sandbox.runCode,sandbox.checkCode,function(req,res,callback){
  dockerhttp.post("/containers/"+req.body.containerId+"/stop",{},function(err){
      if(err) res.status(500).send(stderr)

      dockerhttp.delete("/containers/"+req.body.containerId,{},function(err){
        if(err)
          res.status(500).send(stderr)

        res.json(req.body);
      })
  })
});

module.exports = router;
