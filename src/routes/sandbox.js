var express = require('express');
var router = express.Router();

router.post('/',function(req,res,callback){
  res.send("hello world")
});

module.exports = router;
