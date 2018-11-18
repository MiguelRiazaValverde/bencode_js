
var bencode = (function() {

    var regexp = {
        integer: /^i((?:-)?\d+)e/,
        string: /^(\d+):/,
        list: /^l/,
        dict: /^d/,
        end: /^e/
    };

    function tokenize( code ) {
        var tokens = [];
        var match = null;
        var number = 0;

        function string( type, match ) {
            if( type !== "string" )
                return null;
            var value = code.substr( 0, match[1] );
            code = code.substr( match[1] );
            number += value.length;
            return {
                type: type,
                value: value
            };
        }

        while( code !== "" ) {
            var flag = true;
            for( var r in regexp ) {
                if( match = code.match( regexp[r] ) ) {
                    flag = false;
                    code = code.replace( match[0], "" );
                    number += match[0].length;
                    tokens.push( string( r, match ) || { type: r, value: match } );
                    break;
                }
            }
            if( flag )
                throw "Unexpected token in " + number + " position";
        }

        return tokens;
    }

    var ERROR = 0;
    var SUCCESS = 1;

    function terminal( tokens, start ) {
        if( !tokens[start] )
            return { start: start, type: ERROR, msg: "No tokens" };
        
        if( tokens[start].type === "string" )
            return { value: tokens[start].value, start: start+1, type: SUCCESS };

        if( tokens[start].type === "integer" )
            return { value: parseInt(tokens[start].value[1]), start: start+1, type: SUCCESS };

        return { start: start, type: ERROR, msg: "No terminal" };
    }

    function list( tokens, start ) {
        if( !tokens[start] )
            return { start: start, type: ERROR, msg: "No tokens" };
        
        if( tokens[start].type !== "list" )
            return { start: start, type: ERROR, msg: "No list" };
        
        start++;

        var list = [];

        while( tokens[start] ) {
            if( tokens[start].type === "end" )
                return { value: list, start: start+1, type: SUCCESS };

            var _value = value( tokens, start );
            if( _value.type === ERROR )
                return _value;
            list.push( _value.value );
            start = _value.start;
        }

        return { start: start, type: ERROR, msg: "Bad ending list" };
    }

    function dict( tokens, start ) {
        if( !tokens[start] )
        return { start: start, type: ERROR, msg: "No tokens" };

        if( tokens[start].type !== "dict" )
            return { start: start, type: ERROR, msg: "No dict" };

        start++;

        var dict = {};

        while( tokens[start] ) {
            if( tokens[start].type === "end" )
                return { value: dict, start: start+1, type: SUCCESS };

            if( tokens[start].type !== "string" )
                return { start: start, type: ERROR, msg: "Key must be string" };
            
            var _value = value( tokens, start+1 );
            if( _value.type === ERROR )
                return _value;
            dict[ tokens[start].value ] = _value.value;
            start = _value.start;
        }

        return { start: start, type: ERROR, msg: "Bad ending dict" };
    }

    function value( tokens, start ) {
        var value;
        var fns = [ terminal, list, dict ];

        for(var i = 0; i < fns.length; i++) {
            value = fns[i]( tokens, start );
            if( value.type !== ERROR ) return value;
        }

        return value;
    }

    function parse( code ) {
        var values = [];
        var tokens = tokenize( code );
        var start = 0;

        while( tokens[start] ) {
            var _ = value( tokens, start );
            if( _.type === ERROR )
                return _;
            start = _.start;
            values.push( _.value );
        }

        return values;
    }

    function encode( obj ) {
        if( typeof obj === "number" )
            return "i" + parseInt(obj) + "e";
        
        if( typeof obj === "string" )
            return obj.length + ":" + obj;
        
        if( obj instanceof Array ) {
            var array = "l";

            for(var i = 0; i < obj.length; i++)
                array += encode( obj[i] );

            return array + "e";
        }

        if( obj instanceof Object ) {
            var dict = "d";
            
            for( var key in obj ) {
                if( obj.hasOwnProperty(key) )
                    dict += encode( key.toString() ) + encode( obj[key] );
            }

            return dict + "e";
        }

        throw "It is not possible to encode " + obj;
    }



    return {
        parse: parse,
        decode: parse,
        encode: encode,
        stringify: encode
    };

})();
