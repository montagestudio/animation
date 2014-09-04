/**
 * @module ui/animation-player.reel
 * @requires montage/ui/component
 */
var Component = require("montage/ui/component").Component,
    Montage = require("montage").Montage,
    Time = require("ui/time").Time;


var documentTimeline = Montage.specialize(null, {

    currentTime: {
        get: function () {
            return Time.relativeTime(
                Time.cachedClockTime(),
                documentTimeline._startTime
            );
        }
    },

    effectiveCurrentTime: {
        get: function () {
            return documentTimeline.currentTime || 0;
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
    }

});

documentTimeline._startTime = window.performance.now();

/**
 * @class AnimationPlayer
 * @extends Component
 */
var AnimationPlayer = exports.AnimationPlayer = Component.specialize(/** @lends AnimationPlayer# */ {

    // TODO: playState and events are missing implementation

    constructor: {
        value: function () {
            var currentTime;

            this._timeline = documentTimeline;
            currentTime = this.timeline.currentTime;
            if (currentTime !== null) {
                this._startTime = currentTime;
            } else {
                this._startTime = 0;
            }
            this._sequenceNumber = AnimationPlayer._playerSequenceNumber;
            AnimationPlayer._playerSequenceNumber++;
        }
    },

    _playerSequenceNumber: {
        value: 0
    },

    source: {
        value: null
    },

    timeline: {
        get: function () {
            return this._timeline;
        },
        set: function (value) {
            this._timeline = value;
        }
    },

    _holdTime: {
        value: null
    },

    _storedTimeLag: {
        value: 0
    },

    _previousCurrentTime: {
        value: null
    },

    _getTimeLag: {
        value: function () {
            if (this._isPaused) {
                return this._getPauseTimeLag();
            }
            if ((this.playbackRate < 0) && (this._unlimitedCurrentTime <= 0)) {
                if (this._holdTime === null) {
                    this._holdTime = Math.min(this._previousCurrentTime, 0);
                }
                return this._getPauseTimeLag();
            }
            var sourceContentEnd = this.source ? this.source.endTime : 0;
            if ((this.playbackRate > 0) && (this._unlimitedCurrentTime >= sourceContentEnd)) {
                if (this._holdTime === null) {
                    this._holdTime = Math.max(this._previousCurrentTime, sourceContentEnd);
                }
                return this._getPauseTimeLag();
            }
            if (this._holdTime !== null) {
                this._storedTimeLag = this._getPauseTimeLag();
                this._holdTime = null;
            }
            return this._storedTimeLag;
        }
    },

    _getPauseTimeLag: {
        value: function () {
            return (this.timeline.effectiveCurrentTime - this.startTime) *
                this.playbackRate -
                this._holdTime;
        }
    },

    startTime: {
        get: function () {
            return this._startTime;
        },
        set: function (value) {
            this._startTime = value;
            this._holdTime = null;
        }
    },

    currentTime: {
        get: function () {
            this._previousCurrentTime =
                (this.timeline.effectiveCurrentTime - this.startTime) *
                this.playbackRate -
                this._getTimeLag();
            return this._previousCurrentTime;
        },
        set: function (value) {
            var sourceContentEnd = this.source ? this.source.endTime : 0;

            if (this._isPaused ||
                ((this.playbackRate > 0) && (value >= sourceContentEnd)) ||
                ((this.playbackRate < 0) && (value <= 0))) {
                this._holdTime = value;
            } else {
                this._holdTime = null;
                this._storedTimeLag =
                    (this.timeline.effectiveCurrentTime - this.startTime) *
                    this.playbackRate -
                    value;
            }
        }
    },

    _unlimitedCurrentTime: {
        get: function () {
            return (this.timeline.effectiveCurrentTime - this.startTime) *
                this.playbackRate -
                this._storedTimeLag;
        },
    },

    _playbackRate: {
        value: 1
    },

    playbackRate: {
        get: function () {
            return this._playbackRate;
        },
        set: function (value) {
            var cachedCurrentTime = this.currentTime;

            this._playbackRate = value;
            this.currentTime = cachedCurrentTime;
        }
    },

    _playState: {
        value: "idle"
    },

    playState: {
        get: function () {
            return this._playState;
        }
    },

    cancel: {
        value: function () {
            this.source = null;
        }
    },

    finish: {
        value: function () {
            var sourceEndTime;

            if (this.playbackRate < 0) {
                this.currentTime = 0;
            } else {
                if (this.playbackRate > 0) {
                    sourceEndTime = this.source ? this.source.endTime : 0;
                    if (sourceEndTime !== Infinity) {
                        this.currentTime = sourceEndTime;
                    }
                }
            }
        }
    },

    _pausedState: {
        value: false
    },

    _isPaused: {
        get: function () {
            return this._pausedState;
        },
        set: function (value) {
            if (value !== this._pausedState) {
                if (this._pausedState) {
                  this._storedTimeLag = this._getTimeLag();
                  this._holdTime = null;
                } else {
                  this._holdTime = this.currentTime;
                }
                this._pausedState = value;
            }
        }
    },

    play: {
        value: function () {
            this._isPaused = false;
            if (this.source) {
                if ((this.playbackRate > 0) &&
                    ((this.currentTime < 0) || (this.currentTime >= this.source.endTime))) {
                    this.currentTime = 0;
                } else {
                    if ((this.playbackRate < 0) &&
                        ((this.currentTime <= 0) || (this.currentTime > this.source.endTime))) {
                        this.currentTime = this.source.endTime;
                    }
                }
            }
        }
    },

    pause: {
        value: function () {
            this._isPaused = true;
        }
    },

    reverse: {
        value: function () {
            if (this.playbackRate !== 0) {
                if (this.source) {
                    if ((this.playbackRate > 0) && (this.currentTime >= this.source.endTime)) {
                        this.currentTime = this.source.endTime;
                    } else {
                        if ((this.playbackRate < 0) && (this.currentTime < 0)) {
                            this.currentTime = 0;
                        }
                    }
                }
                this.playbackRate = -this.playbackRate;
                this._isPaused = false;
            }
        }
    },

    enterDocument: {
        value: function (firstTime) {
            if (firstTime) {
                var self = this;

                this.pauseButton.addEventListener("click", function () {
                    self.pause();
                });
                this.playButton.addEventListener("click", function () {
                    self.play();
                });
                this.playbackRateInput.addEventListener("change", function () {
                    self.playbackRate = self.playbackRateInput.value;
                });
            }
        }
    },

    draw: {
        value: function () {
            this.currentTimeDisplay.value = (this.currentTime / 1000).toFixed(2);
            this.timelineDisplay.value = this.currentTime;
            this.timelineDisplay.max = this.source.endTime;
            this.needsDraw = true;
            compositor.applyAnimatedValues();
        }
    },

});
