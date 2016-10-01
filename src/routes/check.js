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

router.post('/',sandbox.create,sandbox.runCode,sandbox.checkCode);

module.exports = router;
