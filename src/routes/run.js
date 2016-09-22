var express = require('express');
var router = express.Router();
var sandbox = require("../api/sandbox.js")

router.post('/',sandbox.create,sandbox.runCode,sandbox.checkCode,sandbox.remove);

module.exports = router;
