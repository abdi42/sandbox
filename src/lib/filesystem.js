var fs = require("fs");
var exec = require("child_process").exec;

exports.createFile = function(files,callback){

  if(files.length == 0){
    return callback(new Error("files not specified"))
  }
  //loop through files array and create a file specified
  for(var i=0;i<files.length;i++){
    var file = files[i]
    if(!file.path){
      return callback(new Error("file path not specified"))
    }
    else if(!file.data){
      return callback(new Error("file data not specified"))
    }
    try {
      //Creating a file synchronously
      fs.writeFileSync(file.path, file.data, 'utf8');
    } catch (err) {
      console.error(err);
      return callback(err);
    }
  }

  return callback(null);
}

exports.createDirectory = function(directories,callback){
  if(directories.length == 0){
    return callback(new Error("directories not specified"));
  }
  //loop throught directories array and create directory specified
  for(var i=0;i<directories.length;i++){
    var directory = directories[i];
    if(!directory.path){
      return callback(new Error("directory path not specified"))
    }
    try {
      //Creating a directory synchronously
      fs.mkdirSync(directory.path);
    } catch (err) {
      console.error(err);
      return callback(err);
    }
  }

  return callback(null);
}
