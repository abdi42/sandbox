var fs = require("fs");

var results = {}

exports.checkFiles = function(path,expectedArr,callback){
  results = {
    correct:true,
    cases:[],
  }

  if(typeof path === 'function' ){
    return path("args not specified")
  }
  else if(typeof expectedArr === 'function' ){
    return expectedArr("args not specified")
  }

  var count = 0;

  getFilesData(path,expectedArr,function(err,outputArr){
    if(err) callback(err,null);

    count = expectedArr.length-1;

    expectedArr.forEach(function(obj,i){
      checkArrayEqual(outputArr[i],expectedArr[i],results,function(changedResults){
        results = changedResults;
        return next(i,count,results,callback)
      })
    })

  })
}


function next(index,count,result,callback){
  if(index == count){
    return callback(null,results);
  }
}

function getFilesData(path,output,callback){
  var arr = [];
  var count = 0;
  for(var i=0;i<output.length;i++){
    var data = fs.readFileSync(path+"/"+i+".txt","utf8");
    var outputArr = data.split("\n");
    arr.push(outputArr)
  }

  return callback(null,arr);
}

function checkArrayEqual(outputArr,expectedArr,results,callback){

  for(var i=0;i<expectedArr.length;i++){
    if(outputArr[i] == expectedArr[i]){
      results.cases.push({
        correct:true,
        output:outputArr[i],
        expected:expectedArr[i]
      })
    }
    else{
      results.cases.push({
        correct:false,
        output:outputArr[i],
        expected:expectedArr[i]
      })
      results.correct = false;
    }
  }
  return callback(results);
}
