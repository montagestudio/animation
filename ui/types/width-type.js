var Montage = require("montage").Montage,
    NonNumericType = require("ui/types/non-numeric-type").NonNumericType,
    PercentLengthType = require("ui/types/percent-length-type").PercentLengthType;

var WidthType = exports.WidthType = PercentLengthType.specialize(null, {

    _keywords: {
        value: [
            "border-box",
            "content-box",
            "auto",
            "max-content",
            "min-content",
            "available",
            "fit-content"
        ]
    },

    _isKeyword: {
        value: function (value) {
            return (WidthType._keywords.indexOf(value) >= 0);
        }
    },

    add: {
        value: function (base, delta) {
            if (WidthType._isKeyword(base) || WidthType._isKeyword(delta)) {
                return delta;
            }
            return PercentLengthType.add(base, delta);
        }
    },

    interpolate: {
        value: function (from, to, f) {
            if (WidthType._isKeyword(from) || WidthType._isKeyword(to)) {
                return NonNumericType.interpolate(from, to, f);
            }
            return PercentLengthType.interpolate(from, to, f);
        }
    },

    toCssValue: {
        value: function (value, svgMode) {
            if (WidthType._isKeyword(value)) {
                return value;
            }
            return PercentLengthType.toCssValue(value, svgMode);
        }
    },

    fromCssValue: {
        value: function (value) {
            if (WidthType._isKeyword(value)) {
                return value;
            }
            return PercentLengthType.fromCssValue(value);
        }
    }

});