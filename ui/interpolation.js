var Montage = require("montage").Montage;

var Interpolation = exports.Interpolation = Montage.specialize(null, {

   interp: {
       value: function (from, to, f, type) {
            var zero;

            if (Array.isArray(from) || Array.isArray(to)) {
                return this.interpArray(from, to, f, type);
            }
            if (type && (type.indexOf("scale") === 0)) {
                zero = 1;
            } else {
                zero = 0;
            }
            if ((to === undefined) || (to === null)) {
                to = zero;
            }
            if ((from === undefined) || (from === null)) {
                from = zero;
            }
            return to * f + from * (1 - f);
        }
    },

    interpArray: {
        value: function (from, to, f, type) {
            var length,
                result = [],
                i;

            if (from) {
                length = from.length;
                if (to) {
                    // Is this case possible?
                    for (i = 0; i < length; i++) {
                        result[i] = this.interp(from[i], to[i], f, type);
                    }
                } else {
                    for (i = 0; i < length; i++) {
                        result[i] = this.interp(from[i], null, f, type);
                    }
                }

            } else {
                length = to.length;
                for (i = 0; i < length; i++) {
                    result[i] = this.interp(null, to[i], f, type);
                }
            }
            return result;
        }
    }

});