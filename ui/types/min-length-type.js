var Montage = require("montage").Montage,
    NonNumericType = require("ui/types/non-numeric-type").NonNumericType,
    PercentLengthType = require("ui/types/percent-length-type").PercentLengthType;

var MinLengthType = exports.MinLengthType = PercentLengthType.specialize(null, {

    _keywords: {
        value: ["none", "max-content", "min-content", "fill-available", "fit-content"]
    },

    _isKeyword: {
        value: function (value) {
            return (MinLengthType._keywords.indexOf(value) >= 0);
        }
    },

    add: {
        value: function (base, delta) {
            if (MinLengthType._isKeyword(base) || MinLengthType._isKeyword(delta)) {
                return delta;
            }
            return PercentLengthType.add(base, delta);
        }
    },

    interpolate: {
        value: function (from, to, f) {
            if (MinLengthType._isKeyword(from) || MinLengthType._isKeyword(to)) {
                return NonNumericType.interpolate(from, to, f);
            }
            return PercentLengthType.interpolate(from, to, f);
        }
    },

    toCssValue: {
        value: function (value) {
            if (MinLengthType._isKeyword(value)) {
                return value;
            }
            return PercentLengthType.toCssValue(value);
        }
    },

    fromCssValue: {
        value: function (value) {
            if (MinLengthType._isKeyword(value)) {
                return value;
            }
            return PercentLengthType.fromCssValue(value);
        }
    }

});