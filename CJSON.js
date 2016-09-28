
var CJSON = (function(){
    var self = (function(){
		return {
			
			checkProperty: function(property, compress){
				if((!Array.isArray(property) && typeof(property) !== 'Object') || !property){
					return false;
				}
				//if the array is empty or just one row then skip it
				if(property.length < 2){
					return false;
				}
				//if we're uncompressing fewer checks are possible/required
				if(typeof(compress) === 'boolean' && !compress){
					return true;
				}
				//check all properties and skip if none are objects
				var found = false;
				for(var i=0; i<property.length; i++){
					if(typeof(property[i]) === 'object' && !Array.isArray(property[i])){
						found = true;
						break;
					}
				}
				if(!found){
					return false;
				}
				
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
				var original = [];
				var keys = inArr[0];
				for(var i=1; i<inArr.length; i++){
					var row = {};
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
						break;
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
			var head = "C";
			
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
					if(head != "C"){
						head += ",";
					}
					head += properties[i];
					newObj[properties[i]] = self.compressArray(newObj[properties[i]]);
					foundArr = true;
				}
			}
			if(foundArr){
				return head+JSON.stringify(newObj);
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
				if(!Array.isArray(inObj) && typeof(inObj[0]) !== 'undefined'){
					//set the length property of the object - in case it wasn't parsed to an array
					inObj.length = Object.getOwnPropertyNames(inObj).length;
				}
				return inObj;
			}
			
			var pos = jsonStr.search("{");
			var pos2 = jsonStr.search("\\[");
			if((pos === -1 && pos2 !== -1) || (pos2 !== -1 && pos2 < pos)){
				pos = pos2;
			}
			var mapData = jsonStr.substring(1,pos).split(",");
			
			jsonStr = jsonStr.substring(pos);
			var inObj = JSON.parse(jsonStr);
			if(self.checkProperty(inObj,false)){
				inObj = self.uncompressArray(inObj);
			}
			else{
				var properties = Object.getOwnPropertyNames(inObj);
				for(var i=0; i<properties.length; i++){
					if(!self.checkProperty(inObj[properties[i]],false)){
						continue;
					}
					if(mapData.indexOf(properties[i]) == -1){
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
