var Montage = require("montage").Montage,
    TimingFunction = require("ui/timing-functions").TimingFunction;

var Timing = exports.Timing = Montage.specialize({

    init: {
        value: function (timingInput) {
            var key;

            if (typeof timingInput === "object") {
                for (key in timingInput) {
                    if ((key in Timing.prototype) && (key[0] !== "_") && (key !== "init")) {
                        this[key] = timingInput[key];
                    }
                }
            } else {
                if ((typeof timingInput !== "undefined") && (timingInput !== null)) {
                    this.duration = Number(timingInput);
                }
            }
            return this;
        }
    },

    _timingFunction: {
        value: function (timedItem) {
            var timingFunction = TimingFunction.createFromString(
                    this.easing, timedItem
                );

            // TODO: review this cache, probably not needed
            this._timingFunction = function() {
                return timingFunction;
            };
            return timingFunction;
        }
    },

    _invalidateTimingFunction: {
        value: function() {
            delete this._timingFunction;
        }
    },

    _delay: {
        value: 0
    },

    delay: {
        get: function () {
            return this._delay;
        },
        set: function (value) {
            this._delay = Number(value);
        }
    },

    _endDelay: {
        value: 0
    },

    endDelay: {
        get: function () {
            return this._endDelay;
        },
        set: function (value) {
            this._endDelay = Number(value);
        }
    },

    _fill: {
        value: "auto"
    },

    fill: {
        get: function () {
            return this._fill;
        },
        set: function (value) {
            this._fill = value;
        }
    },

    _iterationStart: {
        value: 0
    },

    iterationStart: {
        get: function () {
            return this._iterationStart;
        },
        set: function (value) {
            this._iterationStart = Number(value);
        }
    },

    _iterations: {
        value: 1
    },

    iterations: {
        get: function() {
            return this._iterations;
        },
        set: function (value) {
            value = Number(value);

            if (value < 0) {
                this._iterations = 1;
            } else {
                this._iterations = value;
            }
        }
    },

    _duration: {
        value: "auto"
    },

    duration: {
        get: function () {
            return this._duration;
        },
        set: function (value) {
            if (value === "auto") {
                this._duration = "auto";
            } else {
                this._duration = Number(value);
            }
        }
    },

    _playbackRate: {
        value: 1
    },

    playbackRate: {
        get: function () {
            return this._playbackRate;
        },
        set: function (value) {
            this._playbackRate = Number(value);
        }
    },

    _direction: {
        value: "normal"
    },

    direction: {
        get: function () {
            return this._direction;
        },
        set: function (value) {
            switch (value) {
                case "normal":
                case "reverse":
                case "alternate":
                case "alternate-reverse":
                    this._direction = value;
            }
        }
    },

    _easing: {
        value: "linear"
    },

    easing: {
        get: function () {
            return this._easing;
        },
        set: function (value) {
            this._easing = value;
        }
    }

});