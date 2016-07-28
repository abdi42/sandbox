var request = require("request");

var Api = function(url, port) {
    this.options = {
        url: "http://" + url + ":" + port,
        Method: "POST",
        body: {},
        json: true
    }
}

Api.prototype.createContainer = function(body, callback) {
    this.options.body = body;
    this.options.url = this.url+"/containers/create"
    
    request(this.options, function(error, response, body) {
        if (error) {
            callback(response.statusCode + " " + body);
        }
        else {
            callback(null);
        }
    })
};

Api.prototype.startContainer = function(body,callback){
    
}