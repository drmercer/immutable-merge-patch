var assert = require("assert");
var Immutable = require("immutable");
var Map = Immutable.Map;
var OrderedMap = Immutable.OrderedMap;
var List = Immutable.List;

// immutable-merge-patch
var imp = require("../index");

describe("apply", () => {

	it("should properly apply an empty patch", () => {
		var a = Map({
			a: 1,
			b: 2,
			c: 3
		});
		var patch = Map({});
		var b = a;

		var changed = imp.apply(a, patch);
		assert.deepEqual(
			changed,
			b
		)
	});

	it("should properly apply a useless but non-empty patch", () => {
		var a = Map({
			a: 1,
			b: 2,
			c: 3
		});
		var b = patch = a;

		var changed = imp.apply(a, patch);
		assert.deepEqual(
			changed,
			b
		)
	});

	it("should properly apply a value change", () => {
		var a = Map({
			a: 1,
			b: 2,
			c: 3
		});
		var patch = Map({
			b: 5,
		});
		var b = Map({
			a: 1,
			b: 5,
			c: 3
		});

		var changed = imp.apply(a, patch);
		assert.deepEqual(
			changed,
			b
		)
	});

	it("should properly apply a primitive replaced by an object", () => {
		var a = Map({
			a: 1,
			b: 2,
			c: 3
		});
		var p = Map({
			b: { q: "potato" },
		});
		var b = Map({
			a: 1,
			b: { q: "potato" },
			c: 3
		});

		var c = imp.apply(a, p);
		assert.deepEqual(
			c,
			b
		);
	});

	it("should properly apply a value insertion", () => {
		var a = Map({
			p: 1,
		});
		var p = Map({
			q: 3,
		});
		var b = Map({
			p: 1,
			q: 3
		});

		var c = imp.apply(a, p);
		assert.deepEqual(c, b);
	});

	it("should properly apply a value removal", () => {
		var a = Map({
			p: 1,
			q: 3
		});
		var p = Map({
			q: null,
		});
		var b = Map({
			p: 1
		});

		var c = imp.apply(a, p);
		assert.deepEqual(c, b);
	});

	it("should properly ignore non-string keys in the patch", () => {
		var a = Map({
			p: 1,
		});
		var p = Map().set(["this","is","an","array"], "value");

		var c = imp.apply(a, p);
		assert.deepEqual(c, a);
	});

	it("should properly recurse", () => {
		var a = Map({
			a: 1,
			b: 2,
			c: 3
		});
		var p = Map({
			b: 5
		})
		var b = Map({
			a: 1,
			b: 5,
			c: 3
		});
		var aP = Map({
			child: a
		});
		var pP = Map({
			child: p
		})
		var bP = Map({
			child: b
		});

		var child = imp.apply(a, p);
		var parent = imp.apply(aP, pP);

		assert.deepEqual(parent, Map({
			child: child
		}));
	});

	it("should return an ordered map upon ordered input maps", () => {
		var a = OrderedMap({
			a: 1,
			b: 2,
			c: 3
		});
		var p = Map({
			b: 5,
			c: "potato"
		});

		var c = imp.apply(a, p);

		assert(c instanceof OrderedMap);
	});

	describe("non-Map object values", () => {

		it("should properly apply a primitive replaced by a structure", () => {
			// Non-Immutable structures
			var a = Map({
				p: 1,
				q: 2
			});
			var p = Map({
				q: [1, 2, 4]
			})
			var b = Map({
				p: 1,
				q: [1, 2, 4]
			});

			var c = imp.apply(a, p);
			assert.deepEqual(c, b);

			// Immutable structures
			var a2 = Map({
				p: 1,
				q: 2
			});
			var p2 = Map({
				q: List([1, 2, 4])
			})
			var b2 = Map({
				p: 1,
				q: List([1, 2, 4])
			});

			var c2 = imp.apply(a2, p2);
			assert.deepEqual(c2, b2);
		});
	});

});
