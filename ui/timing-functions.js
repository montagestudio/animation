var Montage = require("montage").Montage,
    Interpolation = require("ui/interpolation").Interpolation;

var TimingFunction = exports.TimingFunction = Montage.specialize(null, {

    createFromString: {
        value: function(spec, timedItem) {
            var preset = presetTimingFunctions[spec],
                stepMatch,
                bezierMatch;

            if (preset) {
                return preset;
            }
            if (spec === 'paced') {
                if ((timedItem instanceof Animation) &&
                    (timedItem.effect instanceof MotionPathEffect)) {
                    return PacedTimingFunction.create().init(timedItem.effect);
                }
                return presetTimingFunctions.linear;
            }
            stepMatch = /steps\(\s*(\d+)\s*,\s*(start|end|middle)\s*\)/.exec(spec);
            if (stepMatch) {
                return StepTimingFunction.create().init(Number(stepMatch[1]), stepMatch[2]);
            }
            bezierMatch = /cubic-bezier\(([^,]*),([^,]*),([^,]*),([^)]*)\)/.exec(spec);
            if (bezierMatch) {
                return CubicBezierTimingFunction.create().init([
                    Number(bezierMatch[1]),
                    Number(bezierMatch[2]),
                    Number(bezierMatch[3]),
                    Number(bezierMatch[4])
                ]);
            }
            return presetTimingFunctions.linear;
        }
    }

});

var StepTimingFunction = exports.StepTimingFunction = TimingFunction.specialize({

    init: {
        value: function (numSteps, position) {
            this.numSteps = numSteps;
            this.position = position || 'end';
            return this;
        }
    },

    scaleTime: {
        value: function(fraction) {
            var stepSize;

            if (fraction >= 1) {
                return 1;
            }
            stepSize = 1 / this.numSteps;
            if (this.position === 'start') {
                fraction += stepSize;
            } else {
                if (this.position === 'middle') {
                    fraction += stepSize / 2;
                }
            }
            return fraction - fraction % stepSize;
        }
    }

});

var PacedTimingFunction = exports.PacedTimingFunction = TimingFunction.specialize({

    init: {
        value: function (pathEffect) {
            this._pathEffect = pathEffect;
            this._range = {min: 0, max: 1};
            return this;
        }
    },

    setRange: {
        value: function(range) {
            this._range = range;
        }
    },

    scaleTime: {
        value: function(fraction) {
            var cumulativeLengths = this._pathEffect._cumulativeLengths,
                numSegments = cumulativeLengths.length - 1;

            if (!cumulativeLengths[numSegments] || fraction <= 0) {
                return this._range.min;
            }
            if (fraction >= 1) {
                return this._range.max;
            }
            var minLength = this.lengthAtIndex(this._range.min * numSegments),
                maxLength = this.lengthAtIndex(this._range.max * numSegments),
                length = Interpolation.interp(minLength, maxLength, fraction),
                leftIndex = this.findLeftIndex(cumulativeLengths, length),
                leftLength = cumulativeLengths[leftIndex],
                segmentLength = cumulativeLengths[leftIndex + 1] - leftLength;

            if (segmentLength > 0) {
                return (leftIndex + (length - leftLength) / segmentLength) / numSegments;
            }
            return leftLength / cumulativeLengths.length;
        }
    },

    findLeftIndex: {
        value: function(array, value) {
            var leftIndex = 0,
                rightIndex = array.length,
                midIndex;

            while (rightIndex - leftIndex > 1) {
                midIndex = (leftIndex + rightIndex) >> 1;
                if (array[midIndex] <= value) {
                    leftIndex = midIndex;
                } else {
                    rightIndex = midIndex;
                }
            }
            return leftIndex;
        }
    },

    lengthAtIndex: {
        value: function(i) {
            var leftIndex = Math.floor(i),
                startLength = this._pathEffect._cumulativeLengths[leftIndex],
                endLength = this._pathEffect._cumulativeLengths[leftIndex + 1],
                indexFraction = i % 1;

            return Interpolation.interp(startLength, endLength, indexFraction);
        }
    }

});

var CubicBezierTimingFunction = exports.CubicBezierTimingFunction = TimingFunction.specialize({

    init: {
        value: function (spec) {
            var ii, i;

            this.params = spec;
            this.map = [];
            for (ii = 0; ii <= 100; ii += 1) {
                i = ii / 100;
                this.map.push([
                    3 * i * (1 - i) * (1 - i) * this.params[0] +
                    3 * i * i * (1 - i) * this.params[2] + i * i * i,
                    3 * i * (1 - i) * (1 - i) * this.params[1] +
                    3 * i * i * (1 - i) * this.params[3] + i * i * i
                ]);
            };
            return this;
        }
    },

    scaleTime: {
        value: function(fraction) {
            var fst = 0,
                yDiff, xDiff,
                p;

            while ((fst !== 100) && (fraction > this.map[fst][0])) {
                fst += 1;
            }
            if ((fraction === this.map[fst][0]) || (fst === 0)) {
                return this.map[fst][1];
            }
            xDiff = this.map[fst][0] - this.map[fst - 1][0];
            yDiff = this.map[fst][1] - this.map[fst - 1][1];
            p = (fraction - this.map[fst - 1][0]) / xDiff;
            return this.map[fst - 1][1] + p * yDiff;
        }
    }

});

var presetTimingFunctions = exports.PresetTimingFunctions = {
    "linear": null,
    "ease": CubicBezierTimingFunction.create().init([0.25, 0.1, 0.25, 1.0]),
    "ease-in": CubicBezierTimingFunction.create().init([0.42, 0, 1.0, 1.0]),
    "ease-out": CubicBezierTimingFunction.create().init([0, 0, 0.58, 1.0]),
    "ease-in-out": CubicBezierTimingFunction.create().init([0.42, 0, 0.58, 1.0]),
    "step-start": StepTimingFunction.create().init(1, 'start'),
    "step-middle": StepTimingFunction.create().init(1, 'middle'),
    "step-end": StepTimingFunction.create().init(1, 'end')
};