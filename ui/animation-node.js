var Montage = require("montage").Montage,
    Timing = require("ui/timing").Timing;

var AnimationNode = exports.AnimationNode = Montage.specialize({

    player: {
        value: null
    },

    _timing: {
        value: null
    },

    timing: {
        get: function () {
            return this._timing;
        },
        set: function (value) {
            this._timing = Timing.create().init(value);
        }
    },

    _startTime: {
        value: 0
    },

    endTime: {
        get: function () {
            return this._startTime + this._activeDuration + this.timing.delay + this.timing.endDelay;
        }
    },

    _intrinsicDuration: {
        value: function () {
            return 0;
        }
    },

    duration: {
        get: function () {
            var duration = this.timing.duration;

            if (duration === "auto") {
                return this._intrinsicDuration();
            } else {
                return duration;
            }
        }
    },

    _activeDuration: {
        get: function () {
            var repeatedDuration = this.duration * this.timing.iterations;

            return repeatedDuration / Math.abs(this.timing.playbackRate);
        }
    },

    _inheritedTime: {
        get: function () {
            if (this.parent) {
                return this.parent._iterationTime;
            } else {
                if (this.player) {
                    return this.player.currentTime;

                } else {
                    return null;
                }
            }
        }
    },

    _localTime: {
        get: function () {
            if (this._inheritedTime !== null) {
                return this._inheritedTime - this._startTime;
            } else {
                return null;
            }
        }
    },

    _timeFraction: {
        value: null
    },

    _getAdjustedAnimationTime: {
        value: function(animationTime) {
            var startOffset,
                duration = this.duration;

            if ((this.timing.iterationStart === 0) || (duration === 0)) {
                startOffset = 0;
            } else {
                startOffset = this.timing.iterationStart * duration;
            }
            if (this.timing.playbackRate < 0) {
                return (animationTime - this._activeDuration) * this.timing.playbackRate + startOffset;
            } else {
                return animationTime * this.timing.playbackRate + startOffset;
            }
        }
    },

    _animationTime: {
        get: function () {
            if (this._localTime < this.timing.delay) {
                if ((this.timing.fill === "backwards") || (this.timing.fill === "both")) {
                    return 0;
                } else {
                    return null;
                }
            } else {
                if (this._localTime < (this.timing.delay + this._activeDuration)) {
                    return this._localTime - this.timing.delay;
                } else {
                    if ((this.timing.fill === "forwards") || (this.timing.fill === "both")) {
                        return this._activeDuration;
                    } else {
                        return null;
                    }
                }
            }
        }
    },

    _isCurrentDirectionForwards: {
        value: function () {
            if (this.timing.direction === 'normal') {
                return true;
            }
            if (this.timing.direction === 'reverse') {
                return false;
            }
            var d = this.currentIteration;
            if (this.timing.direction === 'alternate-reverse') {
                d += 1;
            }
            return d % 2 === 0;
        }
    },

    _floorWithClosedOpenRange: {
        value: function (x, range) {
            return Math.floor(x / range);
        }
    },

    _floorWithOpenClosedRange: {
        value: function (x, range) {
            return Math.ceil(x / range) - 1;
        }
    },

    _modulusWithClosedOpenRange: {
        value: function (x, range) {
            var modulus = x % range;

            return modulus < 0 ? modulus + range : modulus;
        }
    },

    _modulusWithOpenClosedRange: {
        value: function (x, range) {
            var modulus = this._modulusWithClosedOpenRange(x, range);

            return modulus === 0 ? range : modulus;
        }
    },

    _scaleIterationTime: {
        value: function (unscaledIterationTime) {
            if (this._isCurrentDirectionForwards()) {
                return unscaledIterationTime;
            } else {
                return this.duration - unscaledIterationTime;
            }
        }
    },

    _iterationTime: {
        get: function () {
            var adjustedAnimationTime = this._getAdjustedAnimationTime(this._animationTime),
                duration = this.duration,
                repeatedDuration = duration * this.timing.iterations,
                startOffset = this.timing.iterationStart * duration,
                iterationTime,
                unscaledIterationTime,
                timingFunction,
                isAtEndOfIterations =
                    (this.timing.iterations !== 0) &&
                    (adjustedAnimationTime - startOffset === repeatedDuration);

            if (isAtEndOfIterations) {
                this.currentIteration = this._floorWithOpenClosedRange(
                    adjustedAnimationTime, duration
                );
                unscaledIterationTime = this._modulusWithOpenClosedRange(
                    adjustedAnimationTime, duration
                );
            } else {
                this.currentIteration = this._floorWithClosedOpenRange(
                    adjustedAnimationTime, duration
                );
                unscaledIterationTime = this._modulusWithClosedOpenRange(
                    adjustedAnimationTime, duration
                );
            }
            iterationTime = this._scaleIterationTime(unscaledIterationTime);
            if (duration == Infinity) {
                this._timeFraction = 0;
                return iterationTime;
            }
            this._timeFraction = iterationTime / duration;
            timingFunction = this.timing._timingFunction(this);
            if (timingFunction) {
              this._timeFraction = timingFunction.scaleTime(this._timeFraction);
            }
            iterationTime = this._timeFraction * duration;
            return iterationTime;
        }
    },


    // TODO: remove this?

    computedTiming: {
        get: function () {
            // ComputedAnimationTiming interface should be here?
            return {
                startTime: this._startTime,
                endTime: this.endTime,
                activeDuration: this._activeDuration,
                localTime: this._localTime,
                timeFraction: this._timeFraction
            };
        }
    },

    parent: {
        value: null
    },

    previousSibling: {
        value: null
    },

    nextSibling: {
        value: null
    },

    before: {
        value: function () {

        }
    },

    after: {
        value: function () {

        }
    },

    replace: {
        value: function () {

        }
    },

    remove: {
        value: function () {

        }
    }

});