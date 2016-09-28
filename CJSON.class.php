<?php
class CJSON{
	public function CJSON(){}
	public static function stringify($inObj){
		return CJSON::encode($inObj);
	}
	public static function encode($inObj){
		$newObj = CJSON::copyObject($inObj);
		$foundArr = FALSE;
		$head = "C";
		
		if(CJSON::checkProperty($newObj)){
			$newObj = CJSON::compressArray($newObj);
			$foundArr = TRUE;
		}
		else{
			$properties = @get_object_vars($newObj);
			if($properties){
				foreach($properties as $property => $value){
					if(!CJSON::checkProperty($newObj->$property)){
						continue;
					}
					if($head != "C"){
						$head .= ",";
					}
					$head .= $property;
					//this is an appropriate array so compress it
					$newObj->$property = CJSON::compressArray($newObj->$property);
					$foundArr = TRUE;
				}
			}
		}
		if($foundArr){
			return $head.json_encode($newObj);
		}
		return json_encode($newObj);
	}
	public static function parse($jsonStr){
		return CJSON::decode($jsonStr);
	}
	public static function decode($jsonStr){
		//if the first character is not a 'C' then this is regular JSON
		$firstChar = substr($jsonStr,0,1);
		if($firstChar != 'C'){
			return json_decode($jsonStr);
		}
		$pos = strpos($jsonStr,"{");
		$pos2 = strpos($jsonStr,"[");
		if(($pos === FALSE && $pos2 !== FALSE) || ($pos2 !== FALSE && $pos2 < $pos)){
			$pos = $pos2;
		}
		$mapData = explode(",",substr($jsonStr,1,$pos-1));
		$jsonStr = substr($jsonStr,$pos);
		$inObj = json_decode($jsonStr);
		if(CJSON::checkProperty($inObj,FALSE)){
			$inObj = CJSON::uncompressArray($inObj);
		}
		else{
			$properties = @get_object_vars($inObj);
			if($properties){
				foreach($properties as $property => $value){
					if(!CJSON::checkProperty($inObj->$property,FALSE)){
						continue;
					}
					if(!in_array($property,$mapData)){
						continue;
					}
					//this is an appropriate array so uncompress it
					$inObj->$property = CJSON::uncompressArray($inObj->$property);
				}
			}
		}
		return $inObj;
	}
	
	private static function checkProperty($property,$compress=TRUE){
		if(!is_array($property) && !is_object($property)){
			return FALSE;
		}
		//if the array is empty or just one row then skip it
		if(sizeof($property) < 2){
			return FALSE;
		}
		//check if this is a 2d array.  Skip if not
		reset($property);
		$firstKey = key($property);
		if(!is_array($property[$firstKey]) && !is_object($property[$firstKey])){
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
		}
		return TRUE;
	}
	public static function compressArray($inArr){
		$keys = array();
		$tempArr = array();
		if(!is_array($inArr[0])){
			$tempArr = $inArr[0];
		}
		else{
			$tempArr = @get_object_vars($inArr[0]);
		}
		if(!$tempArr){
			return $inArr;
		}
		foreach($tempArr as $key => $item){
			$keys[] = $key;
		}
		if(!$keys){
			return $inArr;
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
