var assert = require("assert");
var Immutable = require("immutable");
var Map = Immutable.Map;
var OrderedMap = Immutable.OrderedMap;
var List = Immutable.List;

// immutable-merge-patch
var imp = require("../index");

describe("generate", () => {

	it("should properly detect a value change", () => {
		var a = Map({
			a: 1,
			b: 2,
			c: 3
		});
		var b = Map({
			a: 1,
			b: 5,
			c: 3
		});

		var diff = imp.generate(a, b);
		assert.deepEqual(
			diff.toObject(),
			{
				b: 5,
			}
		);
		var otherWay = imp.generate(b, a);
		assert.deepEqual(
			otherWay.toObject(),
			{
				b: 2,
			}
		);
	});

	it("should properly detect a primitive replaced by an object", () => {
		var a = Map({
			a: 1,
			b: 2,
			c: 3
		});
		var b = Map({
			a: 1,
			b: { q: "potato" },
			c: 3
		});

		var diff = imp.generate(a, b);
		assert.deepEqual(
			diff.toObject(),
			{
				b: { q: "potato" },
			}
		);
		var otherWay = imp.generate(b, a);
		assert.deepEqual(
			otherWay.toObject(),
			{
				b: 2,
			}
		);
	});

	it("should properly detect a value insertion", () => {
		var a = Map({
			p: 1,
		});
		var b = Map({
			p: 1,
			q: 3
		});

		var diff = imp.generate(a, b);
		assert.deepEqual(
			diff.toObject(),
			{
				q: 3,
			}
		);
	});

	it("should properly detect a value removal", () => {
		var a = Map({
			p: 1,
			q: 3
		});
		var b = Map({
			p: 1
		});

		var diff = imp.generate(a, b);
		assert.deepEqual(
			diff.toObject(),
			{
				q: null,
			}
		);
	});

	it("should properly recurse", () => {
		var a = Map({
			a: 1,
			b: 2,
			c: 3
		});
		var b = Map({
			a: 1,
			b: 5,
			c: 3
		});
		var aP = Map({
			child: a
		});
		var bP = Map({
			child: b
		});

		var childDiff = imp.generate(a, b);
		var parentDiff = imp.generate(aP, bP);

		assert.deepEqual(parentDiff.toJS(), {
			child: childDiff.toJS()
		});
	});

	it("should return an ordered map upon ordered input maps", () => {
		var a = OrderedMap({
			a: 1,
			b: 2,
			c: 3
		});
		var b = OrderedMap({
			a: 1,
			b: 5,
			c: "potato"
		});

		var diff = imp.generate(a, b);

		assert(diff instanceof OrderedMap);
	});

	describe("non-Map object values", () => {

		it("should properly detect equivalent structures", () => {
			// Non-Immutable structures
			var a = Map({
				p: 1,
				q: [1, 2, 4]
			});
			var b = Map({
				p: 1,
				q: [1, 2, 4]
			});

			var diff = imp.generate(a, b);
			assert.deepEqual(
				diff.toObject(), {}
			);

			// Immutable structures
			var c = Map({
				p: 1,
				q: List([1, 2, 4])
			});
			var d = Map({
				p: 1,
				q: List([1, 2, 4])
			});

			var diff2 = imp.generate(c, d);
			assert.deepEqual(
				diff2.toObject(), {}
			);
		});

		it("should properly detect changes", () => {
			// Non-Immutable structures
			var a = Map({
				p: 1,
				q: [1, 2, 4]
			});
			var b = Map({
				p: 1,
				q: [1, 3, 4]
			});

			var diff = imp.generate(a, b);
			assert.deepEqual(
				diff.toObject(),
				{
					q: [1, 3, 4]
				}
			);

			// Immutable structures
			var c = Map({
				p: 1,
				q: List([1, 2, 4])
			});
			var d = Map({
				p: 1,
				q: List([1, 3, 4])
			});

			var diff2 = imp.generate(c, d);
			assert.deepEqual(
				diff2.toObject(),
				{
					q: List([1, 3, 4])
				}
			);
		});
	});

});
