var Montage = require("montage").Montage,
    NonNumericType = require("ui/types/non-numeric-type").NonNumericType,
    PercentLengthType = require("ui/types/percent-length-type").PercentLengthType;

var TextIndentType = exports.TextIndentType = PercentLengthType.specialize(null, {

    add: {
        value: function (base, delta) {
            if ((base === "each-line") || (delta === "each-line") || (base === "hanging") || (delta === "hanging")) {
                return delta;
            }
            return PercentLengthType.add(base, delta);
        }
    },

    interpolate: {
        value: function (from, to, f) {
            if ((from === "each-line") || (to === "each-line") || (from === "hanging") || (to === "hanging")) {
                return NonNumericType.interpolate(from, to, f);
            }
            return PercentLengthType.interpolate(from, to, f);
        }
    },

    toCssValue: {
        value: function (value) {
            if ((value === "each-line") || (value === "hanging")) {
                return value;
            }
            return PercentLengthType.toCssValue(value);
        }
    },

    fromCssValue: {
        value: function (value) {
            if ((value === "each-line") || (value === "hanging")) {
                return value;
            }
            return PercentLengthType.fromCssValue(value);
        }
    }

});