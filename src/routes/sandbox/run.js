var express = require('express');
var router = express.Router();
var sandbox = require("../../api/sandbox.js")

router.post('/run',sandbox.runCode,sandbox.checkCode);

module.exports = router;
