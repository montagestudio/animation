var Montage = require("montage").Montage,
    Time = require("ui/time").Time;

var AnimationTimeline = exports.AnimationTimeline = Montage.specialize({

    currentTime: {
        get: function () {
            return Time.relativeTime(
                Time.cachedClockTime(),
                AnimationTimeline._startTime
            );
        }
    },

    effectiveCurrentTime: {
        get: function () {
            return this.currentTime || 0;
        }
    },

    play: {
        value: function (source) {
            return AnimationPlayer.create().init(source, this);
        }
    },

    getCurrentPlayers: {
        value: function() {
            return PLAYERS.filter(function (player) {
                return !player._isPastEndOfActiveInterval();
            });
        }
    },

    toTimelineTime: {
        value: function (otherTime, other) {
            if ((this.currentTime === null) || (other.currentTime === null)) {
                return null;
            } else {
                return otherTime + other._startTime - this._startTime;
            }
        }
    },

    _pauseAnimationsForTesting: {
        value: function (pauseAt) {
            PLAYERS.forEach(function (player) {
                player.pause();
                player.currentTime = pauseAt;
            });
        }
    }

});

AnimationTimeline._startTime = window.performance.now();