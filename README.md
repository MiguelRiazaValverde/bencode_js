# Bencode js
Simple Bencode library for JavaScript. Without denpendences.

## Encode
Encode `String`, `Number`, `Array` or `Object` (`Hash`).
The numbers will be converted to integers.

`bencode.encode === bencode.stringify`
```javascript
bencode.stringify( 45 ); // i45e
bencode.stringify( "Hello" ); // 5:Hello
bencode.stringify( [1, 2, 3] ); // li1ei2ei3ee
bencode.stringify( {one: 1, two: 2} ); // d3:onei1e3:twoi2ee
```

## Decode
`bencode.decode === bencode.parse`
```javascript
bencode.parse( "i45e" ); // [45]
bencode.parse( "5:Hello" ); // ["Hello"]
bencode.parse( "li1ei2ei3ee" ); // [[1, 2, 3]]
bencode.parse( "d3:onei1e3:twoi2ee" ); // [{one: 1, two: 2}]
bencode.parse( "i94ei95e" ); // [94, 95]
```
