var should = require("should");
var exec = require("child_process").exec;
var fs = require("fs")
var filesystem = require("../../src/lib/filesystem.js");
var Program = require("../../src/lib/program.js");
var langs = require("../../src/lib/langs.js");
var langsArr = ["VB","JAVA","C++"]
var sources = [
  "Imports System\n\nPublic Module Module1\n\tPublic Sub Main()\n\t\tdim str as String\n\t\tstr = Console.ReadLine()\n\n\t\tConsole.Write(str)\n\n\tEnd Sub\n\nEnd Module\n",
  "import java.util.Scanner;\n\npublic class Solution {\n\n    public static void main(String[] args) {\n            Scanner scanner = new Scanner(System.in);\n\n            String str = scanner.nextLine();\n\n            System.out.print(str);\n    }\n}\n",
  "// extract to string\n#include <iostream>\n#include <string>\n\nint main ()\n{\n  std::string str;\n\n  std::getline (std::cin,str);\n\n  std::cout << str;\n\n  return 0;\n}\n"
]

describe("Program",function(){


  if(process.env.CIRCLE_NODE_INDEX){
    var lang = langs[langsArr[process.env.CIRCLE_NODE_INDEX]]
    var source = sources[process.env.CIRCLE_NODE_INDEX]
  }
  else{
    var lang = langs["C++"]
    var source = sources[2];
  }

  before(function(done){
    exec("mkdir test/temp/program",function(err,stdout,stderr){
      if(err)
        throw err;
      done();
    })
  })

  var files = [];
  var directories = [];
  var cases = [];
  before(function(done){
    directories = [
      {
        path:"test/temp/program/src"
      },
      {
        path:"test/temp/program/src/input"
      },
      {
        path:"test/temp/program/src/output"
      }
    ]

    files = [
      {
        path:"test/temp/program/src/"+lang.fileName+lang.compileExt,
        data:source
      },
      {
        path:"test/temp/program/src/input/0.txt",
        data:"hello world"
      },
      {
        path:"test/temp/program/src/input/1.txt",
        data:"a'llo world"
      }
    ]

    cases = ["hello world","a'llo world"]


    filesystem.createDirectory(directories,function(err){
      if(err) throw err;
      filesystem.createFile(files,function(err){
        if(err) throw err;
        done();
      })
    })
  })

  var program = {};

  before(function(done){
    program = new Program("test/temp/program",lang);
    done()
  })

  it("should compile specified file",function(done){
    if(lang.name == "Java"){
      lang.executeExt = ".class";
    }

    program.compile(function(err){
      if(err) throw err;
      fs.stat("test/temp/program/src/"+lang.fileName+lang.executeExt,function(err,stats){
        if(err) throw err;
        if(stats.isFile()){
          if(lang.name == "Java"){
            lang.executeExt = "";
          }
          done()
        }
      })
    })
  })

  it("should execute specified file",function(done){
    program.execute(cases,function(err){
      if(err) throw err;
      fs.stat("test/temp/program/src/output/0.txt",function(err,stats){
        if(err) throw err;
        if(stats.isFile()){
          done()
        }
      })
    })
  })
  it("should throw error if path is not specified",function(){
    var program = new Program("",lang);
    program.compile(function(err){
      err.should.be.an.Object();
      err.message.should.equal("path not specified")
    })
  })
  it("should throw error if language is not specified",function(){
    var program = new Program("temp/test","");
    program.compile(function(err){
      err.should.be.an.Object();
      err.message.should.equal("language not specified")
    })
  });

})
