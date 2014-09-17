var Montage = require("montage").Montage,
    NonNumericType = require("ui/types/non-numeric-type").NonNumericType,
    AnimationMath = require("ui/animation-math").AnimationMath,
    Interpolation = require("ui/interpolation").Interpolation;

var FontWeightType = exports.FontWeightType = Montage.specialize(null, {

    add: {
        value: function (base, delta) {
            if ((base === "lighter") || (delta === "lighter") || (base === "bolder") || (delta === "bolder")) {
                return delta;
            }
            return base + delta;
        }
    },

    interpolate: {
        value: function (from, to, f) {
            if ((from === "lighter") || (to === "lighter") || (from === "bolder") || (to === "bolder")) {
                return NonNumericType.interpolate(from, to, f);
            }
            return Interpolation.interp(from, to, f);
        }
    },

    toCssValue: {
        value: function (value) {
            if ((value === "lighter") || (value === "bolder")) {
                return value;
            }
            value = Math.round(value / 100) * 100;
            value = AnimationMath.clamp(value, 100, 900);
            if (value === 400) {
                return "normal";
            }
            if (value === 700) {
                return "bold";
            }
            return String(value);
        }
    },

    fromCssValue: {
        value: function (value) {
            var out;

            if ((value === "lighter") || (value === "bolder")) {
                return value;
            }
            out = Number(value);
            if (isNaN(out) || out < 100 || out > 900 || out % 100 !== 0) {
                return undefined;
            }
            return out;
        }
    }

});