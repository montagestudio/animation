var Montage = require("montage").Montage,
    PositionType = require("ui/types/position-type").PositionType;

var PositionListType = exports.PositionListType = Montage.specialize(null, {

    zero: {
        value: function () {
            return [PositionType.zero()];
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
                basePosition = base[i] ? base[i] : PositionType.zero();
                deltaPosition = delta[i] ? delta[i] : PositionType.zero();
                out.push(PositionType.add(basePosition, deltaPosition));
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
                fromPosition = from[i] ? from[i] : PositionType.zero();
                toPosition = to[i] ? to[i] : PositionType.zero();
                out.push(PositionType.interpolate(fromPosition, toPosition, f));
            }
            return out;
        }
    },

    toCssValue: {
        value: function (value) {
            return value.map(PositionType.toCssValue).join(', ');
        }
    },

    isDefinedAndNotNull: {
        value: function (val) {
            return ((val !== undefined) && (val !== null));
        }
    },

    fromCssValue: {
        value: function (value) {
            var positionValues,
                out;

            if ((value === "undefined") || (value === null)) {
                return undefined;
            }
            if (!value.trim()) {
                return [PositionType.fromCssValue('0% 0%')];
            }
            positionValues = value.split(',');
            out = positionValues.map(PositionType.fromCssValue);
            return out.every(this.isDefinedAndNotNull) ? out : undefined;
        }
    }
});