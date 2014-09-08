var Montage = require("montage").Montage,
    NonNumericType = require("ui/types/non-numeric-type").NonNumericType;

var VisibilityType = exports.VisibilityType = NonNumericType.specialize(null, {

    interpolate: {
        value: function (from, to, f) {
            if (from !== "visible" && to !== "visible") {
                return NonNumericType.interpolate(from, to, f);
            }
            if (f <= 0) {
                return from;
            }
            if (f >= 1) {
                return to;
            }
            return "visible";
        }
    },

    fromCssValue: {
        value: function (value) {
            if (["visible", "hidden", "collapse"].indexOf(value) !== -1) {
                return value;
            }
            return undefined;
        }
    }

});