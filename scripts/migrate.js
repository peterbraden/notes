var req = require('request');


req({uri: 'http://localhost:5984/todo/0',
	headers: {accept:'application/json', 'content-type':'application/json'}
	},
	function(err, resp, body){
		//console.log(JSON.parse(body)["content"]); 
		for(var i in JSON.parse(body)["content"]){
			var x = JSON.parse(body)["content"][i]
		
		
			var tdo = {
				_id : x['index'] + "",
				added : x['added'],
				class : ['task'],
				created : x['added'],
				modified : x['added'],
				title : x['name']
			}
			if (x.importance != undefined)
				tdo.importance = x.importance
			
			if (x.tags && x.tags.indexOf('goal') >-1)
				tdo.class.push('goal')
			
			if (x.tags)
				tdo.tags = x.tags
			if (x.done)
				tdo.completed = x['added'] || new Date().toISOString();	
			if (x.deleted)
				tdo.deleted = x.deleted
			
			console.log(x, tdo);
			req({uri : 'http://localhost:5984/notes', method:'POST', body : JSON.stringify(tdo), headers: {accept:'application/json', 'content-type':'application/json'}}, function(err, resp, body){console.log(err, resp, body);})
		
			
			
		}	
		
			
});