# immutable-merge-patch
An implementation of [RFC 7396 (JSON Merge Patch)](https://tools.ietf.org/html/rfc7396)
for [Immutable.js](https://facebook.github.io/immutable-js/) `Map`s.

Thoroughly tested with full code coverage using Mocha and Istanbul.

# Installation
```sh
npm install --save immutable-merge-patch
```

# Usage
```javascript
var Immutable = require("immutable");
var immutableMergePatch = require("immutable-merge-patch");

var a = Map({
	a: 1,
	b: 2,
	c: 3
});
var b = Map({
	a: 1,
	b: 5,
	c: "some string"
});

var diff = immutableMergePatch.generate(a, b);
// diff = Map { b: 5, c: "some string" }
var c = immutableMergePatch.apply(a, diff);
// c.equals(a) === true
```

# Limitations / features not specified in RFC 7396
- Non-string keys are currently totally ignored. (Have a reason for this to
	change? [Open an issue](https://github.com/drmercer/immutable-merge-patch/issues/new)
	and I'll consider it.)
- The generate function only recurses into `Immutable.Map` objects, not plain
  JavaScript objects.
- If the `Map`s passed into `generate()` are `OrderedMap`s, an `OrderedMap` is
	returned, with the keys inheriting their order from the first parameter where possible.

# License
`immutable-merge-patch` is licensed under the MIT License.

### P.S.: It's also [![forthebadge](http://forthebadge.com/images/badges/gluten-free.svg)](http://forthebadge.com)
