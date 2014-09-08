var Montage = require("montage").Montage,
    NonNumericType = require("ui/types/non-numeric-type").NonNumericType,
    PercentLengthType = require("ui/types/percent-length-type").PercentLengthType;

var MaxLengthType = exports.MaxLengthType = PercentLengthType.specialize(null, {

    _keywords: {
        value: ["max-content", "min-content", "fill-available", "fit-content"]
    },

    _isKeyword: {
        value: function (value) {
            return (MaxLengthType._keywords.indexOf(value) >= 0);
        }
    },

    add: {
        value: function (base, delta) {
            if (MaxLengthType._isKeyword(base) || MaxLengthType._isKeyword(delta)) {
                return delta;
            }
            return PercentLengthType.add(base, delta);
        }
    },

    interpolate: {
        value: function (from, to, f) {
            if (MaxLengthType._isKeyword(from) || MaxLengthType._isKeyword(to)) {
                return NonNumericType.interpolate(from, to, f);
            }
            return PercentLengthType.interpolate(from, to, f);
        }
    },

    toCssValue: {
        value: function (value, svgMode) {
            if (MaxLengthType._isKeyword(value)) {
                return value;
            }
            return PercentLengthType.toCssValue(value, svgMode);
        }
    },

    fromCssValue: {
        value: function (value) {
            if (MaxLengthType._isKeyword(value)) {
                return value;
            }
            return PercentLengthType.fromCssValue(value);
        }
    }

});