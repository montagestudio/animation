var Montage = require("montage").Montage,
    NonNumericType = require("ui/types/non-numeric-type").NonNumericType,
    Interpolation = require("ui/interpolation").Interpolation;

var NumberType = exports.NumberType = Montage.specialize(null, {

    add: {
        value: function (base, delta) {
            if ((base === "auto") || (delta === "auto")) {
                return NonNumericType.add(base, delta);
            }
            return base + delta;
        }
    },

    interpolate: {
        value: function (from, to, f) {
            if ((from === "auto") || (to === "auto")) {
                return NonNumericType.interpolate(from, to);
            }
            return Interpolation.interp(from, to, f);
        }
    },

    toCssValue: {
        value: function (value) {
            return value + "";
        }
    },

    fromCssValue: {
        value: function (value) {
            var result;

            if (value === "auto") {
                return "auto";
            }
            result = Number(value);

            if (isNaN(result)) {
                return undefined;
            } else {
                return result;
            }
        }
    }

});