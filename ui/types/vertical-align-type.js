var Montage = require("montage").Montage,
    NonNumericType = require("ui/types/non-numeric-type").NonNumericType,
    PercentLengthType = require("ui/types/percent-length-type").PercentLengthType;

var VerticalAlignType = exports.VerticalAlignType = PercentLengthType.specialize(null, {

    _keywords: {
        value: [
            "baseline",
            "sub",
            "super",
            "text-top",
            "text-bottom",
            "middle",
            "top",
            "bottom"
        ]
    },

    _isKeyword: {
        value: function (value) {
            return (VerticalAlignType._keywords.indexOf(value) >= 0);
        }
    },

    add: {
        value: function (base, delta) {
            if (VerticalAlignType._isKeyword(base) || VerticalAlignType._isKeyword(delta)) {
                return delta;
            }
            return PercentLengthType.add(base, delta);
        }
    },

    interpolate: {
        value: function (from, to, f) {
            if (VerticalAlignType._isKeyword(from) || VerticalAlignType._isKeyword(to)) {
                return NonNumericType.interpolate(from, to, f);
            }
            return PercentLengthType.interpolate(from, to, f);
        }
    },

    toCssValue: {
        value: function (value, svgMode) {
            if (VerticalAlignType._isKeyword(value)) {
                return value;
            }
            return PercentLengthType.toCssValue(value, svgMode);
        }
    },

    fromCssValue: {
        value: function (value) {
            if (VerticalAlignType._isKeyword(value)) {
                return value;
            }
            return PercentLengthType.fromCssValue(value);
        }
    }

});