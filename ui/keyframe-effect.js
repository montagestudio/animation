var Montage = require("montage").Montage,
    TimingFunction = require("ui/timing-functions").TimingFunction,
    presetTimingFunctions = require("ui/timing-functions").PresetTimingFunctions,
    Type = require("ui/type").Type,
    Interpolation = require("ui/interpolation").Interpolation,
    Properties = require("ui/properties").Properties;

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
                this.cachedRawValue = fromCssValue(this.property, this.cssValue);
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
            return value !== '';
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
                if ((candidate !== 'offset') &&
                    (candidate !== 'composite') &&
                    (candidate !== 'easing')) {
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
                    easing: presetTimingFunctions.linear
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
                        presetTimingFunctions.linear,
                        property,
                        cssNeutralValue
                    );
                    frames.unshift(keyframe);
                }
                if (frames[frames.length - 1].offset !== 1) {
                    keyframe = PropertySpecificKeyframe.create().init(
                        1,
                        "add",
                        presetTimingFunctions.linear,
                        property,
                        cssNeutralValue
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
                compositor.setAnimatedValue(
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
    value: function(frames, timeFraction, currentIteration) {


    var startKeyframeIndex;
    var length = frames.length;
    // We extrapolate differently depending on whether or not there are multiple
    // keyframes at offsets of 0 and 1.
    if (timeFraction < 0.0) {
      if (frames[1].offset === 0.0) {
        return new AddReplaceCompositableValue(frames[0].rawValue(),
            this._compositeForKeyframe(frames[0]));
      } else {
        startKeyframeIndex = 0;
      }
    } else if (timeFraction >= 1.0) {
      if (frames[length - 2].offset === 1.0) {
        return new AddReplaceCompositableValue(frames[length - 1].rawValue(),
            this._compositeForKeyframe(frames[length - 1]));
      } else {
        startKeyframeIndex = length - 2;
      }
    } else {
      for (var i = length - 1; i >= 0; i--) {
        if (frames[i].offset <= timeFraction) {
          startKeyframeIndex = i;
          break;
        }
      }
    }
    var startKeyframe = frames[startKeyframeIndex];
    var endKeyframe = frames[startKeyframeIndex + 1];
    if (startKeyframe.offset === timeFraction) {
      return new AddReplaceCompositableValue(startKeyframe.rawValue(),
          this._compositeForKeyframe(startKeyframe));
    }
    if (endKeyframe.offset === timeFraction) {
      return new AddReplaceCompositableValue(endKeyframe.rawValue(),
          this._compositeForKeyframe(endKeyframe));
    }
    var intervalDistance = (timeFraction - startKeyframe.offset) /
        (endKeyframe.offset - startKeyframe.offset);
    if (startKeyframe.easing) {
      intervalDistance = startKeyframe.easing.scaleTime(intervalDistance);
    }
    return new BlendedCompositableValue(
        new AddReplaceCompositableValue(startKeyframe.rawValue(),
            this._compositeForKeyframe(startKeyframe)),
        new AddReplaceCompositableValue(endKeyframe.rawValue(),
            this._compositeForKeyframe(endKeyframe)),
        intervalDistance);
  }
  },

  _compositeForKeyframe: {
      value: function(keyframe) {
        return ((typeof keyframe.composite !== "undefined") && (keyframe.composite !== null)) ?
            keyframe.composite : this.composite;
        }
      },
});

var Compositor = function() {
  this.targets = [];
};

Compositor.prototype = {
  setAnimatedValue: function(target, property, animValue) {
    if (target !== null) {
      if (target._animProperties === undefined) {
        target._animProperties = new CompositedPropertyMap(target);
        this.targets.push(target);
      }
      target._animProperties.addValue(property, animValue);
    }
  },
  applyAnimatedValues: function() {
    for (var i = 0; i < this.targets.length; i++) {
      this.targets[i]._animProperties.clear();
    }
    for (var i = 0; i < this.targets.length; i++) {
      this.targets[i]._animProperties.captureBaseValues();
    }
    for (var i = 0; i < this.targets.length; i++) {
      this.targets[i]._animProperties.applyAnimatedValues();
    }
  }
};

window.compositor = new Compositor();

/** @constructor */
var CompositableValue = function() {
};

CompositableValue.prototype = {
  compositeOnto: undefined,
  // This is purely an optimization.
  dependsOnUnderlyingValue: function() {
    return true;
  }
};

var createObject = function(proto, obj) {
  var newObject = Object.create(proto);
  Object.getOwnPropertyNames(obj).forEach(function(name) {
    Object.defineProperty(
        newObject, name, Object.getOwnPropertyDescriptor(obj, name));
  });
  return newObject;
};

/** @constructor */
var AddReplaceCompositableValue = function(value, composite) {
  this.value = value;
  this.composite = composite;
};

AddReplaceCompositableValue.prototype = createObject(
    CompositableValue.prototype, {
      compositeOnto: function(property, underlyingValue) {
        switch (this.composite) {
          case 'replace':
            return this.value;
          case 'add':
            return add(property, underlyingValue, this.value);
          default:
        }
      },
      dependsOnUnderlyingValue: function() {
        return this.composite === 'add';
      }
    });



/** @constructor */
var BlendedCompositableValue = function(startValue, endValue, fraction) {
  this.startValue = startValue;
  this.endValue = endValue;
  this.fraction = fraction;
};

BlendedCompositableValue.prototype = createObject(
    CompositableValue.prototype, {
      compositeOnto: function(property, underlyingValue) {
        return Type.interpolate(property,
            this.startValue.compositeOnto(property, underlyingValue),
            this.endValue.compositeOnto(property, underlyingValue),
            this.fraction);
      },
      dependsOnUnderlyingValue: function() {
        // Travis crashes here randomly in Chrome beta and unstable,
        // this try catch is to help debug the problem.
        try {
          return this.startValue.dependsOnUnderlyingValue() ||
              this.endValue.dependsOnUnderlyingValue();
        }
        catch (error) {
          throw new Error(
              error + '\n JSON.stringify(this) = ' + JSON.stringify(this));
        }
      }
    });

/** @constructor */
var CompositedPropertyMap = function(target) {
  this.properties = {};
  this.baseValues = {};
  this.target = target;
};

CompositedPropertyMap.prototype = {
  addValue: function(property, animValue) {
    if (!(property in this.properties)) {
      this.properties[property] = [];
    }
    if (!(animValue instanceof CompositableValue)) {
      throw new TypeError('expected CompositableValue');
    }
    this.properties[property].push(animValue);
  },
  stackDependsOnUnderlyingValue: function(stack) {
    for (var i = 0; i < stack.length; i++) {
      if (!stack[i].dependsOnUnderlyingValue()) {
        return false;
      }
    }
    return true;
  },
  clear: function() {
    for (var property in this.properties) {
      if (this.stackDependsOnUnderlyingValue(this.properties[property])) {
        clearValue(this.target, property);
      }
    }
  },
  captureBaseValues: function() {
    for (var property in this.properties) {
      var stack = this.properties[property];
      if (stack.length > 0 && this.stackDependsOnUnderlyingValue(stack)) {
        var baseValue = fromCssValue(property, getValue(this.target, property));
        // TODO: Decide what to do with elements not in the DOM.
        this.baseValues[property] = baseValue;
      } else {
        this.baseValues[property] = undefined;
      }
    }
  },
  applyAnimatedValues: function() {
    for (var property in this.properties) {
      var valuesToComposite = this.properties[property];
      if (valuesToComposite.length === 0) {
        continue;
      }
      var baseValue = this.baseValues[property];
      var i = valuesToComposite.length - 1;
      while (i > 0 && valuesToComposite[i].dependsOnUnderlyingValue()) {
        i--;
      }
      for (; i < valuesToComposite.length; i++) {
        baseValue = valuesToComposite[i].compositeOnto(property, baseValue);
      }
      var isSvgMode = propertyIsSVGAttrib(property, this.target);
      setValue(this.target, property, toCssValue(property, baseValue,
          isSvgMode));
      this.properties[property] = [];
    }
  }
};

var propertyIsSVGAttrib = function(property, target) {
  return target.namespaceURI === 'http://www.w3.org/2000/svg' &&
      property in svgProperties;
};

var ensureTargetInitialised = function(property, target) {
  if (propertyIsSVGAttrib(property, target)) {
    ensureTargetSVGInitialised(property, target);
  } else {
    ensureTargetCSSInitialised(target);
  }
};

var patchInlineStyleForAnimation = function(style) {
  var surrogateElement = document.createElement('div');
  copyInlineStyle(style, surrogateElement.style);
  var isAnimatedProperty = {};
  for (var method in cssStyleDeclarationMethodModifiesStyle) {
    if (!(method in style)) {
      continue;
    }
    Object.defineProperty(style, method, configureDescriptor({
      value: (function(method, originalMethod, modifiesStyle) {
        return function() {
          var result = surrogateElement.style[method].apply(
              surrogateElement.style, arguments);
          if (modifiesStyle) {
            if (!isAnimatedProperty[arguments[0]]) {
              originalMethod.apply(style, arguments);
            }
            animatedInlineStyleChanged();
          }
          return result;
        }
      })(method, style[method], cssStyleDeclarationMethodModifiesStyle[method])
    }));
  }

  style._clearAnimatedProperty = function(property) {
    this[property] = surrogateElement.style[property];
    isAnimatedProperty[property] = false;
  };

  style._setAnimatedProperty = function(property, value) {
    this[property] = value;
    isAnimatedProperty[property] = true;
  };
};

var cssStyleDeclarationAttribute = {
  cssText: true,
  length: true,
  parentRule: true,
  'var': true
};

var cssStyleDeclarationMethodModifiesStyle = {
  getPropertyValue: false,
  getPropertyCSSValue: false,
  removeProperty: true,
  getPropertyPriority: false,
  setProperty: true,
  item: false
};

var configureDescriptor = function(descriptor) {
  descriptor.configurable = true;
  descriptor.enumerable = true;
  return descriptor;
};
var copyInlineStyle = function(sourceStyle, destinationStyle) {
  for (var i = 0; i < sourceStyle.length; i++) {
    var property = sourceStyle[i];
    destinationStyle[property] = sourceStyle[property];
  }
};

var ensureTargetSVGInitialised = function(property, target) {
  if (!isDefinedAndNotNull(target._actuals)) {
    target._actuals = {};
    target._bases = {};
    target.actuals = {};
    target._getAttribute = target.getAttribute;
    target._setAttribute = target.setAttribute;
    target.getAttribute = function(name) {
      if (isDefinedAndNotNull(target._bases[name])) {
        return target._bases[name];
      }
      return target._getAttribute(name);
    };
    target.setAttribute = function(name, value) {
      if (isDefinedAndNotNull(target._actuals[name])) {
        target._bases[name] = value;
      } else {
        target._setAttribute(name, value);
      }
    };
  }
  if (!isDefinedAndNotNull(target._actuals[property])) {
    var baseVal = target.getAttribute(property);
    target._actuals[property] = 0;
    target._bases[property] = baseVal;

    Object.defineProperty(target.actuals, property, configureDescriptor({
      set: function(value) {
        if (value === null) {
          target._actuals[property] = target._bases[property];
          target._setAttribute(property, target._bases[property]);
        } else {
          target._actuals[property] = value;
          target._setAttribute(property, value);
        }
      },
      get: function() {
        return target._actuals[property];
      }
    }));
  }
};

var ensureTargetCSSInitialised = function(target) {
  if (target.style._webAnimationsStyleInitialised) {
    return;
  }
  try {
    var animatedStyle = new AnimatedCSSStyleDeclaration(target);
    Object.defineProperty(target, 'style', configureDescriptor({
      get: function() { return animatedStyle; }
    }));
  } catch (error) {
    patchInlineStyleForAnimation(target.style);
  }
  target.style._webAnimationsStyleInitialised = true;
};

var setValue = function(target, property, value) {
  ensureTargetInitialised(property, target);
  property = Properties.prefixProperty(property);
  if (propertyIsSVGAttrib(property, target)) {
    target.actuals[property] = value;
  } else {
    target.style._setAnimatedProperty(property, value);
  }
};

var clearValue = function(target, property) {
  ensureTargetInitialised(property, target);
  property = Properties.prefixProperty(property);
  if (propertyIsSVGAttrib(property, target)) {
    target.actuals[property] = null;
  } else {
    target.style._clearAnimatedProperty(property);
  }
};

var fromCssValue = function(property, value) {
  if (value === cssNeutralValue) {
    return rawNeutralValue;
  }
  if (value === 'inherit') {
    return value;
  }
  if (property in propertyValueAliases &&
      value in propertyValueAliases[property]) {
    value = propertyValueAliases[property][value];
  }
  var result = Type.getType(property).fromCssValue(value);
  return result;
};

var getValue = function(target, property) {
  ensureTargetInitialised(property, target);
  property = Properties.prefixProperty(property);
  if (propertyIsSVGAttrib(property, target)) {
    return target.actuals[property];
  } else {
    return getComputedStyle(target)[property];
  }
};

var cssNeutralValue = {};
var rawNeutralValue = {};

var borderWidthAliases = {
  initial: '3px',
  thin: '1px',
  medium: '3px',
  thick: '5px'
};

var propertyValueAliases = {
  backgroundColor: { initial: 'transparent' },
  backgroundPosition: { initial: '0% 0%' },
  borderBottomColor: { initial: 'currentColor' },
  borderBottomLeftRadius: { initial: '0px' },
  borderBottomRightRadius: { initial: '0px' },
  borderBottomWidth: borderWidthAliases,
  borderLeftColor: { initial: 'currentColor' },
  borderLeftWidth: borderWidthAliases,
  borderRightColor: { initial: 'currentColor' },
  borderRightWidth: borderWidthAliases,
  // Spec says this should be 0 but in practise it is 2px.
  borderSpacing: { initial: '2px' },
  borderTopColor: { initial: 'currentColor' },
  borderTopLeftRadius: { initial: '0px' },
  borderTopRightRadius: { initial: '0px' },
  borderTopWidth: borderWidthAliases,
  bottom: { initial: 'auto' },
  clip: { initial: 'rect(0px, 0px, 0px, 0px)' },
  color: { initial: 'black' }, // Depends on user agent.
  fontSize: {
    initial: '100%',
    'xx-small': '60%',
    'x-small': '75%',
    'small': '89%',
    'medium': '100%',
    'large': '120%',
    'x-large': '150%',
    'xx-large': '200%'
  },
  fontWeight: {
    initial: '400',
    normal: '400',
    bold: '700'
  },
  height: { initial: 'auto' },
  left: { initial: 'auto' },
  letterSpacing: { initial: 'normal' },
  lineHeight: {
    initial: '120%',
    normal: '120%'
  },
  marginBottom: { initial: '0px' },
  marginLeft: { initial: '0px' },
  marginRight: { initial: '0px' },
  marginTop: { initial: '0px' },
  maxHeight: { initial: 'none' },
  maxWidth: { initial: 'none' },
  minHeight: { initial: '0px' },
  minWidth: { initial: '0px' },
  opacity: { initial: '1.0' },
  outlineColor: { initial: 'invert' },
  outlineOffset: { initial: '0px' },
  outlineWidth: borderWidthAliases,
  paddingBottom: { initial: '0px' },
  paddingLeft: { initial: '0px' },
  paddingRight: { initial: '0px' },
  paddingTop: { initial: '0px' },
  right: { initial: 'auto' },
  textIndent: { initial: '0px' },
  textShadow: {
    initial: '0px 0px 0px transparent',
    none: '0px 0px 0px transparent'
  },
  top: { initial: 'auto' },
  transform: {
    initial: '',
    none: ''
  },
  verticalAlign: { initial: '0px' },
  visibility: { initial: 'visible' },
  width: { initial: 'auto' },
  wordSpacing: { initial: 'normal' },
  zIndex: { initial: 'auto' }
};

var toCssValue = function(property, value, svgMode) {
  if (value === 'inherit') {
    return value;
  }
  return Type.getType(property).toCssValue(value, svgMode);
};
