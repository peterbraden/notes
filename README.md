# Notes

Notes is a bunch of tools to organise life.

### Command line todo tool
	
	$> todo add Buy bacon
	Added: e53c0e66d62b946d2899a45a2c00183f
	
	$> todo add Take over world
	Added: e53c0e66d62b946d2899a45a2c002fa4

	$> todo importance bacon 0

	$> todo ls 
 	  2fa4 - Take over world
 	  183f - Buy bacon
 
 	$> todo add Conquer panama
 	Added : e53c0e66d62b946d2899a45a2c004gd3
 
 	$> todo pre world panama
 	
 	$> todo ls 
 	  2fa4 - Take over world (1 sub)
 	  183f - Buy bacon

	$> todo open world
	$> todo ls 
 	  2fa4 - Take over world
 	      4gd3 - Conquer Panama
 	  183f - Buy bacon
	
	$> todo close world
 
	$> todo do 183f
	
	$> todo ls
	  2fa4 - Take over world (1 sub)

	$> todo rm world
	
	$>











>>>> Below are developer notes. Ignore :)

Notes Notes:

Couchdb - documents
	-  documents are nested info
		- nesting can reference other docs
			- nested id syntax: *(id)
			- editor will autocomplete and
              load in document
 			- Json symbols are keyboard shortcuts to editor 
	- Instead of type use class/tags to determine 
	- Document children are open or closed - determines which todo items to show etc.



Search by id -> id slugified title
compile to json
json database for backup


Sync w' Evernote
Sync w' Delicious bookmarks
(Sync w' browser bookmarks)
Command line todo list access
(Sync w' Gcal)
(Contacts list)
Sync Instapaper
Sync Kindle



== Steps:

/ - node.js command line todo
	X update node
    X install npm
    D couchdb library (use request)
	X Commandline args
	X Config load
	X Publish node-script-tools
	D load DB (no need) 

    X add
    X ls
    X do
    X rm
    X importance
	X fuzzy id matching
    X tag
    X curr
    X pre
	X open
	X close
	
 - Delicious syncing 
 - html editor page
 	X Nested list to json
	o Json to nested list

 D Evernote syncing
 	: The evernote api is a piece of crap. Thrift, and xml.

