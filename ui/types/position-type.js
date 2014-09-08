var Montage = require("montage").Montage,
    PercentLengthType = require("ui/types/percent-length-type").PercentLengthType;

var PositionType = exports.PositionType = Montage.specialize(null, {

    zero: {
        value: function () {
            return [
                {px: 0},
                {px: 0}
            ];
        }
    },

    add: {
        value: function (base, delta) {
            return [
                PercentLengthType.add(base[0], delta[0]),
                PercentLengthType.add(base[1], delta[1])
            ];
        }
    },

    interpolate: {
        value: function (from, to, f) {
            return [
                PercentLengthType.interpolate(from[0], to[0], f),
                PercentLengthType.interpolate(from[1], to[1], f)
            ];
        }
    },

    toCssValue: {
        value: function (value) {
            return value.map(PercentLengthType.toCssValue).join(' ');
        }
    },

    isDefinedAndNotNull: {
        value: function (val) {
            return ((typeof val !== "undefined") && (val !== null));
        }
    },

    fromCssValue: {
        value: function (value) {
            var tokens = PositionType.consumeAllTokensFromString(value),
                percentLength,
                center,
                axis,
                out,
                token,
                i;

            if (!tokens || (tokens.length > 4)) {
                return undefined;
            }
            if (tokens.length === 1) {
                token = tokens[0];
                if (PositionType.isHorizontalToken(token)) {
                    return [token, 'center'].map(PositionType.resolveToken);
                } else {
                    return ['center', token].map(PositionType.resolveToken);
                }
            }
            if ((tokens.length === 2) &&
                (PositionType.isHorizontalToken(tokens[0])) &&
                (PositionType.isVerticalToken(tokens[1]))) {
                return tokens.map(PositionType.resolveToken);
            }
            if (tokens.filter(PositionType.isKeyword).length !== 2) {
                return undefined;
            }
            out = [undefined, undefined];
            center = false;
            for (i = 0; i < tokens.length; i++) {
                token = tokens[i];
                if (!PositionType.isKeyword(token)) {
                    return undefined;
                }
                if (token === "center") {
                    if (center) {
                        return undefined;
                    }
                    center = true;
                    continue;
                }
                axis = Number(PositionType.isVerticalToken(token));
                if (out[axis]) {
                    return undefined;
                }
                if ((i === tokens.length - 1) || (PositionType.isKeyword(tokens[i + 1]))) {
                    out[axis] = PositionType.resolveToken(token);
                    continue;
                }
                percentLength = tokens[++i];
                if ((token === 'bottom') || (token === 'right')) {
                    percentLength = PercentLengthType.negate(percentLength);
                    // I believe this is wrong: percentages might not be integers
                    percentLength['%'] = (percentLength['%'] || 0) + 100;
                }
                out[axis] = percentLength;
            }
            if (center) {
                if (!out[0]) {
                    out[0] = PositionType.resolveToken('center');
                } else {
                    if (!out[1]) {
                        out[1] = PositionType.resolveToken('center');
                    } else {
                        return undefined;
                    }
                }
            }
            if (out.every(this.isDefinedAndNotNull)) {
                return out;
            } else {
                return undefined;
            }
        }
    },

    consumeAllTokensFromString: {
        value: function (remaining) {
            var tokens = [],
                result;

            while (remaining.trim()) {
                result = PositionType.consumeTokenFromString(remaining);
                if (!result) {
                    return undefined;
                }
                tokens.push(result.value);
                remaining = result.remaining;
            }
            return tokens;
        }
    },

    consumeTokenFromString: {
        value: function (value) {
            var keywordMatch = PositionType.positionKeywordRE.exec(value);

            if (keywordMatch) {
                return {
                    value: keywordMatch[0].trim().toLowerCase(),
                    remaining: value.substring(keywordMatch[0].length)
                };
            }
            return PercentLengthType.consumeValueFromString(value);
        }
    },

    resolveToken: {
        value: function (token) {
            if (typeof token === "string") {
                return PercentLengthType.fromCssValue({
                    left: "0%",
                    center: "50%",
                    right: "100%",
                    top: "0%",
                    bottom: "100%"
                }[token]);
            }
            return token;
        }
    },

    isHorizontalToken: {
        value: function (token) {
            if (typeof token === "string") {
                return token in {left: true, center: true, right: true};
            }
            return true;
        }
    },

    isVerticalToken: {
        value: function (token) {
            if (typeof token === "string") {
                return token in {top: true, center: true, bottom: true};
            }
            return true;
        }
    },

    isKeyword: {
        value: function(token) {
            return typeof token === "string";
        }
    },

    positionKeywordRE: {
        value: /^\s*left|^\s*center|^\s*right|^\s*top|^\s*bottom/i
    }

});