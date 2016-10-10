var asyncUtil = require("async");
var fs = require("fs");

var createFiles = [];
var files = [
  {
    path:"temp/fileOne.txt",
    data:"Hello World"
  },
  {
    path:"temp/fileTwo.txt",
    data:"blank"
  }
]


for(var i=0;i<files.length;i++){
  (function(i){
    var file = files[i]
    createFiles.push(function(callback){
      fs.writeFile(file.path, file.data, 'utf8',function(err){
        if(err) return callback(err)
        callback(null)
      })
    })
  })(i)
}


asyncUtil.parallel(createFiles,function(err, results) {
    console.log(err)
});
