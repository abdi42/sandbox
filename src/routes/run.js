var express = require('express');
var router = express.Router();
var sandbox = require("../api/sandbox.js")
var checkSingleRun = require("../middleware/checkSingleRun.js")

router.post('/',checkSingleRun,sandbox.create,sandbox.runCode,sandbox.getOutput);

module.exports = router;
