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
  , scriptTools = require('scriptTools')
  , querystring = require('querystring');

var loadDB = function(opts, cb){
  var h = {accept:'application/json', 'content-type':'application/json'}
    , uri = "http://" + opts.user + ":" + opts.pwd + "@" + opts.host + "/" + opts.database;
  request({uri: uri, headers:h}, function(err, response, body){
    console.log(err,response, body);
  });
}


var jsonResp = function(cb){
  var resp = function(err, response, body){
      if (err){
        console.error(err);
        return;
      }
      
      body = JSON.parse(body);
      if(body.error){
        console.error(body.error);
        return;
      }
      
      cb(body)
        
    } 

  return resp;
}

var post = function(conf, url, data, cb){
  request({
    uri : conf.db_uri + url,
    headers : conf.headers,
    body : JSON.stringify(data),
    method:'POST'
    }, jsonResp(cb)); 
}



var slugify = function(title){
}

var getItem = function(conf, id, cb){
  request({
    uri : conf.db_uri + "/" + id,
    h :conf.headers
    }, jsonResp(cb));
}


var postTask = function(conf, task, cb){
  post(conf, '', task, cb);
}



var commands = {  
  help : function(){
    console.log('See readme.txt');
  },

/*********
Add a task
**********/  
  add : function(){
    var args = Array.prototype.slice.call(arguments, 1)
      , todo_obj = {
          title : args.join(" "),
          class : ['task'],
          created : new Date().toISOString(),
          modified : new Date().toISOString(),
        };
    
    postTask(this, todo_obj, function(body){
      console.log("Added:", body.id);
    });
  },
  
/***********
List Tasks
************/  
  ls : function(){
    var colors = {
			0 : "\033[1;31;40m",
			1 : "\033[1;33;40m",
			2 : "\033[1;36;40m",
			3 : '\033[1;34;40m',
			4 : "\033[0;0;0m" // default
	   }
  
  
  
    var query = {};
    
    if (!this.opts['-a']){
      // Finish before completed items (first key seg is complete)
      query['endkey'] = "[true]"
    }
      
    request({
      uri : this.db_uri + "/_design/database/_view/list-todo?" + querystring.stringify(query),
      headers : this.headers,
      }, jsonResp(function(body){
        for (var i in body.rows){
          var item = body.rows[body.rows.length - i -1] //Reverse
            , fmtd = "";
            
          if (item.value.completed)
            fmtd += "X "
          else
            fmtd += "  "   
            
            
          fmtd += item.value._id + ": " + item.value.title;  
          //console.log(item);
          
          console.log(colors[item.key[1]], fmtd,  colors[4]);
        }          
    }));
  },
  
/**************
  Do a task
***************/
  'do' : function(){
    var item_id = arguments[1]
      , conf = this;
    
    getItem(conf, item_id, function(item){
      item['completed'] = new Date().toISOString();
      postTask(conf, item, function(){});
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
      conf['opts'] = op[0]
      commands[process.argv[2]].apply(conf, op[1]);
    } else {
      console.log('Unknown command');
    } 
  }); 
}


