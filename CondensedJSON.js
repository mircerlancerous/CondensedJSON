var CJSON = (function(){
	var self = (function(){
		return {
			
			checkProperty: function(property){
				if(!Array.isArray(property)){
					return false;
				}
				//if the array is empty or just one row then skip it
				if(property.length < 2){
					return false;
				}
				//check all properties and skip if none are arrays or objects
			/*	var found = false;
				for(var i=0; i<property.length; i++){
					if(typeof(property[i]) === 'object'){
						found = true;
						break;
					}
				}
				if(!found){
					return false;
				}*/
				return true;
			},
			
			compressArray: function(inArr){
				if(typeof(inArr[0]) === 'undefined'){
					return inArr;
				}
				var keys = Object.getOwnPropertyNames(inArr[0]);
				var finalArr = [];
				finalArr[0] = keys;
				for(var i=0; i<inArr.length; i++){
					var tempArr = [];
					if(inArr[i] !== null){
						for(var v=0; v<keys.length; v++){
							if(typeof(inArr[i][keys[v]]) !== 'undefined'){
								tempArr[v] = inArr[i][keys[v]];
							}
							else{
								tempArr[v] = null;
							}
						}
					}
					else{
						tempArr = null;
					}
					finalArr[i+1] = tempArr;
				}
				return finalArr;
			},
			
			uncompressArray: function(inArr){
				var original = new Array();
				var keys = inArr[0];
				for(var i=1; i<inArr.length; i++){
					var row = new Object();
					if(inArr[i] !== null){
						for(var v=0; v<keys.length; v++){
							var key = keys[v];
							if(typeof(inArr[i][v]) !== 'undefined'){
								row[key] = inArr[i][v];
							}
							else{
								row[key] = null;
							}
						}
					}
					else{
						row = null;
					}
					original[i-1] = row;
				}
				return original;
			}
		};
	})();
	
	return {
		stringify: function(inObj){
			return this.encodeJSON(inObj);
		},
		
		//note that this function alters inObj if appropriate arrays found as properties
		encodeJSON: function(inObj){
			var foundArr = false;
			var newObj = this.copyObject(inObj);
			if(self.checkProperty(newObj)){
				newObj = self.compressArray(newObj);
				foundArr = true;
			}
			else{
				var properties = Object.getOwnPropertyNames(newObj);
				for(var i=0; i<properties.length; i++){
					if(!self.checkProperty(newObj[properties[i]])){
						continue;
					}
					newObj[properties[i]] = self.compressArray(newObj[properties[i]]);
					foundArr = true;
				}
			}
			if(foundArr){
				return "C"+JSON.stringify(newObj);
			}
			return JSON.stringify(newObj);
		},
		
		parse: function(jsonStr){
			return this.decodeJSON(jsonStr);
		},
		
		decodeJSON: function(jsonStr){
			if(!jsonStr){
				return null;
			}
			//if the first character is not a 'C' then this is regular JSON
			var firstChar = jsonStr.substring(0,1);
			if(firstChar != 'C'){
				var inObj = JSON.parse(jsonStr);
				//if the first property is a zero - array index
				if(typeof(inObj[0]) !== 'undefined'){
					//set the length property of the object - in case it wasn't parsed to an array
					inObj.length = Object.getOwnPropertyNames(inObj).length;
				}
				return inObj;
			}
			jsonStr = jsonStr.substring(1);
			var inObj = JSON.parse(jsonStr);
			if(self.checkProperty(inObj)){
				inObj = self.uncompressArray(inObj);
			}
			else{
				var properties = Object.getOwnPropertyNames(inObj);
				for(var i=0; i<properties.length; i++){
					if(!self.checkProperty(inObj[properties[i]])){
						continue;
					}
					inObj[properties[i]] = self.uncompressArray(inObj[properties[i]]);
				}
			}
			return inObj;
		},
		
		copyObject: function(obj){
			return JSON.parse(JSON.stringify(obj));
		}
	};
})();
