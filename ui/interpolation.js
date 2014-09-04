var Montage = require("montage").Montage,
    Type = require("ui/type").Type;

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