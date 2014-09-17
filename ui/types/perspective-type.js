var Montage = require("montage").Montage,
    NonNumericType = require("ui/types/non-numeric-type").NonNumericType,
    PercentLengthType = require("ui/types/percent-length-type").PercentLengthType;

var PerspectiveType = exports.PerspectiveType = PercentLengthType.specialize(null, {

    add: {
        value: function (base, delta) {
            if ((base === "none") || (delta === "none")) {
                return delta;
            }
            return PercentLengthType.add(base, delta);
        }
    },

    interpolate: {
        value: function (from, to, f) {
            if ((from === "none") || (to === "none")) {
                return NonNumericType.interpolate(from, to, f);
            }
            return PercentLengthType.interpolate(from, to, f);
        }
    },

    toCssValue: {
        value: function (value) {
            if (value === "none") {
                return value;
            }
            return PercentLengthType.toCssValue(value);
        }
    },

    fromCssValue: {
        value: function (value) {
            if (value === "none") {
                return value;
            }
            return PercentLengthType.fromCssValue(value);
        }
    }

});