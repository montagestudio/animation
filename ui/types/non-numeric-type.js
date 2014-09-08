var Montage = require("montage").Montage;

var NonNumericType = exports.NonNumericType = Montage.specialize(null, {

    add: {
        value: function (base, delta) {
            if (delta !== undefined) {
                return delta;
            } else {
                return base;
            }
        }
    },

    interpolate: {
        value: function (from, to, f) {
            if (f < .5) {
                return from;
            } else {
                return to;
            }
        }
    },

    toCssValue: {
        value: function (value) {
            return value;
        }
    },

    fromCssValue: {
        value: function (value) {
            return value;
        }
    }

});