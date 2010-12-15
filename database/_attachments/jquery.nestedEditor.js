/***************************
=== JQuery Nested Editor ===
Author: Peter Braden <peterbraden@peterbraden.co.uk>

A widget for the editing of hierarchical information in the form of nested lists

$('#myId').nestedEditor()

...

$('#myId').nestedEditor('getJSON')

****************************/

(function($){
	var nestedEditor = {
		
		createItem : function(text){
			var text = text || ""
				, add = $("<a href = '#' class='addSub'>&rarr;</a>");
				
			if (!text)
				add.hide();
			
			return $("<li />")
				.append("<span class='val hidden' >" + text + "</span>")
				.append($("<input class='editItem' value='" + text + "'type='text'>&nbsp;"))
				.append(add)

			},
			
		editItem : function(){
			var _t = $(this)
				, val = _t.children('.val').first()
				, input = _t.children('input').first()

			val.hide()
			input.val(val.text())
			input.show()
			input.focus()
		},

		showItem : function(){
			var _t = $(this)
				, val = _t.children('.val').first()
				, input = _t.children('input').first()
		
			input.hide()
			val.text(input.val())
			if (!input.val())
				_t.children('.addSub').first().hide();
			else
				_t.children('.addSub').first().show();	
			val.show()
		},

		createSub : function(noclick){
			var currList = $(this)
				,	newList = $("<ul />")
				, newItem = $("<li class='al'><a class='add' href = '#'>+</a></li>");
			
			newList.append(newItem);
			currList.append(newList);
			if(!noclick){
				newItem.children('a').trigger('click');
			}	
			return newList;
		},
	
		getObj : function(parent){
			var out = [];
			
			if (parent.is('ul')){
				parent.children('li').each(function(){
					if ($(this).children('.val').is('*')){
						if ($(this).children('ul').is('*')){
							var x = {}
							x[$(this).children('.val').text()] = nestedEditor.getObj($(this).children('ul').first())
							out.push(x);
						}
						else{
							out.push($(this).children('.val').text());
						}
					}
				});
				
				return out
			}
			return []
		},

		getJSON : function(parent){
			return JSON.stringify(nestedEditor.getObj(parent));
		},
		
		putJSON : function(json, parent){
			var lis = nestedEditor.createSub.apply(parent, [true]);
			nestedEditor.putObj(JSON.parse(json), lis);
		},
		
		isArray : function(value) {
   			return Object.prototype.toString.call(value) === "[object Array]";
  		},
  		
		putObj : function(obj, parent){
			if (typeof(obj) == 'string'){
				var x = nestedEditor.createItem(obj);
				parent.prepend(x);
				nestedEditor.showItem.apply(x);
				return x
			} else if (nestedEditor.isArray(obj)){
				for (var x = obj.length-1; x >=0; x--){
					nestedEditor.putObj(obj[x], parent)						
				}
			} else {
				for (var k in obj){
					var sub = nestedEditor.putObj(k, parent)
					sub.children('a.addSub').remove();
					var lis = nestedEditor.createSub.apply(sub, [true]);
					nestedEditor.putObj(obj[k], lis)
				}
			}	
		}
	
	};


	$('.nestedEditor .editItem').live('blur', function(){
		nestedEditor.showItem.apply($(this).parent());
	});
	
	$('.nestedEditor .editItem').live('keydown', function(e){
		var kc = e.keyCode || e.which; 
	
		if (kc == 9 ){ //TAB
			e.preventDefault()
			$(this).blur().parent().find('.addSub').first().click();
			return false;	
		}	
		
		if (kc == 13){ //ENTER
			$(this).blur().parent().parent().find('>li>.add').click();
			return false;
		}
		
		if (kc == 8){ //DELETE
			if (!$(this).val()){
				if($(this).parent().parent().children('li').length > 2){
					$(this).parent().remove();
				} else {
					$(this).parent().parent().parent().append("<a href = '#' class='addSub'>&rarr;</a>")
					$(this).parent().parent().remove()
				}	
			}
		}
		
	});
	
	$('.nestedEditor li').live('edit.nestedEditor', function(e){
		nestedEditor.editItem.apply(this);
		e.stopPropagation();
		return false;
	});
	
	$('.nestedEditor li').live('click.nestedEditor', function(e){
		if($(this).children('.val').first().is(':visible')){
			$(this).trigger('edit');
		}
		e.stopPropagation();
		return false;
	})
	
	
	
	$('.nestedEditor .val').live('click.nestedEditor', function(){
		$(this).parent().trigger('edit');
	})
	
	
	$('.nestedEditor .add').live('click.nestedEditor', function(){
		
		var newItem = nestedEditor.createItem();
		$(this).parent().before(newItem)
		newItem.children('input').trigger('focus');
		
		return false;
	});
	
	
	$('.nestedEditor .addSub').live('click.nestedEditor', function(e){
		nestedEditor.createSub.apply($(this).parent())
		//Remove link
		$(this).remove();
	
		return false;
	});



	$.fn.nestedEditor = function(method) {
		var args = arguments
		
		if (method){
			if (method === 'getJSON'){
				return nestedEditor.getJSON(this.children('ul'));
			}
			
			if (method === 'putJSON'){
				$(this).each(function(){
					$(this).addClass('nestedEditor');
					nestedEditor.putJSON(args[1] || '[]', $(this))
				});
				return this;
			}
				
		}
		
		this.each(function(){
			$(this).addClass('nestedEditor');
			nestedEditor.createSub.apply(this);
			
		});
		return this;
	};
	
})(jQuery);
