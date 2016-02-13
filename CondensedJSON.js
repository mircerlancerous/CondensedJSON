function CondensedJSON(){
	//note that this function alters inObj if appropriate arrays found as properties
	this.encodeJSON = function(inObj){
		var foundArr = false;
		var newObj = this.copyObject(inObj);
		if(this.checkProperty(newObj)){
			newObj = this.compressArray(newObj);
			foundArr = true;
		}
		else{
			var properties = Object.getOwnPropertyNames(newObj);
			for(var i=0; i<properties.length; i++){
				if(!this.checkProperty(newObj[properties[i]])){
					continue;
				}
				newObj[properties[i]] = this.compressArray(newObj[properties[i]]);
				foundArr = true;
			}
		}
		if(foundArr){
			return "C"+JSON.stringify(newObj);
		}
		return JSON.stringify(newObj);
	};
	this.decodeJSON = function(jsonStr){
		if(!jsonStr){
			return null;
		}
		//if the first character is not a 'C' then this is regular JSON
		var firstChar = jsonStr.substring(0,1);
		if(firstChar != 'C'){
			var inObj = JSON.parse(jsonStr);
			//if the first property is a zero
			if(typeof(inObj[0]) !== 'undefined'){
				//set the length property of the object
				inObj.length = Object.getOwnPropertyNames(inObj).length;
			}
			return inObj;
		}
		jsonStr = jsonStr.substring(1);
		var inObj = JSON.parse(jsonStr);
		if(this.checkProperty(inObj)){
			inObj = this.uncompressArray(inObj);
		}
		else{
			var properties = Object.getOwnPropertyNames(inObj);
			for(var i=0; i<properties.length; i++){
				if(!this.checkProperty(inObj[properties[i]])){
					continue;
				}
				inObj[properties[i]] = this.uncompressArray(inObj[properties[i]]);
			}
		}
		return inObj;
	};
	this.checkProperty = function(property){
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
	};
	this.compressArray = function(inArr){
		if(typeof(inArr[0]) === 'undefined'){
			return inArr;
		}
		var keys = Object.getOwnPropertyNames(inArr[0]);
		var finalArr = new Array();
		finalArr[0] = keys;
		for(var i=0; i<inArr.length; i++){
			var tempArr = new Array();
			for(var v=0; v<keys.length; v++){
				tempArr[v] = inArr[i][keys[v]];
			}
			finalArr[i+1] = tempArr;
		}
		return finalArr;
	};
	this.uncompressArray = function(inArr){
		var original = new Array();
		var keys = inArr[0];
		for(var i=1; i<inArr.length; i++){
			var row = new Object();
			for(var v=0; v<keys.length; v++){
				var key = keys[v];
				row[key] = inArr[i][v];
			}
			original[i-1] = row;
		}
		return original;
	};
	this.copyObject = function(obj){
		return JSON.parse(JSON.stringify(obj));
	}
}
