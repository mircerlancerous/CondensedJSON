<?php
class CondensedJSON{
	public function CondensedJSON(){}
	public static function encodeJSON($inObj){
		$newObj = CondensedJSON::copyObject($inObj);
		$foundArr = FALSE;
		if(CondensedJSON::checkProperty($newObj)){
			$newObj = CondensedJSON::compressArray($newObj);
			$foundArr = TRUE;
		}
		else{
			$properties = get_object_vars($newObj);
			foreach($properties as $property => $value){
				if(!CondensedJSON::checkProperty($newObj->$property)){
					continue;
				}
				//this is an appropriate array so compress it
				$newObj->$property = CondensedJSON::compressArray($newObj->$property);
				$foundArr = TRUE;
			}
		}
		if($foundArr){
			return "C".json_encode($newObj);
		}
		return json_encode($newObj);
	}
	public static function decodeJSON($jsonStr){
		//if the first character is not a 'C' then this is regular JSON
		$firstChar = substr($jsonStr,0,1);
		if($firstChar != 'C'){
			return json_decode($jsonStr);
		}
		$jsonStr = substr($jsonStr,1);
		$inObj = json_decode($jsonStr);
		if(CondensedJSON::checkProperty($inObj)){
			$inObj = CondensedJSON::uncompressArray($inObj);
		}
		else{
			$properties = get_object_vars($inObj);
			foreach($properties as $property => $value){
				if(!CondensedJSON::checkProperty($inObj->$property,FALSE)){
					continue;
				}
				//this is an appropriate array so uncompress it
				$inObj->$property = CondensedJSON::uncompressArray($inObj->$property);
			}
		}
		return $inObj;
	}
	private static function convertArrayToObject($inArr){
		$outObj = new stdClass();
		foreach($inArr as $key => $item){
			$outObj->$key = $item;
		}
		return $outObj;
	}
	private static function checkProperty($property,$compress=TRUE){
		if(!is_array($property)){
			return FALSE;
		}
		//if the array is empty or just one row then skip it
		if(sizeof($property) < 2){
			return FALSE;
		}
		//check if this is a 2d array.  Skip if not
	/*	reset($property);
		$firstKey = key($property);
		if(!is_array($property[$firstKey])){
			return FALSE;
		}
		//if we're uncompressing fewer checks are possible/required
		if(!$compress){
			return TRUE;
		}
		//if the root array isn't numeric then skip
		if(!is_numeric($firstKey)){
			return FALSE;
		}
		//if the array has numeric keys (is not an associative array), then skip it
		reset($property[$firstKey]);
		$firstKey = key($property[$firstKey]);
		if(is_numeric($firstKey) && $firstKey == 0){
			return FALSE;
		}*/
		return TRUE;
	}
	public static function compressArray($inArr){
		if(!array_key_exists(0,$inArr)){
			return $inArr;
		}
		$keys = array();
		foreach($inArr[0] as $key => $item){
		    $keys[] = $key;
		}
		$final = array($keys);
		foreach($inArr as $rowArr){
		    $row = array();
		    foreach($rowArr as $item){
		        $row[] = $item;
		    }
		    $final[] = $row;
		}
		return $final;
	}
	public static function uncompressArray($inArr){
		$original = array();
		for($i=1; $i<sizeof($inArr); $i++){
		    $row = array();
		    foreach($inArr[0] as $v => $key){
		        $row[$key] = $inArr[$i][$v];
		    }
		    $original[] = $row;
		}
		return $original;
	}
	private static function copyObject($inObj){
		return json_decode(json_encode($inObj));
	}
}
?>
