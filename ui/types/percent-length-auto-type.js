var Montage = require("montage").Montage,
    NonNumericType = require("ui/types/non-numeric-type").NonNumericType,
    PercentLengthType = require("ui/types/percent-length-type").PercentLengthType;

var PercentLengthAutoType = exports.PercentLengthAutoType = PercentLengthType.specialize(null, {

    add: {
        value: function (base, delta) {
            if ((base === "auto") || (delta === "auto")) {
                return delta;
            }
            return PercentLengthType.add(base, delta);
        }
    },

    interpolate: {
        value: function (from, to, f) {
            if ((from === "auto") || (to === "auto")) {
                return NonNumericType.interpolate(from, to, f);
            }
            return PercentLengthType.interpolate(from, to, f);
        }
    },

    toCssValue: {
        value: function (value, svgMode) {
            if (value === "auto") {
                return value;
            }
            return PercentLengthType.toCssValue(value, svgMode);
        }
    },

    fromCssValue: {
        value: function (value) {
            if (value === "auto") {
                return value;
            }
            return PercentLengthType.fromCssValue(value);
        }
    }

});