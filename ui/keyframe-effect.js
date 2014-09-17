var Montage = require("montage").Montage,
    TimingFunction = require("ui/timing-functions").TimingFunction,
    PresetTimingFunctions = require("ui/timing-functions").PresetTimingFunctions,
    Type = require("ui/type").Type,
    Properties = require("ui/properties").Properties,
    Compositor = require("ui/compositor").Compositor,
    BlendedCompositableValue = require("ui/compositor").BlendedCompositableValue,
    AddReplaceCompositableValue = require("ui/compositor").AddReplaceCompositableValue;

var PropertySpecificKeyframe = exports.PropertySpecificKeyframe = Montage.specialize({

    init: {
        value: function (offset, composite, easing, property, cssValue) {
            this.offset = offset;
            this.composite = composite;
            this.easing = easing;
            this.property = property;
            this.cssValue = cssValue;
            this.cachedRawValue = null;
            return this;
        }
    },

    rawValue: {
        value: function() {
            if (!((typeof this.cachedRawValue !== "undefined") && (this.cachedRawValue !== null))) {
                this.cachedRawValue = Type.fromCssValue(this.property, this.cssValue);
            }
            return this.cachedRawValue;
        }
    }

});

var KeyframeInternal = exports.KeyframeInternal = Montage.specialize({

    init: {
        value: function (offset, composite, easing) {
            this.offset = offset;
            this.composite = composite;
            this.easing = easing;
            this.cssValues = {};
            return this;
        }
    },

    addPropertyValuePair: {
        value: function (property, value) {
            this.cssValues[property] = value;
        }
    },

    hasValueForProperty: {
        value: function (property) {
            return property in this.cssValues;
        }
    }

}, {

    isSupportedPropertyValue: {
        value: function (value) {
            // TODO: Check this properly!
            return value !== "";
        }
    },

    createFromNormalizedProperties: {
        value: function (properties) {
            var candidate,
                keyframe = KeyframeInternal.create().init(
                    properties.offset,
                    properties.composite,
                    properties.easing);

            for (candidate in properties) {
                if ((candidate !== "offset") &&
                    (candidate !== "composite") &&
                    (candidate !== "easing")) {
                    keyframe.addPropertyValuePair(candidate, properties[candidate]);
                }
            }
            return keyframe;
        }
    }

});

var KeyframeEffect = exports.KeyframeEffect = Montage.specialize({

    init: {
        value: function (frames, composite) {
            this.composite = composite;
            this.setFrames(frames);
            return this;
        }
    },

    _composite: {
        value: "replace"
    },

    composite: {
        get: function () {
            return this._composite;
        },
        set: function (value) {
            if (value === "add") {
                this._composite = "add";
            } else {
                this._composite = "replace";
            }
        }
    },

    _normalizeKeyframeDictionary: {
        value: function (properties) {
            var animationProperties = [],
                property, value, i,
                result = {
                    offset: null,
                    composite: null,
                    easing: PresetTimingFunctions.linear
                };

            for (property in properties) {
                switch (property) {
                    case "offset":
                        if (typeof properties.offset === "number") {
                            result.offset = properties.offset;
                        }
                        break;
                    case "composite":
                        if ((properties.composite === "add") || (properties.composite === "replace")) {
                            result.composite = properties.composite;
                        }
                        break;
                    case "easing":
                        result.easing = TimingFunction.createFromString(properties.easing);
                        break;
                    default:
                        animationProperties.push(property);
                }
            }
            // Next line seems to be invalid
            // animationProperties.sort(playerSortFunction);
            for (i = 0; i < animationProperties.length; i++) {
                property = animationProperties[i];
                if ((typeof properties[property] !== "undefined") && (properties[property] !== null)) {
                    value = properties[property].toString();
                } else {
                    value = "";
                }
                if (property in Properties.shorthandToLonghand) {
                    Properties.expandShorthand(property, value, result);
                } else {
                    result[property] = value;
                }
            }
            return result;
        }
    },

    getFrames: {
        value: function () {
            return this._keyframeDictionaries.slice(0);
        }
    },

    setFrames: {
        value: function (oneOrMoreKeyframeDictionaries) {
            if (!Array.isArray(oneOrMoreKeyframeDictionaries)) {
                oneOrMoreKeyframeDictionaries = [oneOrMoreKeyframeDictionaries];
            }
            this._keyframeDictionaries =
                oneOrMoreKeyframeDictionaries.map(this._normalizeKeyframeDictionary);
            // Set lazily
            this._cachedPropertySpecificKeyframes = null;
        }
    },

    _areKeyframeDictionariesLooselySorted: {
        value: function () {
            var previousOffset = -Infinity,
                i;

            for (i = 0; i < this._keyframeDictionaries.length; i++) {
                if ((typeof this._keyframeDictionaries[i].offset !== "undefined") && (this._keyframeDictionaries[i].offset !== null)) {
                    if (this._keyframeDictionaries[i].offset < previousOffset) {
                        return false;
                    }
                    previousOffset = this._keyframeDictionaries[i].offset;
                }
            }
            return true;
        }
    },

    _getDistributedKeyframes: {
        value: function () {
            var distributedKeyframes,
                unspecifiedKeyframes,
                lastOffsetIndex,
                nextOffsetIndex,
                lastOffset,
                nextOffset,
                localIndex,
                property,
                keyframe,
                offset,
                lenght,
                count,
                i;

            if (!this._areKeyframeDictionariesLooselySorted()) {
                return [];
            }
            distributedKeyframes = this._keyframeDictionaries.map(
                KeyframeInternal.createFromNormalizedProperties
            );
            length = distributedKeyframes.length;
            count = 0;
            for (i = 0; i < length; i++) {
                offset = distributedKeyframes[i].offset;
                if ((typeof offset !== "undefined") && (offset !== null)) {
                    if (offset >= 0) {
                        break;
                    } else {
                        count = i;
                    }
                }
            }
            distributedKeyframes.splice(0, count);
            length = distributedKeyframes.length;
            count = 0;
            for (i = length - 1; i >= 0; i--) {
                offset = distributedKeyframes[i].offset;
                if ((typeof offset !== "undefined") && (offset !== null)) {
                    if (offset <= 1) {
                        break;
                    } else {
                        count = length - i;
                    }
                }
            }
            distributedKeyframes.splice(length - count, count);
            length = distributedKeyframes.length;
            if ((length > 1) && !((typeof distributedKeyframes[0].offset !== null) && (distributedKeyframes[0].offset !== null))) {
                distributedKeyframes[0].offset = 0;
            }
            if ((length > 0) && !((typeof distributedKeyframes[length - 1].offset !== null) && (distributedKeyframes[length - 1].offset !== null))) {
                distributedKeyframes[length - 1].offset = 1;
            }
            lastOffsetIndex = 0;
            nextOffsetIndex = 0;
            for (i = 1; i < distributedKeyframes.length - 1; i++) {
                keyframe = distributedKeyframes[i];
                if ((typeof keyframe.offset !== "undefined") && (keyframe.offset !== null)) {
                    lastOffsetIndex = i;
                    continue;
                }
                if (i > nextOffsetIndex) {
                    nextOffsetIndex = i;
                    while (!((typeof distributedKeyframes[nextOffsetIndex].offset !== "undefined") && (distributedKeyframes[nextOffsetIndex].offset !== null))) {
                        nextOffsetIndex++;
                    }
                }
                lastOffset = distributedKeyframes[lastOffsetIndex].offset;
                nextOffset = distributedKeyframes[nextOffsetIndex].offset;
                unspecifiedKeyframes = nextOffsetIndex - lastOffsetIndex - 1;
                localIndex = i - lastOffsetIndex;
                distributedKeyframes[i].offset =
                    lastOffset + (nextOffset - lastOffset) * localIndex / (unspecifiedKeyframes + 1);
            }
            for (i = distributedKeyframes.length - 1; i >= 0; i--) {
                keyframe = distributedKeyframes[i];
                for (property in keyframe.cssValues) {
                    if (!KeyframeInternal.isSupportedPropertyValue(keyframe.cssValues[property])) {
                        delete(keyframe.cssValues[property]);
                    }
                }
                if (Object.keys(keyframe).length === 0) {
                    distributedKeyframes.splice(i, 1);
                }
            }
            return distributedKeyframes;
        }
    },

    _propertySpecificKeyframes: {
        value: function () {
            var distributedFrames,
                keyframe,
                property,
                frames,
                frame,
                i;

            if ((typeof this._cachedPropertySpecificKeyframes !== "undefined") && (this._cachedPropertySpecificKeyframes !== null)) {
                return this._cachedPropertySpecificKeyframes;
            }
            this._cachedPropertySpecificKeyframes = {};
            distributedFrames = this._getDistributedKeyframes();
            for (i = 0; i < distributedFrames.length; i++) {
                for (property in distributedFrames[i].cssValues) {
                    if (!(property in this._cachedPropertySpecificKeyframes)) {
                        this._cachedPropertySpecificKeyframes[property] = [];
                    }
                    frame = distributedFrames[i];
                    this._cachedPropertySpecificKeyframes[property].push(
                        PropertySpecificKeyframe.create().init(
                            frame.offset,
                            frame.composite,
                            frame.easing,
                            property,
                            frame.cssValues[property]
                        )
                    );
                }
            }
            for (property in this._cachedPropertySpecificKeyframes) {
                frames = this._cachedPropertySpecificKeyframes[property];
                if (frames[0].offset !== 0) {
                    keyframe = PropertySpecificKeyframe.create().init(
                        0,
                        "add",
                        PresetTimingFunctions.linear,
                        property,
                        Type.cssNeutralValue
                    );
                    frames.unshift(keyframe);
                }
                if (frames[frames.length - 1].offset !== 1) {
                    keyframe = PropertySpecificKeyframe.create().init(
                        1,
                        "add",
                        PresetTimingFunctions.linear,
                        property,
                        Type.cssNeutralValue
                    );
                    frames.push(keyframe);
                }
            }
            return this._cachedPropertySpecificKeyframes;
        }
    },

    _sample: {
        value: function (timeFraction, currentIteration, target) {
            var frames = this._propertySpecificKeyframes(),
                property;

            for (property in frames) {
                Compositor.setAnimatedValue(
                    target,
                    property,
                    this._sampleForProperty(
                        frames[property],
                        timeFraction,
                        currentIteration
                    )
                );
            }
        }
    },

    _sampleForProperty: {
        value: function (frames, timeFraction, currentIteration) {
            var startKeyframeIndex,
                length = frames.length,
                startKeyframe,
                endKeyframe,
                intervalDistance,
                i;

            if (timeFraction < 0) {
                if (frames[1].offset === 0) {
                    return AddReplaceCompositableValue.create().init(
                        frames[0].rawValue(),
                        this._compositeForKeyframe(frames[0])
                    );
                } else {
                    startKeyframeIndex = 0;
                }
            } else if (timeFraction >= 1) {
                if (frames[length - 2].offset === 1) {
                    return AddReplaceCompositableValue.create().init(
                        frames[length - 1].rawValue(),
                        this._compositeForKeyframe(frames[length - 1])
                    );
                } else {
                    startKeyframeIndex = length - 2;
                }
            } else {
                for (i = length - 1; i >= 0; i--) {
                    if (frames[i].offset <= timeFraction) {
                        startKeyframeIndex = i;
                        break;
                    }
                }
            }
            startKeyframe = frames[startKeyframeIndex];
            endKeyframe = frames[startKeyframeIndex + 1];
            if (startKeyframe.offset === timeFraction) {
                return AddReplaceCompositableValue.create().init(
                    startKeyframe.rawValue(),
                    this._compositeForKeyframe(startKeyframe)
                );
            }
            if (endKeyframe.offset === timeFraction) {
                return AddReplaceCompositableValue.create().init(
                    endKeyframe.rawValue(),
                    this._compositeForKeyframe(endKeyframe)
                );
            }
            intervalDistance = (
                (timeFraction - startKeyframe.offset) /
                (endKeyframe.offset - startKeyframe.offset)
            );
            if (startKeyframe.easing) {
                intervalDistance = startKeyframe.easing.scaleTime(intervalDistance);
            }
            return BlendedCompositableValue.create().init(
                AddReplaceCompositableValue.create().init(
                    startKeyframe.rawValue(),
                    this._compositeForKeyframe(startKeyframe)
                ),
                AddReplaceCompositableValue.create().init(
                    endKeyframe.rawValue(),
                    this._compositeForKeyframe(endKeyframe)
                ),
                intervalDistance
            );
        }
    },

    _compositeForKeyframe: {
        value: function (keyframe) {
            if ((typeof keyframe.composite !== "undefined") && (keyframe.composite !== null)) {
                return keyframe.composite;
            }
            return this.composite;
        }
    }

});