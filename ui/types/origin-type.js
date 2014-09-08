var Montage = require("montage").Montage,
    PercentLengthType = require("ui/types/percent-length-type").PercentLengthType,
    PositionType = require("ui/types/position-type").PositionType;

var OriginType = exports.OriginType = Montage.specialize(null, {

    zero: {
        value: function () {
            return [{"%": 0}, {"%": 0}, {px: 0}];
        }
    },

    add: {
        value: function (base, delta) {
            return [
                PercentLengthType.add(base[0], delta[0]),
                PercentLengthType.add(base[1], delta[1]),
                PercentLengthType.add(base[2], delta[2])
            ];
        }
    },

    interpolate: {
        value: function (from, to, f) {
            return [
                PercentLengthType.interpolate(from[0], to[0], f),
                PercentLengthType.interpolate(from[1], to[1], f),
                PercentLengthType.interpolate(from[2], to[2], f)
            ];
        }
    },

    toCssValue: {
        value: function (value) {
            var result = PercentLengthType.toCssValue(value[0]) + " " + PercentLengthType.toCssValue(value[1]),
                unit;

            for (unit in value[2]) {
                if (value[2][unit] !== 0) {
                    return result + " " + PercentLengthType.toCssValue(value[2]);
                }
            }
            return result;
        }
    },

    fromCssValue: {
        value: function (value) {
            var tokens = PositionType.consumeAllTokensFromString(value),
                out;

            if (!tokens) {
                return undefined;
            }
            out = ["center", "center", {px: 0}];
            switch (tokens.length) {
                case 0:
                    return OriginType.zero();
                case 1:
                    if (PositionType.isHorizontalToken(tokens[0])) {
                        out[0] = tokens[0];
                    } else {
                        if (PositionType.isVerticalToken(tokens[0])) {
                            out[1] = tokens[0];
                        } else {
                            return undefined;
                        }
                    }
                    return out.map(PositionType.resolveToken);
                case 3:
                    if (PositionType.isKeyword(tokens[2])) {
                        return undefined;
                    }
                    out[2] = tokens[2];
                case 2:
                    if (PositionType.isHorizontalToken(tokens[0]) &&
                            PositionType.isVerticalToken(tokens[1])) {
                        out[0] = tokens[0];
                        out[1] = tokens[1];
                    } else {
                        if (PositionType.isVerticalToken(tokens[0]) &&
                                PositionType.isHorizontalToken(tokens[1])) {
                            out[0] = tokens[1];
                            out[1] = tokens[0];
                        } else {
                            return undefined;
                        }
                    }
                    return out.map(PositionType.resolveToken);
                default:
                    return undefined;
            }
        }
    }

});