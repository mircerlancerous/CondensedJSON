/*
Copyright 2016 OffTheBricks - https://github.com/mircerlancerous/CondensedJSON
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;
using System.Reflection;

namespace MyAdmin.Classes
{
	public class CJSON
	{
		#region public alias methods

		public static string stringify(dynamic obj)
		{
			return encodeJSON(obj);
		}

		public static dynamic parse(string json)
		{
			return decodeJSON(json);
		}

		#endregion

		#region public methods

		public static string encodeJSON(dynamic inObj)
		{
			dynamic newObj;
			bool foundArr = false;
			string head = "C";

			if (CheckArrayProperty(inObj))
			{
				newObj = CompressArray(CopyObject(inObj));
				foundArr = true;
			}
			else if(inObj.GetType() == typeof(Newtonsoft.Json.Linq.JObject))
			{
				newObj = new Dictionary<string,dynamic>();
				List<string> properties = GetObjectProperties(inObj);
				int i = -1;
				foreach (Newtonsoft.Json.Linq.JProperty obj in inObj)
				{
					i++;
					if (!CheckArrayProperty(obj.Value))
					{
						newObj[properties[i]] = obj.Value;
						continue;
					}
					if (head != "C")
					{
						head += ",";
					}
					head += properties[i];
					newObj[properties[i]] = CompressArray(obj.Value);
					foundArr = true;
				}
			}
			else
			{
				newObj = CopyObject(inObj);
			}

			if (foundArr)
			{
				return head + JsonConvert.SerializeObject(newObj);
			}
			return JsonConvert.SerializeObject(newObj);
		}

		public static dynamic decodeJSON(string json)
		{
			if (json.Length == 0)
			{
				return null;
			}
			//if the first character is not a 'C' then this is regular JSON
			string firstChar = json.Substring(0, 1);
			if (firstChar != "C")
			{
				return JsonConvert.DeserializeObject<dynamic>(json);
			}

			int pos = json.IndexOf("{");
			int pos2 = json.IndexOf("[");
			if((pos == -1 && pos2 != -1) || (pos2 != -1 && pos2 < pos)){
				pos = pos2;
			}
			var mapData = json.Substring(1, pos-1).Split(',').ToList<string>();
			json = json.Substring(pos);
			dynamic inObj = JsonConvert.DeserializeObject<dynamic>(json);
			dynamic newObj;
			if (CheckArrayProperty(inObj, false))
			{
				newObj = UncompressArray(inObj);
			}
			else
			{
				List<string> properties = GetObjectProperties(inObj);
				newObj = new Dictionary<string, dynamic>();
				int i = -1;
				foreach (Newtonsoft.Json.Linq.JProperty obj in inObj)
				{
					i++;
					if (!CheckArrayProperty(obj.Value,false))
					{
						newObj[properties[i]] = obj.Value;
						continue;
					}
					if (mapData.IndexOf(properties[i]) == -1)
					{
						newObj[properties[i]] = obj.Value;
						continue;
					}
					newObj[properties[i]] = UncompressArray(obj.Value);
				}
			}

			return newObj;
		}

		#endregion

		#region private methods

		private static bool CheckArrayProperty(dynamic obj, bool compress=true)
		{
			System.Type objType = obj.GetType();

			if (objType != typeof(Newtonsoft.Json.Linq.JArray))
			{
				return false;
			}

			var inArr = (Newtonsoft.Json.Linq.JArray) obj;

			//if the array is empty or just one row then skip it
			if (inArr.Count < 2)
			{
				return false;
			}
			//if we're uncompressing fewer checks are possible/required
			if (!compress)
			{
				return true;
			}
			//check all properties and skip if none are objects
			bool found = false;
			for (int i = 0; i < inArr.Count; i++)
			{
				objType = inArr[i].GetType();
				if (objType == typeof(Newtonsoft.Json.Linq.JObject))
				{
					found = true;
					break;
				}
			}
			if (!found)
			{
				return false;
			}
			return true;
		}
		
		private static List<string> GetObjectProperties(Newtonsoft.Json.Linq.JObject obj)
		{
			List<string> outlist = new List<string>();

			var list = obj.Properties();
			foreach (var key in list)
			{
				outlist.Add(key.Name);
			}

			return outlist;
		}
		
		private static List<dynamic> CompressArray(dynamic inArr)
		{
			List<dynamic> outlist = new List<dynamic>();
			List<string> firstIdx = GetObjectProperties(inArr[0]);
			outlist.Add(firstIdx);
			foreach (Newtonsoft.Json.Linq.JObject obj in inArr)
			{
				List<dynamic> valueIdx = new List<dynamic>();
				foreach (string prop in firstIdx)
				{
					valueIdx.Add(obj.Property(prop).Value);
				}
				outlist.Add(valueIdx);
			}
			return outlist;
		}

		private static List<dynamic> UncompressArray(dynamic inArr)
		{
			List<dynamic> original = new List<dynamic>();
			Newtonsoft.Json.Linq.JArray keys = null;
			foreach (Newtonsoft.Json.Linq.JArray arr in inArr)
			{
				if (keys == null)
				{
					keys = arr;
					continue;
				}
				if (arr == null)
				{
					//failsafe in case of errors
					break;
				}
				var row = new Dictionary<string, dynamic>();
				int i = 0;
				foreach (string key in keys)
				{
					if(arr[i] != null)
					{
						row.Add(key, arr[i]);
					}
					else
					{
						row.Add(key,null);
					}
					i++;
				}
				original.Add(row);
			}
			return original;
		}

		private static dynamic CopyObject(dynamic inObj)
		{
			string str = JsonConvert.SerializeObject(inObj);
			return JsonConvert.DeserializeObject<dynamic>(str);
		}

		#endregion
	}
}
