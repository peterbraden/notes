/*
* 				todo.js
* Notes todo app command line access

usage:

%> todo add Take over world
id 2fa4

$> todo ls
 183f. Buy bacon
 2fa4. Take over world
 
$> todo do 183f




*/

var sys = require('sys');



var commands = {
	
	help : function(){
		sys.print('See readme.txt');
	}


};








if (process.argv.length<3){
	sys.print('usage: todo command [args]');
} else{
	if (commands[process.argv[2]]){
		commands[process.argv[2]](process.argv);
	} else {
		sys.print('Unknown command');
	}	
}
sys.print('\n');


