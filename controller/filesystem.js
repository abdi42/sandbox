var filesystem = require("../lib/filesystem.js");

exports.createTemp = function(config,callback){
  var folders = [
    {
      path:"temp/"+config.dirname,
    },
    {
      path:"temp/"+config.dirname+"/src"
    },
    {
      path:"temp/"+config.dirname+"/src/output"
    },
    {
      path:"temp/"+config.dirname+"/src/input"
    }
  ]

  var files = [
    {
      path:"temp/"+config.dirname+"/src/"+config.lang.fileName+config.lang.compileExt,
      data:config.source
    }
  ]

  for(var i=0;i<config.data.input.length;i++){
    var inputStr = config.data.input[i].split(',');
    inputStr = inputStr.join('\n');
    
    console.log(inputStr)    
    
    files.push({
      path:"temp/"+config.dirname+"/src/input/"+i+".txt",
      data:inputStr
    })
  }

  filesystem.createDirectory(folders,function(err){
    if(err) return callback(err);
    filesystem.createFile(files,function(err){
      if(err) return callback(err)
      return callback(null);
    })
  })

}
