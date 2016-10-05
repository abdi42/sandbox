var express = require('express');
var router = express.Router();
var sandbox = require("../api/sandbox.js")
var checkMultiRun = require("../middleware/checkMultiRun.js")

router.post('/',checkMultiRun,sandbox.create,sandbox.runCode,sandbox.checkCode);

module.exports = router;
