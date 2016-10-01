module.exports = function(req,res,callback){
  if(!req.body.input){
    req.body.input = [[" "]]
    return callback();
  }
  else {
    if(Array.isArray(req.body.input)){
      if(req.body.input.length > 0){
        if(Array.isArray(req.body.input[0])){
          res.status(400)
          res.json({
            status:400,
            error:"Input can't be array"
          })
        }
        else{
          req.body.input = [req.body.input];
          return callback();
        }
      }
      else{
        req.body.input = [[" "]]
        return callback()
      }
    }
  }
}
