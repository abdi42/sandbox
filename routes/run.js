var express = require('express');
var router = express.Router();
var sandbox = require("../api/sandbox.js")

router.post('/',sandbox.runCode);

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
