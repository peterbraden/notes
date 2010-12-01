/*
*         todo.js
* Notes todo app command line access

usage:

%> todo add Take over world
id 2fa4

$> todo ls
 183f. Buy bacon
 2fa4. Take over world
 
$> todo do 183f




*/

var  sys = require('sys')
  , request = require('request')
  , scriptTools = require('scriptTools');

var loadDB = function(opts, cb){
  var h = {accept:'application/json', 'content-type':'application/json'}
    , uri = "http://" + opts.user + ":" + opts.pwd + "@" + opts.host + "/" + opts.database;
  request({uri: uri, headers:h}, function(err, response, body){
    console.log(err,response, body);
  });
}


var slugify = function(title){
}






var commands = {  
  help : function(){
    console.log('See readme.txt');
  },
  
  add : function(){
    var args = Array.prototype.slice.call(arguments, 1)
      , todo_obj = {
          title : args.join(" "),
          class : ['task'],
          created : new Date().toISOString(),
          modified : new Date().toISOString(),
        };
    
    request({
      method:'POST', 
      body : JSON.stringify(todo_obj), 
      uri : this.db_uri, 
      headers : this.headers}, 
      function(err, response, body){
        if(err)
          console.error(err);
        
        body = JSON.parse(body);
          
        if (body.ok){
          console.log("Added:", body.id);
          return;
        }
        
        console.error(body);
      });
  }
  
  



};






if (process.argv.length<3){
  sys.print('usage: todo command [args]');
  
} else{
  scriptTools.loadConfig(".notesconfig", function(conf){
    /* Setup globals */
    if (conf.user && conf.pwd && conf.host && conf.database)
      conf.db_uri = "http://" + conf.user + ":" + conf.pwd + "@" + conf.host + "/" + conf.database;
    else {
      console.err("Config needs user, pwd, host and database")
      return;
    }
    
    conf.headers = {accept:'application/json', 'content-type':'application/json'}
    
    if (commands[process.argv[2]]){
      var op = scriptTools.optParse(process.argv.slice(2));
      conf['flags'] = op[0]
      commands[process.argv[2]].apply(conf, op[1]);
    } else {
      console.log('Unknown command');
    } 
  }); 
}


