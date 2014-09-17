var Montage = require("montage").Montage,
    NonNumericType = require("ui/types/non-numeric-type").NonNumericType,
    PercentLengthType = require("ui/types/percent-length-type").PercentLengthType;

var FontSizeType = exports.FontSizeType = PercentLengthType.specialize(null, {

    add: {
        value: function (base, delta) {
            if ((base === "smaller") || (delta === "smaller") || (base === "larger") || (delta === "larger")) {
                return delta;
            }
            return PercentLengthType.add(base, delta);
        }
    },

    interpolate: {
        value: function (from, to, f) {
            if ((from === "smaller") || (to === "smaller") || (from === "larger") || (to === "larger")) {
                return NonNumericType.interpolate(from, to, f);
            }
            return PercentLengthType.interpolate(from, to, f);
        }
    },

    toCssValue: {
        value: function (value) {
            if ((value === "smaller") || (value === "larger")) {
                return value;
            }
            return PercentLengthType.toCssValue(value);
        }
    },

    fromCssValue: {
        value: function (value) {
            if ((value === "smaller") || (value === "larger")) {
                return value;
            }
            return PercentLengthType.fromCssValue(value);
        }
    }

});