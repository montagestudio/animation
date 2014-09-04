var Montage = require("montage").Montage,
    AnimationNode = require("ui/animation-node").AnimationNode,
    KeyframeEffect = require("ui/keyframe-effect").KeyframeEffect,
    type = require("ui/type");

var isEffectCallback = function(animationEffect) {
  return typeof animationEffect === 'function';
};

var interpretAnimationEffect = function(animationEffect) {
  /*if (animationEffect instanceof AnimationEffect ||
      isEffectCallback(animationEffect)) {
    return animationEffect;
  } else if (isDefinedAndNotNull(animationEffect) &&
      typeof animationEffect === 'object') {
    // The spec requires animationEffect to be an instance of
    // OneOrMoreKeyframes, but this type is just a dictionary or a list of
    // dictionaries, so the best we can do is test for an object.
    return new KeyframeEffect(animationEffect);
  }
  return null;*/

  return KeyframeEffect.create().init(animationEffect);
};

var Animation = exports.Animation = AnimationNode.specialize({

    target: {
        value: null
    },

    _effect: {
        value: null
    },

    effect: {
        get: function () {
            return this._effect;
        },
        set: function (value) {
            //this._effect = value;
            this._effect = interpretAnimationEffect(value);
            //this.timing._invalidateTimingFunction();
        }
    },

    _sample: {
        value: function () {
            if ((typeof this._effect !== "undefined") && (this._effect !== null)) {
                if (typeof this.effect === "function") {
                    this.effect(this._timeFraction, this.target, this);
                } else {
                    this.effect._sample(this._timeFraction, this.currentIteration, this.target);
                    // this.underlyingValue is undefined, no idea of what it is for
                    //this.effect._sample(this._timeFraction, this.currentIteration, this.target, this.underlyingValue);
                }
            }
        }
    }

});