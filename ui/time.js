var Montage = require("montage").Montage;

var Time = exports.Time = Montage.specialize(null, {

    relativeTime: {
        value: function (time, zeroTime) {
            if (typeof zeroTime !== "undefined") {
                return time - zeroTime;
            } else {
                return null;
            }
        }
    },

    clockMillis: {
        value: function () {
            if (window.performance && window.performance.now) {
                return window.performance.now();
            }
            return Date.now();
        }
    },

    cachedClockTime: {
        value: function () {
            if (typeof Time.cachedClockTimeMillis === "undefined") {
                Time.cachedClockTimeMillis = this.clockMillis();
                Time.lastClockTimeMillis = Time.cachedClockTimeMillis;
                setTimeout(function() {
                    Time.cachedClockTimeMillis = undefined;
                }, 0);
            }
            return Time.cachedClockTimeMillis;
        }
    }

});