var Montage = require("montage").Montage,
    Type = require("ui/type").Type,
    NonNumericType = require("ui/types/non-numeric-type").NonNumericType,
    Properties = require("ui/properties").Properties;

var AddReplaceCompositableValue = exports.AddReplaceCompositableValue = Montage.specialize({

    init: {
        value: function (value, composite) {
            this.value = value;
            this.composite = composite;
            return this;
        }
    },

    _add: {
        value: function (property, base, delta) {
            if (delta === Type.rawNeutralValue) {
                return base;
            }
            if ((base === "inherit") || (delta === "inherit")) {
                return NonNumericType.add(base, delta);
            }
            return Type.getType(property).add(base, delta);
        }
    },

    compositeOnto: {
        value: function (property, underlyingValue) {
            if (this.composite === "add") {
                return this._add(property, underlyingValue, this.value);
            }
            return this.value;
        }
    },

    dependsOnUnderlyingValue: {
        value: function() {
            return this.composite === "add";
        }
    }

});

var BlendedCompositableValue = exports.BlendedCompositableValue = Montage.specialize({

    init: {
        value: function (startValue, endValue, fraction) {
            this.startValue = startValue;
            this.endValue = endValue;
            this.fraction = fraction;
            return this;
        }
    },

    compositeOnto: {
        value: function (property, underlyingValue) {
            return Type.interpolate(
                property,
                this.startValue.compositeOnto(property, underlyingValue),
                this.endValue.compositeOnto(property, underlyingValue),
                this.fraction
            );
        }
    },

    dependsOnUnderlyingValue: {
        value: function () {
            return (
                this.startValue.dependsOnUnderlyingValue() ||
                this.endValue.dependsOnUnderlyingValue()
            );
        }
    }

});

var CompositedPropertyMap = exports.CompositedPropertyMap = Montage.specialize({

    init: {
        value: function (target) {
            this.properties = {};
            this.baseValues = {};
            this.target = target;
            return this;
        }
    },

    addValue: {
        value: function (property, animValue) {
            if (!(property in this.properties)) {
                this.properties[property] = [];
            }
            this.properties[property].push(animValue);
        }
    },

    stackDependsOnUnderlyingValue: {
        value: function (stack) {
            var length = stack.length,
                i;

            for (i = 0; i < length; i++) {
                if (!stack[i].dependsOnUnderlyingValue()) {
                    return false;
                }
            }
            return true;
        }
    },

    clear: {
        value: function () {
            for (var property in this.properties) {
                if (this.stackDependsOnUnderlyingValue(this.properties[property])) {
                    Type.clearValue(this.target, property);
                }
            }
        }
    },

    captureBaseValues: {
        value: function () {
            var property,
                stack,
                baseValue;

            for (property in this.properties) {
                stack = this.properties[property];
                if ((stack.length > 0) && this.stackDependsOnUnderlyingValue(stack)) {
                    baseValue = fromCssValue(property, getValue(this.target, property));
                    this.baseValues[property] = baseValue;
                } else {
                    this.baseValues[property] = undefined;
                }
            }
        }
    },

    applyAnimatedValues: {
        value: function () {
            var property,
                valuesToComposite,
                baseValue,
                i;

            for (property in this.properties) {
                valuesToComposite = this.properties[property];
                if (valuesToComposite.length === 0) {
                    continue;
                }
                baseValue = this.baseValues[property];
                i = valuesToComposite.length - 1;
                while ((i > 0) && valuesToComposite[i].dependsOnUnderlyingValue()) {
                    i--;
                }
                for (; i < valuesToComposite.length; i++) {
                    baseValue = valuesToComposite[i].compositeOnto(property, baseValue);
                }
                Type.setValue(this.target, property, Type.toCssValue(property, baseValue));
                this.properties[property] = [];
            }
        }
    }

});

var Compositor = exports.Compositor = Montage.specialize(null, {

    targets: {
        value: []
    },

    setAnimatedValue: {
        value: function (target, property, animValue) {
            if (!target._animProperties) {
                target._animProperties = CompositedPropertyMap.create().init(target);
                this.targets.push(target);
            }
            target._animProperties.addValue(property, animValue);
        }
    },

    applyAnimatedValues: {
        value: function () {
            var length = this.targets.length,
                i;

            for (i = 0; i < length; i++) {
                this.targets[i]._animProperties.clear();
            }
            for (i = 0; i < length; i++) {
                this.targets[i]._animProperties.captureBaseValues();
            }
            for (i = 0; i < length; i++) {
                this.targets[i]._animProperties.applyAnimatedValues();
            }
        }
    }

});