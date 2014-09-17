var Montage = require("montage").Montage,
    NonNumericType = require("ui/types/non-numeric-type").NonNumericType,
    PercentLengthType = require("ui/types/percent-length-type").PercentLengthType;

var LetterSpacingType = exports.LetterSpacingType = PercentLengthType.specialize(null, {

    add: {
        value: function (base, delta) {
            if ((base === "normal") || (delta === "normal")) {
                return delta;
            }
            return PercentLengthType.add(base, delta);
        }
    },

    interpolate: {
        value: function (from, to, f) {
            if ((from === "normal") || (to === "normal")) {
                return NonNumericType.interpolate(from, to, f);
            }
            return PercentLengthType.interpolate(from, to, f);
        }
    },

    toCssValue: {
        value: function (value) {
            if (value === "normal") {
                return value;
            }
            return PercentLengthType.toCssValue(value);
        }
    },

    fromCssValue: {
        value: function (value) {
            if (value === "normal") {
                return value;
            }
            return PercentLengthType.fromCssValue(value);
        }
    }

});