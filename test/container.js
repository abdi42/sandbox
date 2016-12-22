var kue = require('kue');

queue = kue.createQueue();

console.log("Running job")

var job = queue.create('singleRun',{
  source:"// extract to string\r\n#include <iostream>\r\n#include <string>\r\n\r\nint main ()\r\n{\r\n  std::string str;\r\n\r\n  std::getline (std::cin,str);\r\n\r\n  std::cout << \"Hello\\n\";\r\n  std::cout << str;\r\n\r\n  return 0;\r\n}\r\n",
  input:[["Abdullahi"]],
  lang:"C++"
}).removeOnComplete(true).save();

job.on('complete', function(result){
  console.log('Job finished');
  console.log(result)
}).on( 'error', function( err ) {
  console.log( 'Oops... ', err );
});
