var eval = require("../../lib/eval.js");
var exec = require("child_process").exec;

describe("Evalute",function(){
  it("should check if all the output files equal expected data",function(){
    eval.checkFiles("test/temp/program/src/output",[["hello world"],["a'llo world"]],function(err,result){
      if(err) console.error(err);
      //result.correct.should.equal(true)
      result.cases.should.be.an.Array();
      result.cases.length.should.equal(2);
    })
  })

  it("should throw error if args not specified",function(){
    eval.checkFiles(function(err,result){
      err.should.equal("args not specified");
    })
  })

  after(function(done){
    exec("rm -r test/temp/program",function(err){
      if(err) throw err;
      done();
    })
  })

})
