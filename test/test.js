var langs = ["Visual Basic","Java","C++"]

if(!process.env.CIRCLE_NODE_INDEX)
  process.env.CIRCLE_NODE_INDEX = 2;

console.log("Running test sandbox in " + langs[process.env.CIRCLE_NODE_INDEX]);

require("./modules/filesystem.js");
require("./modules/program.js");
require("./modules/eval.js");
