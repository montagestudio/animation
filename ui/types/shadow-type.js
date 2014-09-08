var Montage = require("montage").Montage,
    PercentLengthType = require("ui/types/percent-length-type").PercentLengthType,
    ColorType = require("ui/types/color-type").ColorType;

var ShadowType = exports.ShadowType = Montage.specialize(null, {

    zero: {
        value: function () {
            return {
                hOffset: PercentLengthType.zero(),
                vOffset: PercentLengthType.zero()
            };
        }
    },

    _addSingle: {
        value: function (base, delta) {
            var result;

            if (base && delta && base.inset !== delta.inset) {
                return delta;
            }
            result = {
                inset: base ? base.inset : delta.inset,
                hOffset: PercentLengthType.add(
                        base ? base.hOffset : PercentLengthType.zero(),
                        delta ? delta.hOffset : PercentLengthType.zero()),
                vOffset: PercentLengthType.add(
                        base ? base.vOffset : PercentLengthType.zero(),
                        delta ? delta.vOffset : PercentLengthType.zero()),
                blur: PercentLengthType.add(
                        base && base.blur || PercentLengthType.zero(),
                        delta && delta.blur || PercentLengthType.zero())
            };
            if (base && base.spread || delta && delta.spread) {
                result.spread = PercentLengthType.add(
                        base && base.spread || PercentLengthType.zero(),
                        delta && delta.spread || PercentLengthType.zero());
            }
            if (base && base.color || delta && delta.color) {
                result.color = ColorType.add(
                        base && base.color || ColorType.zero(),
                        delta && delta.color || ColorType.zero());
            }
            return result;
        }
    },

    add: {
        value: function (base, delta) {
            var result = [],
                i;

            for (i = 0; i < base.length || i < delta.length; i++) {
                result.push(this._addSingle(base[i], delta[i]));
            }
            return result;
        }
    },

    _interpolateSingle: {
        value: function (from, to, f) {
            var result;

            if (from && to && from.inset !== to.inset) {
                if (f < .5) {
                    return from;
                } else {
                    return to;
                }
            }
            result = {
                inset: from ? from.inset : to.inset,
                hOffset: PercentLengthType.interpolate(
                        from ? from.hOffset : PercentLengthType.zero(),
                        to ? to.hOffset : PercentLengthType.zero(), f),
                vOffset: PercentLengthType.interpolate(
                        from ? from.vOffset : PercentLengthType.zero(),
                        to ? to.vOffset : PercentLengthType.zero(), f),
                blur: PercentLengthType.interpolate(
                        from && from.blur || PercentLengthType.zero(),
                        to && to.blur || PercentLengthType.zero(), f)
            };
            if (from && from.spread || to && to.spread) {
                result.spread = PercentLengthType.interpolate(
                        from && from.spread || PercentLengthType.zero(),
                        to && to.spread || PercentLengthType.zero(), f);
            }
            if (from && from.color || to && to.color) {
                result.color = ColorType.interpolate(
                        from && from.color || ColorType.zero(),
                        to && to.color || ColorType.zero(), f);
            }
            return result;
        }
    },

    interpolate: {
        value: function (from, to, f) {
            var result = [],
                i;

            for (i = 0; i < from.length || i < to.length; i++) {
                result.push(this._interpolateSingle(from[i], to[i], f));
            }
            return result;
        }
    },

    _toCssValueSingle: {
        value: function (value) {
            return (
                (value.inset ? "inset " : "") +
                PercentLengthType.toCssValue(value.hOffset) + " " +
                PercentLengthType.toCssValue(value.vOffset) + " " +
                PercentLengthType.toCssValue(value.blur) +
                (value.spread ? " " + PercentLengthType.toCssValue(value.spread) : "") +
                (value.color ? " " + ColorType.toCssValue(value.color) : "")
            );
        }
    },

    toCssValue: {
        value: function (value) {
            return value.map(this._toCssValueSingle).join(", ");
        }
    },

    fromCssValue: {
        value: function (value) {
            var shadowRE = /(([^(,]+(\([^)]*\))?)+)/g,
                match,
                shadows = [],
                result,
                partsRE,
                parts,
                part,
                lengths,
                length,
                color,
                i;

            while ((match = shadowRE.exec(value)) !== null) {
                shadows.push(match[0]);
            }
            result = shadows.map(function (value) {
                if (value === "none") {
                    return ShadowType.zero();
                }
                value = value.replace(/^\s+|\s+$/g, "");
                partsRE = /([^ (]+(\([^)]*\))?)/g;
                parts = [];
                while ((match = partsRE.exec(value)) !== null) {
                    parts.push(match[0]);
                }
                if (parts.length < 2 || parts.length > 7) {
                    return undefined;
                }
                result = {
                    inset: false
                };
                lengths = [];
                while (parts.length) {
                    part = parts.shift();
                    length = PercentLengthType.fromCssValue(part);
                    if (length) {
                        lengths.push(length);
                        continue;
                    }
                    color = ColorType.fromCssValue(part);
                    if (color) {
                        result.color = color;
                    }
                    if (part === "inset") {
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
            length = result.length;
            for (i = 0; i < length; i++) {
                if (result[i] === undefined) {
                    return undefined;
                }
            }
            return result;
        }
    }

});