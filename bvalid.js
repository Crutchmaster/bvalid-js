var RegExpOrFalse = function(s) {return s ? new RegExp(s) : false}
var logerr = function(s) {console.error(s);}
var log = function(s) {console.log(s);}
var isArray = function(s) {return Array.isArray(s);}
var isObject = function(s) {return typeof s === "object" && !isArray(s)}
var isString = function(s) {return typeof s === "string"}
var isNumber = function(s) {return typeof s === "number"}
var undef = function(s) {return typeof s === "undefined"}

//metatypes
const TYPE = {
    ETC : "...",
    ANYTHING : "anything"
}

var Node = require("./bvalNode");

var baseTypes = {
    string : isString,
    number : isNumber,
    numberRange : function(n, a, b) {return isNumber && n >= a && n <= b},
    int : function(n) {return isNumber && n % 1 == 0}
}
for (let k in TYPE) {
    baseTypes[TYPE[k]] = function() {return true;}
}

var bvalid = function(src, schema) {
    this.src = src;
    this.schema = schema;
    this.types = baseTypes;
    var extTypes = schema.types;
    for (let k in extTypes) {
        let t = extTypes[t];
        if (typeof t == "function") this.types[k] = extTypes[k];
    }

    this.parseNode = function(sch, kregs, vregs,  name = "root") {
        let ret = new Node({name:name});
        if (isObject(sch)) {
            ret.value = [];
            ret.type = "object";
            for (let k in sch) {
                let subnode = sch[k];
                let match = {}
                for (let reKey in kregs) {
                    let re = kregs[reKey];
                    match[reKey] = k.match(re);
                }
                let names = k.split(kregs.OR);
                if (match.OR) {
                    ret.addOrNodes(names);
                    names.forEach(n=>{
                        ret.pushValue(this.parseNode(subnode, kregs, vregs, n)); 
                    });
                } else if (!match.ANY) {
                    let snName = names[0].replace(kregs.NOREQ, "");
                    ret.addField(snName, (match.NOREQ ? false : true) );
                    ret.pushValue(this.parseNode(subnode, kregs, vregs, snName));
                } else if (match.ANY) {
                    ret.pushValue(this.parseNode(subnode, kregs, vregs, "any"), true);
                }
            }        
        } else if (isArray(sch)) {
            ret.type = "array";
            ret.value = [];
            sch.forEach(v=>ret.pushValueArray(this.parseNode(v, kregs, vregs, "arr")));
        } else if (isString(sch)) {
            var match = {}
            for (let vrKey in vregs) {
                let re = vregs[vrKey];
                match[vrKey] = sch.match(re);
            }
            let type = sch.replace(vregs.COMMENT, "");
            let comment = match.COMMENT ? match.COMMENT.pop() : false;
            ret.type = type;
            ret.comment = comment;
        }

        return ret;
    }

    this.typeValid = function(value, type) {
        var checker = this.types[type]
        if (!checker) return "Type validator not found for "+type;
        return checker(value);
    }

    this.check = function(src, node) {
        var ret = false;
        if (isObject(src)) {
            if (node.type == "object") {
                ret = {};
            } else if (node.type == TYPE.ANYTHING) {
                return false;
            } else {
                return "node is object, but reqired type is "+node.type;
            }
            node.nodesRequired.forEach(v=>{
                if (undef(src[v])) {
                    ret[v] = "undefined, but required";
                }
            });
            node.nodesOneOf.forEach(arr=>{
                let defs = [];
                let keys = arr.join(",");
                arr.forEach(v=>{
                    if (!undef(src[v])) defs.push(v);
                });
                if (defs.length > 1) {
                    defs.forEach(v=>ret[v]="more than one definition for "+keys)
                }
                if (defs.length == 0) {
                    ret[arr[0]] = "no defenition for one from this keys : "+keys;
                }
            });

            
            for (let k in src) {
                if (ret[k]) continue;
                if (!node.any && !node.nodesOptional[k] && !node.canRequired[k]) {
                    ret[k] = "not needed";
                } else {
                    let v = src[k];
                    let snode = node.child[k];
                    snode = snode ? snode : node.any;
                    if (snode) {
                        ret[k] = this.check(v, snode);
                    } else {
                        ret[k] = "not found schema";
                    }
                }
            }
        } else if (isArray(src)) {
            if (node.type == "array") {
                ret = [];
            } else if (node.type == TYPE.ANYTHING) {
                return false;
            } else {
                return "node is array, but reqired type is "+node.type;
            }
            var ni = 0;
            src.forEach((v,i)=>{
                var snode = node.value[ni];
                if (snode && snode.type == TYPE.ETC) ni = 0;
                if (node.value.length == 0) {
                    return false;
                } else if (!snode) {
                    ret[i] = "node not found"
                } else {
                    ret[i] = this.check(v, snode);
                }
                ni++;
            });
        } else { //any value, not structure
            if (node.type == "object") return "Object required";
            let tv = this.typeValid(src, node.type);
            if (tv === true) {
                ret = false;
            } else {
                ret = tv;
            }
        }
        return ret;
    }

    this.cutOk = function(s) {
        if (typeof s == "object") {
            for (let k in s) {
                if (this.cutOk(s[k]) === null) delete s[k];
            }
            if (Object.keys(s).length == 0) return null;
        } else {
            if (!s) return null;
        }
        return s;
    }

    this.valid = function() {
        var src = this.src;
        var schema = this.schema;
        var kw = schema.meta.keywords;
        var kregs = {
            ANY : RegExpOrFalse(kw.any),
            OR : RegExpOrFalse(kw.or),
            NOREQ : RegExpOrFalse(kw.notRequired),
        }
        var vregs = {
            COMMENT : RegExpOrFalse(kw.comment)
        }
        var types = schema.types;
        var data = schema.data;
        var node = this.parseNode(schema.schema, kregs, vregs);
        var ret = this.check(src, node);
        return this.cutOk(ret);
    }
}
module.exports = bvalid;
