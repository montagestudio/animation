var Montage = require("montage").Montage;

var AnimationStack = exports.AnimationStack = Montage.specialize({

    enterModifyCurrentAnimationState: {
        value: function () {
            AnimationStack.modifyCurrentAnimationStateDepth++;
        }
    },

    exitModifyCurrentAnimationState: {
        value: function (updateCallback) {
            AnimationStack.modifyCurrentAnimationStateDepth--;
            if ((AnimationStack.modifyCurrentAnimationStateDepth === 0) && updateCallback) {
                updateCallback();
            }
        }
    }

});

AnimationStack.modifyCurrentAnimationStateDepth = 0;