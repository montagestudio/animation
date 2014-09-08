var Montage = require("montage").Montage,
    PercentLengthType = require("ui/types/percent-length-type").PercentLengthType;

var RectangleType = exports.RectangleType = Montage.specialize(null, {

    add: {
        value: function (base, delta) {
            if ((base === "auto") || (delta === "auto")) {
                return delta;
            }
            return {
                top: PercentLengthType.add(base.top, delta.top),
                right: PercentLengthType.add(base.right, delta.right),
                bottom: PercentLengthType.add(base.bottom, delta.bottom),
                left: PercentLengthType.add(base.left, delta.left)
            };
        }
    },

    interpolate: {
        value: function (from, to, f) {
            if ((from === "auto") || (to === "auto")) {
                return NonNumericType.interpolate(from, to, f);
            }
            return {
                top: PercentLengthType.interpolate(from.top, to.top, f),
                right: PercentLengthType.interpolate(from.right, to.right, f),
                bottom: PercentLengthType.interpolate(from.bottom, to.bottom, f),
                left: PercentLengthType.interpolate(from.left, to.left, f)
            };
        }
    },

    toCssValue: {
        value: function (value) {
            if (value === "auto") {
                return value;
            }
            return (
                "rect(" +
                PercentLengthType.toCssValue(value.top) + "," +
                PercentLengthType.toCssValue(value.right) + "," +
                PercentLengthType.toCssValue(value.bottom) + "," +
                PercentLengthType.toCssValue(value.left) + ")"
            );
        }
    },

    fromCssValue: {
        value: function (value) {
            var match,
                out;

            if (value === "auto") {
                return value;
            }
            match = RectangleType.rectangleRE.exec(value);
            if (!match) {
                return undefined;
            }
            out = {
                top: PercentLengthType.fromCssValue(match[1]),
                right: PercentLengthType.fromCssValue(match[2]),
                bottom: PercentLengthType.fromCssValue(match[3]),
                left: PercentLengthType.fromCssValue(match[4])
            };
            if (out.top && out.right && out.bottom && out.left) {
                return out;
            }
            return undefined;
        }
    },

    rectangleRE: {
        value: /rect\(([^,]+),([^,]+),([^,]+),([^)]+)\)/
    }

});