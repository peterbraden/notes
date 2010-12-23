/*
*		 todo.js
* Notes todo app command line access

usage:

%> todo add Take over world
id 2fa4

$> todo ls
 183f. Buy bacon
 2fa4. Take over world
 
$> todo do 183f




*/

var request = require('request')
  , scriptTools = require('scriptTools')
  , querystring = require('querystring');


Date.prototype.toLocalISOString = function(){
	// ISO 8601
	var d = this
		, pad = function (n){return n<10 ? '0'+n : n}
		, tz = d.getTimezoneOffset() //mins
		, tzs = (tz>0?"-":"+") + pad(parseInt(tz/60))
	
	if (tz%60 != 0)
		tzs += pad(tz%60)
	
	if (tz === 0) // Zulu time == UTC
		tzs = 'Z'
		
	 return d.getFullYear()+'-'
	      + pad(d.getMonth()+1)+'-'
	      + pad(d.getDate())+'T'
	      + pad(d.getHours())+':'
	      + pad(d.getMinutes())+':'
	      + pad(d.getSeconds()) + tzs
}



var loadDB = function(opts, cb){
  var h = {accept:'application/json', 'content-type':'application/json'}
	, uri = "http://" + opts.user + ":" + opts.pwd + "@" + opts.host + "/" + opts.database;
  request({uri: uri, headers:h}, function(err, response, body){
	console.log(err,response, body);
  });
}

var colors = {
			0 : "\033[1;31;40m",
			1 : "\033[1;33;40m",
			2 : "\033[1;36;40m",
			3 : '\033[1;34;40m',
			bold : "\033[1;32;7m",
			4 : "\033[0;0;0m" // default
	   };


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




var getItem = function(conf, id, cb, all){
  // ==Fuzzy match:
  // 1. Look for id sub in uncomplete tasks
  // 2. Look for segment of task title
  if (all)
	var uri = conf.db_uri + "/_design/database/_view/list-todo"
  else
	var uri = conf.db_uri + "/_design/database/_view/list-todo?endkey=[true]"
  
  request({
	  uri : uri,
	  headers : conf.headers,
	  }, jsonResp(function(body){
		var out = [];
		var textMatch = [];
		
		for (var i in body.rows){
		  if (body.rows[i].id.indexOf(id)>-1){
			out.push(body.rows[i].value);
		  }
		  if (body.rows[i].value.title.indexOf(id)>-1){
			textMatch.push(body.rows[i].value);
		  }
		}
		if (out.length){
		  if (out.length == 1)
			cb(out[0]);
		  else
			console.error("Couldn't find task - nonunique id", out);   
		} else {
		  if (textMatch){
			if (textMatch.length == 1)
			  cb(textMatch[0]);
			else
			  console.error("Couldn't find task - nonunique title");
		  } else {
			console.error("Couldn't find task - nothing matched"); 
		  }
		}
	})
  );


  /*
  // Exact approach - requires typing entire id
  request({
	uri : conf.db_uri + "/" + id,
	h :conf.headers
	}, jsonResp(cb));
  */
}


var postTask = function(conf, task, cb){
  post(conf, '', task, cb);
}



var formatTask = function(conf, item, cb, prefix, sub){	
  var fmtd = ""
	, val = item.value
	, prefix = prefix || '';
	  
  if (!sub && (val.class.indexOf('sub') >-1 && !(conf.opts['--sub'] || conf.opts['-a']))){
		cb();
		return;
  }		
			
  if (val.completed)
	fmtd += "X "
  else{
	if (val.deleted)
	  fmtd += "D "
	else   
	  fmtd += "  "   
  }	
	  
  fmtd += val._id.slice(-4) + ": " + val.title; // TODO - smarter slugify		   
  
  if (val.tags && val.tags.length){
	fmtd += " #" + val.tags.join(", #");
  }
  
  // V Densely nested :)
  if (val.prerequisites && val.prerequisites.length){
		if (val.open){
		  var iter = function(j, out){
				getItem(conf, val.prerequisites[j].slice(1), function(task){
				  formatTask(conf, {value:task}, function(tsk){
						if(j<val.prerequisites.length-1){
						  iter(j+1, out + '\n' + tsk)
						} else {
						  cb(out + '\n' + tsk);
						}
				  }, '	', true);
				}, true);
		  }
		  iter(0, fmtd);
		  return;
		} else {
		  fmtd += " (" + val.prerequisites.length + " sub)";
		}  
  }
  cb(prefix + colors[val.importance==undefined?4:val.importance] + fmtd + colors[4]);
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
		var _this = this;
  
	
		var query = {};
	
		if (!this.opts['-a']){
		  // Finish before completed items (first key seg is complete)
		  query['endkey'] = "[true]"
		}
	  
		request({
		  uri : this.db_uri + "/_design/database/_view/list-todo?" + querystring.stringify(query),
		  headers : this.headers,
		  }, jsonResp(function(body){
	  
				var limind = _this.opts['--limit']?(body.rows.length - parseInt(_this.opts['--limit'])):0;		
		
				var iter = function(i){
				  if (i < body.rows.length){
					formatTask(_this, body.rows[body.rows.length - i -1], function(out){
					  if(out)
						console.log(out);
					  iter(i+1);
					});
				  }  
				}  
				iter(limind);  
		}));
	  },

/*******
* TODAY
* Bring up an agenda, also tasks done today
********/
	today: function(){
		var now = new Date()
			, nows = now.toLocalISOString().slice(0,10)
			, out = []
			, _this = this
			
		request({
			uri : this.db_uri + "/_design/database/_view/list-todo",
			headers : this.headers
			}, jsonResp(function(body){
				for (var i in body.rows){
					var cd = body.rows[i].value.completed
					
					//Fix data bug where completed = true
					if (cd === true) cd = false;
					if(cd && cd.slice(0,10) === nows){ // DONE TODAY
						out.push(body.rows[i].value)		
					}
				}
				
				while(out.length < 5 && body.rows.length){
					var item = body.rows.shift()
					if(!item.key[0] && ! item.value.completed && ! item.value.deleted){
						out.push(item.value)
					}	
				}
				
				console.log(colors['bold'] + "\n===== AGENDA FOR " + nows + " =====" + colors[4])
				for (var i in out){
					formatTask(_this, {value:out[i]}, function(out){
						if(out) console.log(out)	
					}, '')
				}
				console.log("")
			
			})
		)
		
		
		
	},

  
/**************
  Do a task
***************/
  'do' : function(){
	var item_id = Array.prototype.slice.call(arguments, 1).join(" ")
	  , conf = this;
	
	getItem(conf, item_id, function(item){
	  item['completed'] = new Date().toISOString();
	  postTask(conf, item, function(){});
	});  
  },

/**************
  Adjust a task's priority
***************/
  'importance' : function(){
	var item_id = arguments[1]
	  , importance = parseInt(arguments[2])
	  , conf = this;
	
	getItem(conf, item_id, function(item){
	  item['importance'] = importance;
	  postTask(conf, item, function(){});
	});  
  },

  
  
/**************
  Delete a task
***************/
  rm : function(){
	var item_id = arguments[1]
	  , conf = this;
	
	getItem(conf, item_id, function(item){
	  item['deleted'] = new Date().toISOString();
	  postTask(conf, item, function(){});
	});  
  },
  
/**************
  tag a task
***************/
  tag : function(){
	var item_id = arguments[1]
	  , tags = Array.prototype.slice.call(arguments, 2)
	  , conf = this;
	
	getItem(conf, item_id, function(item){
	  item['tags'] = item['tags'] || [];
	  item['tags'] = item['tags'].concat(tags)
	  
	  postTask(conf, item, function(){});
	});  
  },
  
/**********
 Current task
 **********/
  curr : function(){
	this.opts['--limit'] = 1;
	this.opts['--sub'] = true;
	commands.ls.apply(this, arguments)
  },

/***********
 Prerequisite
 
 $> pre x y 
 means y is a prerequisite of x
 **********/  
  pre : function(){
	var item_idx = arguments[1]
	  , item_idy = arguments[2]
	  , conf = this;
	getItem(conf, item_idx, function(itemx){
	  getItem(conf, item_idy, function(itemy){
		itemx.prerequisites = itemx.prerequisites || [];
		itemx.prerequisites.push("*" + itemy._id);
		postTask(conf, itemx, function(){});
		
		itemy.class.push('sub');
		postTask(conf, itemy, function(){});
		
	  });
	});  
	  
  
  },
/**************
  Open subtasks
***************/
  open : function(){
	var item_id = arguments[1]
	  , conf = this;
	
	getItem(conf, item_id, function(item){
	  item['open'] = new Date().toISOString();
	  postTask(conf, item, function(){});
	}, true);  
  },
  
/**************
  Close subtasks
***************/
  close : function(){
	var item_id = arguments[1]
	  , conf = this;
	
	getItem(conf, item_id, function(item){
	  item['open'] = false;
	  postTask(conf, item, function(){});
	}, true);  
  },	
	
  
};






if (process.argv.length<3){
  console.log('usage: todo command [args]');
  
} else{
  scriptTools.loadConfig(".notesconfig", function(conf){
  
	conf.headers = {accept:'application/json', 'content-type':'application/json'}
	var op = scriptTools.optParse(process.argv.slice(2));
	
	if (commands[op[1][0]]){
	  
	  conf['opts'] = op[0]
	  
	  //DEBUG:
	  if (op[0]['--DEBUG'])
		conf['database'] = 'notes-dev'; 
	  
	  /* Setup globals */
	  if (conf.user && conf.pwd && conf.host && conf.database)
		conf.db_uri = "http://" + conf.user + ":" + conf.pwd + "@" + conf.host + "/" + conf.database;
	  else {
		console.err("Config needs user, pwd, host and database")
		return;
	  }
	
	  commands[op[1][0]].apply(conf, op[1]);
	} else {
	  console.log('Unknown command');
	} 
  }); 
}


