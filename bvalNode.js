var log = s=>console.log(s);
var Node = function(conf) {
    this.name = conf.name || false;
    this.type = "undef";
    this.any = false;
    this.value = false;
    this.child = {};
    this.comment = false;
    this.parent = false;
    this.nodesRequired = [];
    this.nodesOptional = {};
    this.canRequired = {};
    this.nodesOneOf = []; //[["one", "two", ...], ...]

    this.addField = function(name, required) {
        if (required) {
            this.nodesRequired.push(name);
            this.canRequired[name] = true;
        } else {
            this.nodesOptional[name] = true;
        }
    }

    this.addOrNodes = function(names) {
        let lst = [];
        let req = this.canRequired;
        names.forEach(n=>{
            lst.push(n)
            req[n] = true;
        });
        this.nodesOneOf.push(lst);
    }

    this.pushValue = function(node, any = false) {
        if (Array.isArray(this.value)) {
            if (!any) {
                this.value.push(node);
                this.child[node.name] = node;
            } else {
                this.any = node;
            }
            node.parent = this;
        } else {
            this.error("value is not array");
        }
    }

    this.pushValueArray = function(node) {
        if (Array.isArray(this.value)) {
            this.value.push(node);
            node.parent = this;
        } else {
            this.error("value is not array");
        }
    }

    this.error = function(msg) {
        logerr(`${msg} in node ${this.name}`);
    }
}

module.exports = Node;
