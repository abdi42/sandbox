var cuid = require("cuid");
var container = require("../../src/lib/container.js")

describe("Containers",function(){
  var config = {};

  before(function(done){
    config = {
        input:[["Hello World"],["hello"]],
        output:[["Hello World"],["hello"]],
        source:"#include <cmath>\r\n#include <cstdio>\r\n#include <vector>\r\n#include <iostream>\r\n#include <algorithm>\r\nusing namespace std;\r\n\r\n\r\nint solveMeFirst(int a, int b) {\r\n // Hint: Type return a+b; below\r\n  return a+b;\r\n}\r\nint main() {\r\n  int num1, num2;\r\n  int sum;\r\n  cin>>num1>>num2;\r\n  sum = solveMeFirst(num1,num2);\r\n  cout<<sum;\r\n  return 0;\r\n}\r\n",
        lang:"C++",
        name:"abdi42"
    }
    config.dirname = cuid();
    config.image = "coderunner"
    config.volume = "/codetree/tempDir"
    config.binds = ["/home/abdullahimahamed0987/sandbox/temp/" + config.dirname + ":/codetree/tempDir:rw"]
    config.commands = ['/bin/bash']

    done()
  })

  it("should create and start container",function(){
    container.createTemps(config,function(){
      container.createContainer(config,function(err,containerId){
        if(err) throw Error(err)

        container.exec(containerId,['node','app.js'],function(err){
          if(err) throw Error(err)
          done();
        })

      })
    })
  })


})
