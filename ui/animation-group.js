var Montage = require("montage").Montage,
    AnimationNode = require("ui/animation-node").AnimationNode;

var AnimationGroup = exports.AnimationGroup = AnimationNode.specialize({

    children: {
        value: []
    },

    _intrinsicDuration: {
        value: function () {
            /*if (!isDefinedAndNotNull(this._cachedIntrinsicDuration)) {
                if (this.type === 'par') {
                    var dur = Math.max.apply(undefined, this._children.map(function(a) {
                        return a.endTime;
                    }));
                    this._cachedIntrinsicDuration = Math.max(0, dur);
                }
            }
            return this._cachedIntrinsicDuration;*/
            // TODO: cache

            var result = 0,
                duration,
                length = this.children.length,
                i;

            for (i = 0; i < length; i++) {
                duration = this.children[i].endTime;
                if (duration > result) {
                    result = duration;
                }
            }
            return duration;
        }
    },

    _sample: {
        value: function() {
            var length = this.children.length,
                i;

            for (i = 0; i < length; i++) {
                this.children[i]._iterationTime;
                this.children[i]._sample();
            }
        }
    }

});