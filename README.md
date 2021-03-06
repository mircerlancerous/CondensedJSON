This project has been replaced by [something better](https://github.com/offthebricks/LOEN), and will no longer be developed.

# CondensedJSON
Condense your JSON prior to transmitting or zipping. Classes for PHP, C#.Net, and JavaScript make this an excellent client server tool to increase speed and bandwidth efficiency.

JSON (331 characters):

    [{"id":1,"abbreviation":"appl","name":"Apple"},
    {"id":2,"abbreviation":"pear","name":"Pear"},
    {"id":3,"abbreviation":"bana","name":"Banana"},
    {"id":4,"abbreviation":"bkby","name":"Blackberry"},
    {"id":5,"abbreviation":"strw","name":"Stawberry"},
    {"id":5,"abbreviation":"pech","name":"Peach"},
    {"id":6,"abbreviation":"plum","name":"Plum"}]

CJSON (172 characters):

    C[["id","abbreviation","name"],
    [1,"appl","Apple"],
    [2,"pear","Pear"],
    [3,"bana","Banana"],
    [4,"bkby","Blackberry"],
    [5,"strw","Stawberry"],
    [5,"pech","Peach"],
    [6,"plum","Plum"]]

Supports arrays at the first and second levels of an object. If there are arrays in objects that are in objects that are properties of the primary object (or deeper), then they won't be compressed. Note also that it will only compress arrays at one level or the other, not both.


PHP Usage:

    //$obj == some object
    include_once("CJSON.class.php");
    $CJSONStr = CJSON::stringify($obj);
    $obj = CJSON::parse($CJSONStr);

JavaScript Usage:

    //obj == some object
    var CJSONStr = CJSON.stringify(obj);
    obj = CJSON.parse(CJSONStr);

C#.Net Usage:

    //obj == some object
    string CJSONStr = CJSON.stringify(obj);
    obj = CJSON.parse(CJSONStr);

Note that the C# class requires [JSON.Net](http://www.newtonsoft.com/json) to be a project reference.
