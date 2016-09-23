var express = require('express');
var router = express.Router();
var sandbox = require("../../api/sandbox.js")

router.post('/',sandbox.runCode,sandbox.checkCode,function(req,res,callback){
  res.json(req.body);
});

module.exports = router;
