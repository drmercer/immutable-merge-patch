var Immutable = require("immutable");
var Map = Immutable.Map;
var OrderedMap = Immutable.OrderedMap;
var is = Immutable.is;

// TODO: eventually replace these with Immutable.isImmutable, .isOrdered, and
// Map.isMap - see https://github.com/facebook/immutable-js/issues/1165#issuecomment-292650855
var isImmutable = function(maybeImmutable) {
	return Immutable.Iterable.isIterable(maybeImmutable);
};
var isOrdered = function(maybeOrdered) {
	return maybeOrdered instanceof OrderedMap;
};
var isMap = function(maybeMap) {
	return maybeMap instanceof Map
};

var deepEqual = require("deep-equal");

//======================================================================
//			generate (diff)

function generate(before, after) {
	var ordered = isOrdered(before);
	var diff = ordered ? new OrderedMap() : new Map();

	return diff.withMutations(function (mutableDiff) {
		var remainingAfter = after.withMutations(function (mutableAfter) {

			before.forEach(function(bVal, key) {
				// Ignore non-string keys
				if (typeof key !== "string") return;

				// Detect deletion
				if (!after.has(key)) {
					mutableDiff.set(key, null);
					return;
				}
				var aVal = after.get(key);

				// Recursively compare maps:
				if (Map.isMap(bVal) && Map.isMap(aVal)) {
					var subdiff = generate(bVal, aVal);
					if (!subdiff.isEmpty()) {
						mutableDiff.set(key, subdiff);
					}

					// Not both maps, so just compare values deeply
				} else if (!deepEquals(bVal, aVal)) {
					mutableDiff.set(key, aVal);
				}

				// Track which keys in `after` we've already processed
				mutableAfter.delete(key);
			});
		});

		// Record any additions (the remaining entries in remainingAfter).
		// (First make sure all the keys in remainingAfter are strings)
		remainingAfter = remainingAfter.filter(keyIsAString);
		mutableDiff.merge(remainingAfter);
	});
}

function deepEquals(a, b) {
	if (isImmutable(a)) {
		return !isImmutable(b) || is(a, b);
	} else {
		return isImmutable(b) || deepEqual(a, b, {strict: true});
	}
}

function keyIsAString(__val, key) {
	return typeof key === "string";
}

//======================================================================
//			apply (patch)

function apply(before, patch) {
	patch = patch.filter(keyIsAString)
	var keysToDelete = [];
	return before.withMutations(function(mutable) {
		patch.forEach(function(val, key) {
			var oldVal = mutable.get(key);
			if (val === null) {
				mutable.delete(key);
			} else if (isMap(val) && isMap(oldVal)) {
				mutable.set(key, apply(oldVal, val));
			} else {
				mutable.set(key, val);
			}
		});
	});
}

module.exports = {
	generate: generate,
	apply: apply,
}
