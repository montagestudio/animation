var Montage = require("montage").Montage,
    NonNumericType = require("ui/types/non-numeric-type").NonNumericType,
    ColorType = require("ui/types/color-type").ColorType;

var OutlineColorType = exports.OutlineColorType = ColorType.specialize(null, {

    add: {
        value: function (base, delta) {
            if ((base === "invert") || (delta === "invert")) {
                return delta;
            }
            return ColorType.add(base, delta);
        }
    },

    interpolate: {
        value: function (from, to, f) {
            if ((from === "invert") || (to === "invert")) {
                return NonNumericType.interpolate(from, to, f);
            }
            return ColorType.interpolate(from, to, f);
        }
    },

    toCssValue: {
        value: function (value, svgMode) {
            if (value === "invert") {
                return value;
            }
            return ColorType.toCssValue(value, svgMode);
        }
    },

    fromCssValue: {
        value: function (value) {
            if (value === "invert") {
                return value;
            }
            return ColorType.fromCssValue(value);
        }
    }

});