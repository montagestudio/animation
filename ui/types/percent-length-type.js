var Montage = require("montage").Montage,
    Interpolation = require("ui/interpolation").Interpolation,
    Properties = require("ui/properties").Properties;

var PercentLengthType = exports.PercentLengthType = Montage.specialize(null, {

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
                            s = Properties.features.calcFunction + "(" + s + " + " + value[item] + item + ")";
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
            var result = PercentLengthType.consumeValueFromString(value);

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
            autoMatch = PercentLengthType.autoRE.exec(value);
            if (autoMatch) {
                return {
                    value: {auto: true},
                    remaining: value.substring(autoMatch[0].length)
                };
            }
            out = {};
            calcMatch = PercentLengthType.outerCalcRE.exec(value);
            if (!calcMatch) {
                singleValue = PercentLengthType.valueRE.exec(value);
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
    },

    outerCalcRE: {
        value: /^\s*(-webkit-)?calc\s*\(\s*([^)]*)\)/
    },

    valueRE: {
        value: /^\s*(-?[0-9]+(\.[0-9])?[0-9]*)([a-zA-Z%]*)/
    },

    operatorRE: {
        value: /^\s*([+-])/
    },

    autoRE: {
        value: /^\s*auto/i
    }

});