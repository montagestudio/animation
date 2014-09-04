var Montage = require("montage").Montage,
    AnimationStack = require("ui/animation-stack").AnimationStack;

var AnimationPlayer = exports.AnimationPlayer = AnimationStack.specialize({

    init: {
        value: function (source, timeline) {
            this.enterModifyCurrentAnimationState();
            try {
                this._registeredOnTimeline = false;
                this._sequenceNumber = playerSequenceNumber++;
                this._timeline = timeline;
                this._startTime =
                this.timeline.currentTime === null ? 0 : this.timeline.currentTime;
                this._storedTimeLag = 0.0;
                this._pausedState = false;
                this._holdTime = null;
                this._previousCurrentTime = null;
                this._playbackRate = 1.0;
                this._hasTicked = false;
                this.source = source;
                this._lastCurrentTime = undefined;
                this._finishedFlag = false;
                initializeEventTarget(this);
                playersAreSorted = false;
                maybeRestartAnimation();
            } finally {
                this.exitModifyCurrentAnimationState(ensureRetickBeforeGetComputedStyle);
            }
        }
    }

});