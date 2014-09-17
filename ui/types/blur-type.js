var Montage = require("montage").Montage,
    Interpolation = require("ui/interpolation").Interpolation;

var BlurType = exports.BlurType = Montage.specialize(null, {

    add: {
        value: function (base, delta) {
            return base + delta;
        }
    },

    interpolate: {
        value: function (from, to, f) {
            return Interpolation.interp(from, to, f);
        }
    },

    toCssValue: {
        value: function (value) {
            return "blur(" + value + "px)";
        }
    },

    fromCssValue: {
        value: function (value) {
            return Number(value.substr(5, value.length - 8));
        }
    }

});