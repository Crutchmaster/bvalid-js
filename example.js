var config = {
    meta : {
        desc : "Config for http-js server",
        keywords : {
            any : "^ANY",
            or : "_or_",
            notRequired : "^_",
            comment : " - .*$"
        }
    },
    types : {},
    //data : {},
    schema : {
        ANY : {
            types : { ANY : "string - type keys is fields may be commaseparated" },
            sql_or_cursor : "string - sql query",
            _cache : {
                key : "string",
                _timeoutSec : "int"
            },
            _prefix : "string - prefix for all parameters",
            _alias : { ANY : "string - alias for key" }
        }
    }

}
module.exports = config;
