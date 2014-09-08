var Montage = require("montage").Montage,
    NumberType = require("ui/types/number-type").NumberType,
    NonNumericType = require("ui/types/non-numeric-type").NonNumericType,
    Interpolation = require("ui/interpolation").Interpolation;

var ZIndexType = exports.ZIndexType = NumberType.specialize(null, {

    add: {
        value: function (base, delta) {
            if ((base === "auto") || (delta === "auto")) {
                return delta;
            }
            return NumberType.add(base, delta);
        }
    },

    interpolate: {
        value: function (from, to, f) {
            if ((from === "auto") || (to === "auto")) {
                return NonNumericType.interpolate(from, to);
            }
            return Math.floor(Interpolation.interp(from, to, f));
        }
    },

    toCssValue: {
        value: function (value, svgMode) {
            if (value === "auto") {
                return value;
            }
            return NumberType.toCssValue(value, svgMode);
        }
    },

    fromCssValue: {
        value: function (value) {
            if (value === "auto") {
                return value;
            }
            return NumberType.fromCssValue(value);
        }
    }

});