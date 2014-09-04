var Montage = require("montage").Montage;

var Interpolation = exports.Interpolation = Montage.specialize(null, {

    interp: {
        value: function (from, to, f, type) {
            var zero;

            if (Array.isArray(from) || Array.isArray(to)) {
                return this.interpArray(from, to, f, type);
            }
            zero = (type && (type.indexOf('scale') === 0)) ? 1 : 0;
            to = ((typeof to !== "undefined") && (to !== null)) ? to : zero;
            from = ((typeof from !== "undefined") && (from !== null)) ? from : zero;
            return to * f + from * (1 - f);
        }
    },

    interpArray: {
        value: function (from, to, f, type) {
            var length = from ? from.length : to.length,
                result = [],
                i;

            for (i = 0; i < length; i++) {
                result[i] = this.interp(from ? from[i] : null, to ? to[i] : null, f, type);
            }
            return result;
        }
    },

    // Should this one be inside Interpolation?
    clamp: {
        value: function (x, min, max) {
            return Math.max(Math.min(x, max), min);
        }
    },

    interpolate: {
        value: function (property, from, to, f) {
            if ((from === "inherit") || (to === "inherit")) {
                return Type.nonNumericType.interpolate(from, to, f);
            }
            if (f === 0) {
                return from;
            }
            if (f === 1) {
                return to;
            }
            return Type.getType(property).interpolate(from, to, f);
        }
    }

});
var colorType = exports.colorType = Montage.specialize(null, {

    namedColors: {
        value: {
            aliceblue: [240, 248, 255, 1],
            antiquewhite: [250, 235, 215, 1],
            aqua: [0, 255, 255, 1],
            aquamarine: [127, 255, 212, 1],
            azure: [240, 255, 255, 1],
            beige: [245, 245, 220, 1],
            bisque: [255, 228, 196, 1],
            black: [0, 0, 0, 1],
            blanchedalmond: [255, 235, 205, 1],
            blue: [0, 0, 255, 1],
            blueviolet: [138, 43, 226, 1],
            brown: [165, 42, 42, 1],
            burlywood: [222, 184, 135, 1],
            cadetblue: [95, 158, 160, 1],
            chartreuse: [127, 255, 0, 1],
            chocolate: [210, 105, 30, 1],
            coral: [255, 127, 80, 1],
            cornflowerblue: [100, 149, 237, 1],
            cornsilk: [255, 248, 220, 1],
            crimson: [220, 20, 60, 1],
            cyan: [0, 255, 255, 1],
            darkblue: [0, 0, 139, 1],
            darkcyan: [0, 139, 139, 1],
            darkgoldenrod: [184, 134, 11, 1],
            darkgray: [169, 169, 169, 1],
            darkgreen: [0, 100, 0, 1],
            darkgrey: [169, 169, 169, 1],
            darkkhaki: [189, 183, 107, 1],
            darkmagenta: [139, 0, 139, 1],
            darkolivegreen: [85, 107, 47, 1],
            darkorange: [255, 140, 0, 1],
            darkorchid: [153, 50, 204, 1],
            darkred: [139, 0, 0, 1],
            darksalmon: [233, 150, 122, 1],
            darkseagreen: [143, 188, 143, 1],
            darkslateblue: [72, 61, 139, 1],
            darkslategray: [47, 79, 79, 1],
            darkslategrey: [47, 79, 79, 1],
            darkturquoise: [0, 206, 209, 1],
            darkviolet: [148, 0, 211, 1],
            deeppink: [255, 20, 147, 1],
            deepskyblue: [0, 191, 255, 1],
            dimgray: [105, 105, 105, 1],
            dimgrey: [105, 105, 105, 1],
            dodgerblue: [30, 144, 255, 1],
            firebrick: [178, 34, 34, 1],
            floralwhite: [255, 250, 240, 1],
            forestgreen: [34, 139, 34, 1],
            fuchsia: [255, 0, 255, 1],
            gainsboro: [220, 220, 220, 1],
            ghostwhite: [248, 248, 255, 1],
            gold: [255, 215, 0, 1],
            goldenrod: [218, 165, 32, 1],
            gray: [128, 128, 128, 1],
            green: [0, 128, 0, 1],
            greenyellow: [173, 255, 47, 1],
            grey: [128, 128, 128, 1],
            honeydew: [240, 255, 240, 1],
            hotpink: [255, 105, 180, 1],
            indianred: [205, 92, 92, 1],
            indigo: [75, 0, 130, 1],
            ivory: [255, 255, 240, 1],
            khaki: [240, 230, 140, 1],
            lavender: [230, 230, 250, 1],
            lavenderblush: [255, 240, 245, 1],
            lawngreen: [124, 252, 0, 1],
            lemonchiffon: [255, 250, 205, 1],
            lightblue: [173, 216, 230, 1],
            lightcoral: [240, 128, 128, 1],
            lightcyan: [224, 255, 255, 1],
            lightgoldenrodyellow: [250, 250, 210, 1],
            lightgray: [211, 211, 211, 1],
            lightgreen: [144, 238, 144, 1],
            lightgrey: [211, 211, 211, 1],
            lightpink: [255, 182, 193, 1],
            lightsalmon: [255, 160, 122, 1],
            lightseagreen: [32, 178, 170, 1],
            lightskyblue: [135, 206, 250, 1],
            lightslategray: [119, 136, 153, 1],
            lightslategrey: [119, 136, 153, 1],
            lightsteelblue: [176, 196, 222, 1],
            lightyellow: [255, 255, 224, 1],
            lime: [0, 255, 0, 1],
            limegreen: [50, 205, 50, 1],
            linen: [250, 240, 230, 1],
            magenta: [255, 0, 255, 1],
            maroon: [128, 0, 0, 1],
            mediumaquamarine: [102, 205, 170, 1],
            mediumblue: [0, 0, 205, 1],
            mediumorchid: [186, 85, 211, 1],
            mediumpurple: [147, 112, 219, 1],
            mediumseagreen: [60, 179, 113, 1],
            mediumslateblue: [123, 104, 238, 1],
            mediumspringgreen: [0, 250, 154, 1],
            mediumturquoise: [72, 209, 204, 1],
            mediumvioletred: [199, 21, 133, 1],
            midnightblue: [25, 25, 112, 1],
            mintcream: [245, 255, 250, 1],
            mistyrose: [255, 228, 225, 1],
            moccasin: [255, 228, 181, 1],
            navajowhite: [255, 222, 173, 1],
            navy: [0, 0, 128, 1],
            oldlace: [253, 245, 230, 1],
            olive: [128, 128, 0, 1],
            olivedrab: [107, 142, 35, 1],
            orange: [255, 165, 0, 1],
            orangered: [255, 69, 0, 1],
            orchid: [218, 112, 214, 1],
            palegoldenrod: [238, 232, 170, 1],
            palegreen: [152, 251, 152, 1],
            paleturquoise: [175, 238, 238, 1],
            palevioletred: [219, 112, 147, 1],
            papayawhip: [255, 239, 213, 1],
            peachpuff: [255, 218, 185, 1],
            peru: [205, 133, 63, 1],
            pink: [255, 192, 203, 1],
            plum: [221, 160, 221, 1],
            powderblue: [176, 224, 230, 1],
            purple: [128, 0, 128, 1],
            red: [255, 0, 0, 1],
            rosybrown: [188, 143, 143, 1],
            royalblue: [65, 105, 225, 1],
            saddlebrown: [139, 69, 19, 1],
            salmon: [250, 128, 114, 1],
            sandybrown: [244, 164, 96, 1],
            seagreen: [46, 139, 87, 1],
            seashell: [255, 245, 238, 1],
            sienna: [160, 82, 45, 1],
            silver: [192, 192, 192, 1],
            skyblue: [135, 206, 235, 1],
            slateblue: [106, 90, 205, 1],
            slategray: [112, 128, 144, 1],
            slategrey: [112, 128, 144, 1],
            snow: [255, 250, 250, 1],
            springgreen: [0, 255, 127, 1],
            steelblue: [70, 130, 180, 1],
            tan: [210, 180, 140, 1],
            teal: [0, 128, 128, 1],
            thistle: [216, 191, 216, 1],
            tomato: [255, 99, 71, 1],
            transparent: [0, 0, 0, 0],
            turquoise: [64, 224, 208, 1],
            violet: [238, 130, 238, 1],
            wheat: [245, 222, 179, 1],
            white: [255, 255, 255, 1],
            whitesmoke: [245, 245, 245, 1],
            yellow: [255, 255, 0, 1],
            yellowgreen: [154, 205, 50, 1]
        }
    },

    zero: {
        value: function () {
            return [0, 0, 0, 0];
        }
    },

    _premultiply: {
        value: function (value) {
            var alpha = value[3];

            return [
                value[0] * alpha,
                value[1] * alpha,
                value[2] * alpha
            ];
        }
    },

    add: {
        value: function (base, delta) {
            var alpha = Math.min(base[3] + delta[3], 1);

            if (alpha === 0) {
                return [0, 0, 0, 0];
            }
            base = this._premultiply(base);
            delta = this._premultiply(delta);
            return [
                (base[0] + delta[0]) / alpha,
                (base[1] + delta[1]) / alpha,
                (base[2] + delta[2]) / alpha,
                alpha
            ];
        }
    },

    interpolate: {
        value: function (from, to, f) {
            var alpha = Interpolation.clamp(Interpolation.interp(from[3], to[3], f), 0, 1);

            if (alpha === 0) {
                return [0, 0, 0, 0];
            }
            from = this._premultiply(from);
            to = this._premultiply(to);
            return [
                Interpolation.interp(from[0], to[0], f) / alpha,
                Interpolation.interp(from[1], to[1], f) / alpha,
                Interpolation.interp(from[2], to[2], f) / alpha,
                alpha
            ];
        }
    },

    toCssValue: {
        value: function (value) {
            return "rgba(" + Math.round(value[0]) +
                ", " + Math.round(value[1]) +
                ", " + Math.round(value[2]) +
                ", " + value[3] + ")";
        }
    },

    fromCssValue: {
        value: function (value) {
            var out = [],
                regexResult = this.colorHashRE.exec(value),
                type,
                i, v, m;

            if (regexResult) {
                if ((value.length !== 4) && (value.length !== 7)) {
                    return undefined;
                }
                regexResult.shift();
                for (i = 0; i < 3; i++) {
                    if (regexResult[i].length === 1) {
                        regexResult[i] = regexResult[i] + regexResult[i];
                    }
                    v = Math.max(Math.min(parseInt(regexResult[i], 16), 255), 0);
                    out[i] = v;
                }
                out.push(1);
            }
            regexResult = this.colorRE.exec(value);
            if (regexResult) {
                regexResult.shift();
                type = regexResult.shift().substr(0, 3);
                for (i = 0; i < 3; i++) {
                    m = 1;
                    if (regexResult[i][regexResult[i].length - 1] === '%') {
                        regexResult[i] = regexResult[i].substr(0, regexResult[i].length - 1);
                        m = 255 / 100;
                    }
                    if (type === "rgb") {
                        out[i] = Interpolation.clamp(Math.round(parseInt(regexResult[i], 10) * m), 0, 255);
                    } else {
                        out[i] = parseInt(regexResult[i], 10);
                    }
                }
                if (type === "hsl") {
                    out = hsl2rgb.apply(null, out);
                }
                if (typeof regexResult[3] !== 'undefined') {
                    out[3] = Math.max(Math.min(parseFloat(regexResult[3]), 1.0), 0.0);
                } else {
                    out.push(1.0);
                }
            }
            if (out.some(isNaN)) {
                return undefined;
            }
            if (out.length > 0) {
                return out;
            }
            return colorType.namedColors[value];
        }
    }

});

colorType.colorRE = new RegExp(
    '(hsla?|rgba?)\\(' +
    '([\\-0-9]+%?),?\\s*' +
    '([\\-0-9]+%?),?\\s*' +
    '([\\-0-9]+%?)(?:,?\\s*([\\-0-9\\.]+%?))?' +
    '\\)'
);

colorType.colorHashRE = new RegExp(
    '#([0-9A-Fa-f][0-9A-Fa-f]?)' +
    '([0-9A-Fa-f][0-9A-Fa-f]?)' +
    '([0-9A-Fa-f][0-9A-Fa-f]?)'
);

var positionType = exports.positionType = Montage.specialize(null, {

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
                percentLengthType.add(base[0], delta[0]),
                percentLengthType.add(base[1], delta[1])
            ];
        }
    },

    interpolate: {
        value: function (from, to, f) {
            return [
                percentLengthType.interpolate(from[0], to[0], f),
                percentLengthType.interpolate(from[1], to[1], f)
            ];
        }
    },

    toCssValue: {
        value: function (value) {
            return value.map(percentLengthType.toCssValue).join(' ');
        }
    },

    isDefinedAndNotNull: {
        value: function (val) {
            return ((typeof val !== "undefined") && (val !== null));
        }
    },

    fromCssValue: {
        value: function (value) {
            var tokens = positionType.consumeAllTokensFromString(value),
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
                if (positionType.isHorizontalToken(token)) {
                    return [token, 'center'].map(positionType.resolveToken);
                } else {
                    return ['center', token].map(positionType.resolveToken);
                }
            }
            if ((tokens.length === 2) &&
                (positionType.isHorizontalToken(tokens[0])) &&
                (positionType.isVerticalToken(tokens[1]))) {
                return tokens.map(positionType.resolveToken);
            }
            if (tokens.filter(positionType.isKeyword).length !== 2) {
                return undefined;
            }
            out = [undefined, undefined];
            center = false;
            for (i = 0; i < tokens.length; i++) {
                token = tokens[i];
                if (!positionType.isKeyword(token)) {
                    return undefined;
                }
                if (token === "center") {
                    if (center) {
                        return undefined;
                    }
                    center = true;
                    continue;
                }
                axis = Number(positionType.isVerticalToken(token));
                if (out[axis]) {
                    return undefined;
                }
                if ((i === tokens.length - 1) || (positionType.isKeyword(tokens[i + 1]))) {
                    out[axis] = positionType.resolveToken(token);
                    continue;
                }
                percentLength = tokens[++i];
                if ((token === 'bottom') || (token === 'right')) {
                    percentLength = percentLengthType.negate(percentLength);
                    // I believe this is wrong: percentages might not be integers
                    percentLength['%'] = (percentLength['%'] || 0) + 100;
                }
                out[axis] = percentLength;
            }
            if (center) {
                if (!out[0]) {
                    out[0] = positionType.resolveToken('center');
                } else {
                    if (!out[1]) {
                        out[1] = positionType.resolveToken('center');
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
                result = positionType.consumeTokenFromString(remaining);
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
            var keywordMatch = positionKeywordRE.exec(value);

            if (keywordMatch) {
                return {
                    value: keywordMatch[0].trim().toLowerCase(),
                    remaining: value.substring(keywordMatch[0].length)
                };
            }
            return percentLengthType.consumeValueFromString(value);
        }
    },

    resolveToken: {
        value: function (token) {
            if (typeof token === "string") {
                return percentLengthType.fromCssValue({
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
    }

});

var percentLengthType = exports.percentLengthType = Montage.specialize(null, {

    zero: {
        value: function() {
            return {};
        }
    },

    add: {
        value: function (base, delta) {
            var out = {},
                value;

            for (value in base) {
                out[value] = base[value] + (delta[value] || 0);
            }
            for (value in delta) {
                if (value in base) {
                    continue;
                }
                out[value] = delta[value];
            }
            return out;
        }
    },

    interpolate: {
        value: function (from, to, f) {
            var out = {},
                value;

            for (value in from) {
                out[value] = Interpolation.interp(from[value], to[value], f);
            }
            for (value in to) {
                if (value in out) {
                    continue;
                }
                out[value] = Interpolation.interp(0, to[value], f);
            }
            return out;
        }
    },

    toCssValue: {
        value: function (value) {
            var s = "",
                singleValue = true,
                item;

            for (item in value) {
                if (s === "") {
                    s = value[item] + item;
                } else {
                    if (singleValue) {
                        if (value[item] !== 0) {
                            s = features.calcFunction + "(" + s + " + " + value[item] + item + ")";
                            singleValue = false;
                        }
                    } else {
                        if (value[item] !== 0) {
                            s = s.substring(0, s.length - 1) + " + " + value[item] + item + ")";
                        }
                    }
                }
            }
            return s;
        }
    },

    fromCssValue: {
        value: function (value) {
            var result = percentLengthType.consumeValueFromString(value);

            if (result) {
                return result.value;
            }
            return undefined;
        }
    },

    consumeValueFromString: {
        value: function(value) {
            var autoMatch,
                calcMatch,
                singleValue,
                remaining,
                calcInnards,
                firstTime,
                valueUnit,
                valueNumber,
                out,
                op;

            if (!((typeof value !== "undefined") && (value !== null))) {
                return undefined;
            }
            autoMatch = percentLengthType.autoRE.exec(value);
            if (autoMatch) {
                return {
                    value: {auto: true},
                    remaining: value.substring(autoMatch[0].length)
                };
            }
            out = {};
            calcMatch = percentLengthType.outerCalcRE.exec(value);
            if (!calcMatch) {
                singleValue = percentLengthType.valueRE.exec(value);
                if (singleValue && (singleValue.length === 4)) {
                    out[singleValue[3]] = Number(singleValue[1]);
                    return {
                        value: out,
                        remaining: value.substring(singleValue[0].length)
                    };
                }
                return undefined;
            }
            remaining = value.substring(calcMatch[0].length);
            calcInnards = calcMatch[2];
            firstTime = true;
            while (true) {
                reversed = false;
                if (firstTime) {
                    firstTime = false;
                } else {
                    op = operatorRE.exec(calcInnards);
                    if (!op) {
                        return undefined;
                    }
                    if (op[1] === '-') {
                        reversed = true;
                    }
                    calcInnards = calcInnards.substring(op[0].length);
                }
                value = valueRE.exec(calcInnards);
                if (!value) {
                    return undefined;
                }
                valueUnit = value[3];
                valueNumber = Number(value[1]);
                if (!((typeof out[valueUnit] !== "undefined") && (out[valueUnit] !== null))) {
                    out[valueUnit] = 0;
                }
                if (reversed) {
                    out[valueUnit] -= valueNumber;
                } else {
                    out[valueUnit] += valueNumber;
                }
                calcInnards = calcInnards.substring(value[0].length);
                if (/\s*/.exec(calcInnards)[0].length === calcInnards.length) {
                    return {
                        value: out,
                        remaining: remaining
                    };
                }
            }
        }
    },

    negate: {
        value: function (value) {
            var out = {},
                unit;

            for (unit in value) {
                out[unit] = -value[unit];
            }
            return out;
        }
    }

});

percentLengthType.detectFeatures = function () {
    var el = document.createElement("div"),
        calcFunction;

    el.style.cssText = "width: calc(0px); width: -webkit-calc(0px);";
    calcFunction = el.style.width.split('(')[0];
    function detectProperty(candidateProperties) {
        return [].filter.call(candidateProperties, function(property) {
            return property in el.style;
        })[0];
    }
    var transformProperty = detectProperty(['transform', 'webkitTransform', 'msTransform']);
    var perspectiveProperty = detectProperty(['perspective', 'webkitPerspective', 'msPerspective']);
    return {
        calcFunction: calcFunction,
        transformProperty: transformProperty,
        transformOriginProperty: transformProperty + 'Origin',
        perspectiveProperty: perspectiveProperty,
        perspectiveOriginProperty: perspectiveProperty + 'Origin'
    };
}
percentLengthType.features = percentLengthType.detectFeatures();
percentLengthType.outerCalcRE = /^\s*(-webkit-)?calc\s*\(\s*([^)]*)\)/;
percentLengthType.valueRE = /^\s*(-?[0-9]+(\.[0-9])?[0-9]*)([a-zA-Z%]*)/;
percentLengthType.operatorRE = /^\s*([+-])/;
percentLengthType.autoRE = /^\s*auto/i;

var positionListType = exports.positionListType = Montage.specialize(null, {

    zero: {
        value: function () {
            return [positionType.zero()];
        }
    },

    add: {
        value: function (base, delta) {
            var out = [],
                maxLength = Math.max(base.length, delta.length),
                basePosition,
                deltaPosition,
                i;

            for (i = 0; i < maxLength; i++) {
                basePosition = base[i] ? base[i] : positionType.zero();
                deltaPosition = delta[i] ? delta[i] : positionType.zero();
                out.push(positionType.add(basePosition, deltaPosition));
            }
            return out;
        }
    },

    interpolate: {
        value: function (from, to, f) {
            var out = [],
                maxLength = Math.max(from.length, to.length),
                fromPosition,
                toPosition,
                i;

            for (i = 0; i < maxLength; i++) {
                fromPosition = from[i] ? from[i] : positionType.zero();
                toPosition = to[i] ? to[i] : positionType.zero();
                out.push(positionType.interpolate(fromPosition, toPosition, f));
            }
            return out;
        }
    },

    toCssValue: {
        value: function (value) {
            return value.map(positionType.toCssValue).join(', ');
        }
    },

    isDefinedAndNotNull: {
        value: function (val) {
            return ((typeof val !== "undefined") && (val !== null));
        }
    },

    fromCssValue: {
        value: function (value) {
            var positionValues,
                out;

            if ((typeof value !== "undefined") && (value !== null)) {
                return undefined;
            }
            if (!value.trim()) {
                return [positionType.fromCssValue('0% 0%')];
            }
            positionValues = value.split(',');
            out = positionValues.map(positionType.fromCssValue);
            return out.every(this.isDefinedAndNotNull) ? out : undefined;
        }
    }
});

var nonNumericType = exports.nonNumericType = Montage.specialize(null, {

    add: {
        value: function (base, delta) {
            if (typeof delta !== "undefined") {
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

var Type = exports.Type = Montage.specialize(null, {

    getType: {
        value: function (property) {
            return Type.propertyTypes[property] || nonNumericType;
        }
    }

});

var createObject = function(proto, obj) {
  var newObject = Object.create(proto);
  Object.getOwnPropertyNames(obj).forEach(function(name) {
    Object.defineProperty(
        newObject, name, Object.getOwnPropertyDescriptor(obj, name));
  });
  return newObject;
};
var typeWithKeywords = function(keywords, type) {
  var isKeyword;
  if (keywords.length === 1) {
    var keyword = keywords[0];
    isKeyword = function(value) {
      return value === keyword;
    };
  } else {
    isKeyword = function(value) {
      return keywords.indexOf(value) >= 0;
    };
  }
  return createObject(type, {
    add: function(base, delta) {
      if (isKeyword(base) || isKeyword(delta)) {
        return delta;
      }
      return type.add(base, delta);
    },
    interpolate: function(from, to, f) {
      if (isKeyword(from) || isKeyword(to)) {
        return nonNumericType.interpolate(from, to, f);
      }
      return type.interpolate(from, to, f);
    },
    toCssValue: function(value, svgMode) {
      return isKeyword(value) ? value : type.toCssValue(value, svgMode);
    },
    fromCssValue: function(value) {
      return isKeyword(value) ? value : type.fromCssValue(value);
    }
  });
};
var percentLengthAutoType = exports.percentLengthAutoType = typeWithKeywords(['auto'], percentLengthType);
var lengthAutoType = typeWithKeywords(['auto'], percentLengthType);
var numberType = {
  add: function(base, delta) {
    // If base or delta are 'auto', we fall back to replacement.
    if (base === 'auto' || delta === 'auto') {
      return nonNumericType.add(base, delta);
    }
    return base + delta;
  },
  interpolate: function(from, to, f) {
    // If from or to are 'auto', we fall back to step interpolation.
    if (from === 'auto' || to === 'auto') {
      return nonNumericType.interpolate(from, to);
    }
    return Interpolation.interp(from, to, f);
  },
  toCssValue: function(value) { return value + ''; },
  fromCssValue: function(value) {
    if (value === 'auto') {
      return 'auto';
    }
    var result = Number(value);
    return isNaN(result) ? undefined : result;
  }
};

var integerType = createObject(numberType, {
  interpolate: function(from, to, f) {
    // If from or to are 'auto', we fall back to step interpolation.
    if (from === 'auto' || to === 'auto') {
      return nonNumericType.interpolate(from, to);
    }
    return Math.floor(interp(from, to, f));
  }
});

var fontWeightType = {
  add: function(base, delta) { return base + delta; },
  interpolate: function(from, to, f) {
    return interp(from, to, f);
  },
  toCssValue: function(value) {
    value = Math.round(value / 100) * 100;
    value = Interpolation.clamp(value, 100, 900);
    if (value === 400) {
      return 'normal';
    }
    if (value === 700) {
      return 'bold';
    }
    return String(value);
  },
  fromCssValue: function(value) {
    // TODO: support lighter / darker ?
    var out = Number(value);
    if (isNaN(out) || out < 100 || out > 900 || out % 100 !== 0) {
      return undefined;
    }
    return out;
  }
};
var originType = {
  zero: function() { return [{'%': 0}, {'%': 0}, {px: 0}]; },
  add: function(base, delta) {
    return [
      percentLengthType.add(base[0], delta[0]),
      percentLengthType.add(base[1], delta[1]),
      percentLengthType.add(base[2], delta[2])
    ];
  },
  interpolate: function(from, to, f) {
    return [
      percentLengthType.interpolate(from[0], to[0], f),
      percentLengthType.interpolate(from[1], to[1], f),
      percentLengthType.interpolate(from[2], to[2], f)
    ];
  },
  toCssValue: function(value) {
    var result = percentLengthType.toCssValue(value[0]) + ' ' +
        percentLengthType.toCssValue(value[1]);
    // Return the third value if it is non-zero.
    for (var unit in value[2]) {
      if (value[2][unit] !== 0) {
        return result + ' ' + percentLengthType.toCssValue(value[2]);
      }
    }
    return result;
  },
  fromCssValue: function(value) {
    var tokens = positionType.consumeAllTokensFromString(value);
    if (!tokens) {
      return undefined;
    }
    var out = ['center', 'center', {px: 0}];
    switch (tokens.length) {
      case 0:
        return originType.zero();
      case 1:
        if (positionType.isHorizontalToken(tokens[0])) {
          out[0] = tokens[0];
        } else if (positionType.isVerticalToken(tokens[0])) {
          out[1] = tokens[0];
        } else {
          return undefined;
        }
        return out.map(positionType.resolveToken);
      case 3:
        if (positionType.isKeyword(tokens[2])) {
          return undefined;
        }
        out[2] = tokens[2];
      case 2:
        if (positionType.isHorizontalToken(tokens[0]) &&
            positionType.isVerticalToken(tokens[1])) {
          out[0] = tokens[0];
          out[1] = tokens[1];
        } else if (positionType.isVerticalToken(tokens[0]) &&
            positionType.isHorizontalToken(tokens[1])) {
          out[0] = tokens[1];
          out[1] = tokens[0];
        } else {
          return undefined;
        }
        return out.map(positionType.resolveToken);
      default:
        return undefined;
    }
  }
};
var shadowType = {
  zero: function() {
    return {
      hOffset: lengthType.zero(),
      vOffset: lengthType.zero()
    };
  },
  _addSingle: function(base, delta) {
    if (base && delta && base.inset !== delta.inset) {
      return delta;
    }
    var result = {
      inset: base ? base.inset : delta.inset,
      hOffset: lengthType.add(
          base ? base.hOffset : lengthType.zero(),
          delta ? delta.hOffset : lengthType.zero()),
      vOffset: lengthType.add(
          base ? base.vOffset : lengthType.zero(),
          delta ? delta.vOffset : lengthType.zero()),
      blur: lengthType.add(
          base && base.blur || lengthType.zero(),
          delta && delta.blur || lengthType.zero())
    };
    if (base && base.spread || delta && delta.spread) {
      result.spread = lengthType.add(
          base && base.spread || lengthType.zero(),
          delta && delta.spread || lengthType.zero());
    }
    if (base && base.color || delta && delta.color) {
      result.color = colorType.add(
          base && base.color || colorType.zero(),
          delta && delta.color || colorType.zero());
    }
    return result;
  },
  add: function(base, delta) {
    var result = [];
    for (var i = 0; i < base.length || i < delta.length; i++) {
      result.push(this._addSingle(base[i], delta[i]));
    }
    return result;
  },
  _interpolateSingle: function(from, to, f) {
    if (from && to && from.inset !== to.inset) {
      return f < 0.5 ? from : to;
    }
    var result = {
      inset: from ? from.inset : to.inset,
      hOffset: lengthType.interpolate(
          from ? from.hOffset : lengthType.zero(),
          to ? to.hOffset : lengthType.zero(), f),
      vOffset: lengthType.interpolate(
          from ? from.vOffset : lengthType.zero(),
          to ? to.vOffset : lengthType.zero(), f),
      blur: lengthType.interpolate(
          from && from.blur || lengthType.zero(),
          to && to.blur || lengthType.zero(), f)
    };
    if (from && from.spread || to && to.spread) {
      result.spread = lengthType.interpolate(
          from && from.spread || lengthType.zero(),
          to && to.spread || lengthType.zero(), f);
    }
    if (from && from.color || to && to.color) {
      result.color = colorType.interpolate(
          from && from.color || colorType.zero(),
          to && to.color || colorType.zero(), f);
    }
    return result;
  },
  interpolate: function(from, to, f) {
    var result = [];
    for (var i = 0; i < from.length || i < to.length; i++) {
      result.push(this._interpolateSingle(from[i], to[i], f));
    }
    return result;
  },
  _toCssValueSingle: function(value) {
    return (value.inset ? 'inset ' : '') +
        lengthType.toCssValue(value.hOffset) + ' ' +
        lengthType.toCssValue(value.vOffset) + ' ' +
        lengthType.toCssValue(value.blur) +
        (value.spread ? ' ' + lengthType.toCssValue(value.spread) : '') +
        (value.color ? ' ' + colorType.toCssValue(value.color) : '');
  },
  toCssValue: function(value) {
    return value.map(this._toCssValueSingle).join(', ');
  },
  fromCssValue: function(value) {
    var shadowRE = /(([^(,]+(\([^)]*\))?)+)/g;
    var match;
    var shadows = [];
    while ((match = shadowRE.exec(value)) !== null) {
      shadows.push(match[0]);
    }

    var result = shadows.map(function(value) {
      if (value === 'none') {
        return shadowType.zero();
      }
      value = value.replace(/^\s+|\s+$/g, '');

      var partsRE = /([^ (]+(\([^)]*\))?)/g;
      var parts = [];
      while ((match = partsRE.exec(value)) !== null) {
        parts.push(match[0]);
      }

      if (parts.length < 2 || parts.length > 7) {
        return undefined;
      }
      var result = {
        inset: false
      };

      var lengths = [];
      while (parts.length) {
        var part = parts.shift();

        var length = lengthType.fromCssValue(part);
        if (length) {
          lengths.push(length);
          continue;
        }

        var color = colorType.fromCssValue(part);
        if (color) {
          result.color = color;
        }

        if (part === 'inset') {
          result.inset = true;
        }
      }

      if (lengths.length < 2 || lengths.length > 4) {
        return undefined;
      }
      result.hOffset = lengths[0];
      result.vOffset = lengths[1];
      if (lengths.length > 2) {
        result.blur = lengths[2];
      }
      if (lengths.length > 3) {
        result.spread = lengths[3];
      }
      return result;
    });

    return result.every(isDefined) ? result : undefined;
  }
};
var transformType = {
  add: function(base, delta) { return base.concat(delta); },
  interpolate: function(from, to, f) {
    var out = [];
    for (var i = 0; i < Math.min(from.length, to.length); i++) {
      if (from[i].t !== to[i].t || isMatrix(from[i])) {
        break;
      }
      out.push(interpTransformValue(from[i], to[i], f));
    }

    if (i < Math.min(from.length, to.length) ||
        from.some(isMatrix) || to.some(isMatrix)) {
      if (from.decompositionPair !== to) {
        from.decompositionPair = to;
        from.decomposition = decomposeMatrix(convertToMatrix(from.slice(i)));
      }
      if (to.decompositionPair !== from) {
        to.decompositionPair = from;
        to.decomposition = decomposeMatrix(convertToMatrix(to.slice(i)));
      }
      out.push(interpolateDecomposedTransformsWithMatrices(
          from.decomposition, to.decomposition, f));
      return out;
    }

    for (; i < from.length; i++) {
      out.push(interpTransformValue(from[i], {t: null, d: null}, f));
    }
    for (; i < to.length; i++) {
      out.push(interpTransformValue({t: null, d: null}, to[i], f));
    }
    return out;
  },
  toCssValue: function(value, svgMode) {
    // TODO: fix this :)
    var out = '';
    for (var i = 0; i < value.length; i++) {
      switch (value[i].t) {
        case 'rotate':
        case 'rotateX':
        case 'rotateY':
        case 'rotateZ':
        case 'skewX':
        case 'skewY':
          var unit = svgMode ? '' : 'deg';
          out += value[i].t + '(' + value[i].d + unit + ') ';
          break;
        case 'skew':
          var unit = svgMode ? '' : 'deg';
          out += value[i].t + '(' + value[i].d[0] + unit;
          if (value[i].d[1] === 0) {
            out += ') ';
          } else {
            out += ', ' + value[i].d[1] + unit + ') ';
          }
          break;
        case 'rotate3d':
          var unit = svgMode ? '' : 'deg';
          out += value[i].t + '(' + value[i].d[0] + ', ' + value[i].d[1] +
              ', ' + value[i].d[2] + ', ' + value[i].d[3] + unit + ') ';
          break;
        case 'translateX':
        case 'translateY':
        case 'translateZ':
        case 'perspective':
          out += value[i].t + '(' + lengthType.toCssValue(value[i].d[0]) +
              ') ';
          break;
        case 'translate':
          if (svgMode) {
            if (value[i].d[1] === undefined) {
              out += value[i].t + '(' + value[i].d[0].px + ') ';
            } else {
              out += (
                  value[i].t + '(' + value[i].d[0].px + ', ' +
                  value[i].d[1].px + ') ');
            }
            break;
          }
          if (value[i].d[1] === undefined) {
            out += value[i].t + '(' + lengthType.toCssValue(value[i].d[0]) +
                ') ';
          } else {
            out += value[i].t + '(' + lengthType.toCssValue(value[i].d[0]) +
                ', ' + lengthType.toCssValue(value[i].d[1]) + ') ';
          }
          break;
        case 'translate3d':
          var values = value[i].d.map(lengthType.toCssValue);
          out += value[i].t + '(' + values[0] + ', ' + values[1] +
              ', ' + values[2] + ') ';
          break;
        case 'scale':
          if (value[i].d[0] === value[i].d[1]) {
            out += value[i].t + '(' + value[i].d[0] + ') ';
          } else {
            out += value[i].t + '(' + value[i].d[0] + ', ' + value[i].d[1] +
                ') ';
          }
          break;
        case 'scaleX':
        case 'scaleY':
        case 'scaleZ':
          out += value[i].t + '(' + value[i].d[0] + ') ';
          break;
        case 'scale3d':
          out += value[i].t + '(' + value[i].d[0] + ', ' +
              value[i].d[1] + ', ' + value[i].d[2] + ') ';
          break;
        case 'matrix':
        case 'matrix3d':
          out += value[i].t + '(' + value[i].d.map(n).join(', ') + ') ';
          break;
      }
    }
    return out.substring(0, out.length - 1);
  },
  fromCssValue: function(value) {
    // TODO: fix this :)
    if (value === undefined) {
      return undefined;
    }
    var result = [];
    while (value.length > 0) {
      var r;
      for (var i = 0; i < transformREs.length; i++) {
        var reSpec = transformREs[i];
        r = reSpec[0].exec(value);
        if (r) {
          result.push({t: reSpec[2], d: reSpec[1](r)});
          value = value.substring(r[0].length);
          break;
        }
      }
      if (!isDefinedAndNotNull(r)) {
        return result;
      }
    }
    return result;
  }
};
var visibilityType = createObject(nonNumericType, {
  interpolate: function(from, to, f) {
    if (from !== 'visible' && to !== 'visible') {
      return nonNumericType.interpolate(from, to, f);
    }
    if (f <= 0) {
      return from;
    }
    if (f >= 1) {
      return to;
    }
    return 'visible';
  },
  fromCssValue: function(value) {
    if (['visible', 'hidden', 'collapse'].indexOf(value) !== -1) {
      return value;
    }
    return undefined;
  }
});
Type.propertyTypes = {
    backgroundColor: colorType,
    backgroundPosition: positionListType,
    borderBottomColor: colorType,
    borderBottomLeftRadius: percentLengthType,
    borderBottomRightRadius: percentLengthType,
    borderBottomWidth: percentLengthType,
    borderLeftColor: colorType,
    borderLeftWidth: percentLengthType,
    borderRightColor: colorType,
    borderRightWidth: percentLengthType,
    borderSpacing: percentLengthType,
    borderTopColor: colorType,
    borderTopLeftRadius: percentLengthType,
    borderTopRightRadius: percentLengthType,
    borderTopWidth: percentLengthType,
    bottom: percentLengthAutoType,
    boxShadow: shadowType,
    //clip: typeWithKeywords(["auto"], rectangleType),
    color: colorType,
    cx: percentLengthType,
    cy: percentLengthType,
    //d: pathType,
    dx: percentLengthType,
    dy: percentLengthType,
    fill: colorType,
    floodColor: colorType,
    fontSize: typeWithKeywords(["smaller", "larger"], percentLengthType),
    //fontWeight: typeWithKeywords(["lighter", "bolder"], fontWeightType),
    height: percentLengthAutoType,
    left: percentLengthAutoType,
    letterSpacing: typeWithKeywords(["normal"], percentLengthType),
    lightingColor: colorType,
    lineHeight: percentLengthType,
    marginBottom: lengthAutoType,
    marginLeft: lengthAutoType,
    marginRight: lengthAutoType,
    marginTop: lengthAutoType,
    maxHeight: typeWithKeywords(
        ["none", "max-content", "min-content", "fill-available", "fit-content"],
        percentLengthType
    ),
    maxWidth: typeWithKeywords(
        ["none", "max-content", "min-content", "fill-available", "fit-content"],
        percentLengthType
    ),
    minHeight: typeWithKeywords(
        ["max-content", "min-content", "fill-available", "fit-content"],
        percentLengthType
    ),
    minWidth: typeWithKeywords(
        ["max-content", "min-content", "fill-available", "fit-content"],
        percentLengthType
    ),
    opacity: numberType,
    outlineColor: typeWithKeywords(["invert"], colorType),
    outlineOffset: percentLengthType,
    outlineWidth: percentLengthType,
    paddingBottom: percentLengthType,
    paddingLeft: percentLengthType,
    paddingRight: percentLengthType,
    paddingTop: percentLengthType,
    perspective: typeWithKeywords(["none"], percentLengthType),
    perspectiveOrigin: originType,
    r: percentLengthType,
    right: percentLengthAutoType,
    stopColor: colorType,
    stroke: colorType,
    textIndent: typeWithKeywords(["each-line", "hanging"], percentLengthType),
    textShadow: shadowType,
    top: percentLengthAutoType,
    transform: transformType,
    transformOrigin: originType,
    verticalAlign: typeWithKeywords([
        "baseline",
        "sub",
        "super",
        "text-top",
        "text-bottom",
        "middle",
        "top",
        "bottom"
    ], percentLengthType),
    visibility: visibilityType,
    width: typeWithKeywords([
        "border-box",
        "content-box",
        "auto",
        "max-content",
        "min-content",
        "available",
        "fit-content"
    ], percentLengthType),
    wordSpacing: typeWithKeywords(["normal"], percentLengthType),
    x: percentLengthType,
    y: percentLengthType,
    zIndex: typeWithKeywords(["auto"], integerType)
};