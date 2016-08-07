var should = require("should")
var filesystem = require("../../lib/filesystem.js");
var exec = require('child_process').exec;
var fs = require("fs");

describe("FileSystem",function(){
  var singleFile = [];
  var multipleFiles = []
  var singleDirectory = [];
  var multipleDirectories = [];

  before(function(done){
    exec("mkdir test/temp/filesystem",function(err,stdout,stderr){
      if(err)
        throw err;
      done();
    })
  })

  before(function(done){
    singleFile = [
      {
        data:"hello world",
        path:"test/temp/filesystem/file.txt"
      }
    ]
    multipleFiles = [
      {
        data:"hello world",
        path:"test/temp/filesystem/fileTwo.txt"
      },
      {
        data:"hello",
        path:"test/temp/filesystem/fileThree.txt"
      }
    ]
    done()
  })

  it("should create/write file",function(done){
    filesystem.createFile(singleFile,function(err){
      if(err)
        throw err;
      else {
        fs.stat("test/temp/filesystem/file.txt",function(err,stats){
          if(err) throw err;
          if(stats.isFile()){
            done()
          }
        })
      }
    })
  })
  it("should create/write multiple",function(done){
    filesystem.createFile(multipleFiles,function(err){
      if(err)
        throw err;
      else {
        fs.stat("test/temp/filesystem/fileTwo.txt",function(err,stats){
          if(err) throw err;
          if(stats.isFile()){
            fs.stat("test/temp/filesystem/fileThree.txt",function(err,stats){
              if(err) throw err;
              if(stats.isFile()){
                done()
              }
            })
          }
        })
      }
    })
  })
  it("should throw err if files array size is zero",function(){
    filesystem.createFile([],function(err){
      err.should.be.an.Object();
      err.message.should.equal("files not specified")
    })
  })
  it("should throw err if a file path is not specified",function(){
    filesystem.createFile([{data:""}],function(err){
      err.should.be.an.Object();
      err.message.should.equal("file path not specified")
    })
  })
  it("should throw err if a file data is not specified",function(){
    filesystem.createFile([{path:" "}],function(err){
      err.should.be.an.Object();
      err.message.should.equal("file data not specified")
    })
  })

  before(function(done){
    singleDirectory = [
      {
        path:"test/temp/filesystem/src"
      }
    ]
    multipleDirectories = [
      {
        path:"test/temp/filesystem/input",
      },
      {
        path:"test/temp/filesystem/output"
      }
    ]
    done();
  })

  it("should create directories",function(done){
    filesystem.createDirectory(singleDirectory,function(err){
      if(err)
        throw err;
      fs.stat("test/temp/filesystem/src",function(err,stats){
        if(err) throw err;
        if(stats.isDirectory()){
          done();
        }
      })
    })
  })

  it("should create multiple directories",function(done){
    filesystem.createDirectory(multipleDirectories,function(err){
      if(err)
        throw err;
      fs.stat("test/temp/filesystem/input",function(err,stats){
        if(err) throw err;
        if(stats.isDirectory()){
          fs.stat("test/temp/filesystem/output",function(err,stats){
            if(err) throw err;
            if(stats.isDirectory()){
              done();
            }
          })
        }
      })
    })
  })
  it("should throw err if directories are not specified",function(){
    filesystem.createDirectory([],function(err){
      err.should.be.an.Object();
      err.message.should.equal("directories not specified")
    })
  })
  it("should throw err if a directory path is not specified",function(){
    filesystem.createDirectory([{}],function(err){
      err.should.be.an.Object();
      err.message.should.equal("directory path not specified");
    })
  })

  after(function(done){
    exec("rm -r test/temp/filesystem",function(err,stdout,stderr){
      if(err)
        throw err;
      done();
    })
  })
})
