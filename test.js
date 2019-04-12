var config = {
    meta : {
        desc : "Bicycle validator example",
        keywords : {
            any : "^ANY",
            or : "_or_",
            notRequired : "^_",
            comment : " - .*$"
        }
    },
    types : {},
    schema : {
        ANY : {
             id : "number - required parameter",
             _name : "string - not required, but can be",
             a_or_b_or_c : "string - need one of them",
             e_or_d : "string - or them",
             _list : ["string","number","string - list with types in this order"],
             _list_etc : ["string","number - repeated list with spectype ...", "..."],
             _st : "anything - any field",
             _anyobj : {ANY : "anything - object with any content"}
        }
    }

}
var sample = {
    req : {
        ids : 10,
        name : "test required fields",
        b : "ok",
        },
    lists : {
        id : 1,
        name : "test valid lists",
        a : "a", e : "e",
        list : ["a",1,"b"],
        list_etc : ["a",1,"b",2]
    },
    lists_iv : {
        id : 2,
        name : "test invalid lists",
        a : "a", e : "e",
        list : [1,2,3],
        list_etc : ["a", 1, 2, 3]
    },
    anytest : {
        id : 3,
        name : "test anything valud",
        a : "a", e : "e",
        anyobj : {any : "object", arr : [1,2,3], obj : {a:5, b:6}},
        st : "something else"
    },
    anytest_iv : {
        id : 4,
        name : "test anything invalid",
        a : "a", e : "e",
        anyobj : "this in not obj",
        st : [1,2,3,"valid anyway"]
    }
}

var log = function(s) {console.log(s);}
var Valid = require("./bvalid");
var v = new Valid(sample, config);

var ret = v.valid();
log(ret);
