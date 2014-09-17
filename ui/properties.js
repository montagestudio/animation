var Montage = require("montage").Montage;

var Properties = exports.Properties = Montage.specialize(null, {

    createDummyElement: {
        value: function () {
            return document.createElement("div");
        }
    },

    detectFeatures: {
        value: function () {
            var el = this.createDummyElement(),
                calcFunction,
                transformProperty,
                perspectiveProperty;

            el.style.cssText = "width: calc(0px); width: -webkit-calc(0px);";
            calcFunction = el.style.width.split("(")[0];
            function detectProperty(candidateProperties) {
                return [].filter.call(candidateProperties, function (property) {
                    return (el.style[property] !== undefined);
                })[0];
            }
            transformProperty = detectProperty([
                "transform",
                "webkitTransform",
                "msTransform"
            ]);
            perspectiveProperty = detectProperty([
                "perspective",
                "webkitPerspective",
                "msPerspective"
            ]);
            return {
                calcFunction: calcFunction,
                transformProperty: transformProperty,
                transformOriginProperty: transformProperty + "Origin",
                perspectiveProperty: perspectiveProperty,
                perspectiveOriginProperty: perspectiveProperty + "Origin"
            };
        }
    },

    prefixProperty: {
        value: function (property) {
            switch (property) {
            case "transform":
                return this.features.transformProperty;
            case "transformOrigin":
                return this.features.transformOriginProperty;
            case "perspective":
                return this.features.perspectiveProperty;
            case "perspectiveOrigin":
                return this.features.perspectiveOriginProperty;
            default:
                return property;
            }
        }
    },

    shorthandToLonghand: {
        value: {
            background: [
                "backgroundImage",
                "backgroundPosition",
                "backgroundSize",
                "backgroundRepeat",
                "backgroundAttachment",
                "backgroundOrigin",
                "backgroundClip",
                "backgroundColor"
            ],
            border: [
                "borderTopColor",
                "borderTopStyle",
                "borderTopWidth",
                "borderRightColor",
                "borderRightStyle",
                "borderRightWidth",
                "borderBottomColor",
                "borderBottomStyle",
                "borderBottomWidth",
                "borderLeftColor",
                "borderLeftStyle",
                "borderLeftWidth"
            ],
            borderBottom: [
                "borderBottomWidth",
                "borderBottomStyle",
                "borderBottomColor"
            ],
            borderColor: [
                "borderTopColor",
                "borderRightColor",
                "borderBottomColor",
                "borderLeftColor"
            ],
            borderLeft: [
                "borderLeftWidth",
                "borderLeftStyle",
                "borderLeftColor"
            ],
            borderRadius: [
                "borderTopLeftRadius",
                "borderTopRightRadius",
                "borderBottomRightRadius",
                "borderBottomLeftRadius"
            ],
            borderRight: [
                "borderRightWidth",
                "borderRightStyle",
                "borderRightColor"
            ],
            borderTop: [
                "borderTopWidth",
                "borderTopStyle",
                "borderTopColor"
            ],
            borderWidth: [
                "borderTopWidth",
                "borderRightWidth",
                "borderBottomWidth",
                "borderLeftWidth"
            ],
            font: [
                "fontFamily",
                "fontSize",
                "fontStyle",
                "fontVariant",
                "fontWeight",
                "lineHeight"
            ],
            margin: [
                "marginTop",
                "marginRight",
                "marginBottom",
                "marginLeft"
            ],
            outline: [
                "outlineColor",
                "outlineStyle",
                "outlineWidth"
            ],
            padding: [
                "paddingTop",
                "paddingRight",
                "paddingBottom",
                "paddingLeft"
            ]
        }
    },

    expandShorthand: {
        value: function (property, value, result) {
            var longProperties,
                longProperty,
                longhandValue,
                i;

            this.shorthandExpanderElem.style[property] = value;
            longProperties = this.shorthandToLonghand[property];
            for (i in longProperties) {
                longProperty = longProperties[i];
                longhandValue = this.shorthandExpanderElem.style[longProperty];
                result[longProperty] = longhandValue;
            }
        }
    }

});

Properties.features = Properties.detectFeatures();
Properties.shorthandExpanderElem = Properties.createDummyElement();

