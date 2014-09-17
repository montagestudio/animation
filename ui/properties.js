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

    propertyValueAliases: {
        value: {
            backgroundColor: {
                initial: "transparent"
            },
            backgroundPosition: {
                initial: "0% 0%"
            },
            borderBottomColor: {
                initial: "currentColor"
            },
            borderBottomLeftRadius: {
                initial: "0px"
            },
            borderBottomRightRadius: {
                initial: "0px"
            },
            borderBottomWidth: {
                initial: "3px",
                thin: "1px",
                medium: "3px",
                thick: "5px"
            },
            borderLeftColor: {
                initial: "currentColor"
            },
            borderLeftWidth: {
                initial: "3px",
                thin: "1px",
                medium: "3px",
                thick: "5px"
            },
            borderRightColor: {
                initial: "currentColor"
            },
            borderRightWidth: {
                initial: "3px",
                thin: "1px",
                medium: "3px",
                thick: "5px"
            },
            borderSpacing: {
                initial: "2px"
            },
            borderTopColor: {
                initial: "currentColor"
            },
            borderTopLeftRadius: {
                initial: "0px"
            },
            borderTopRightRadius: {
                initial: "0px"
            },
            borderTopWidth: {
                initial: "3px",
                thin: "1px",
                medium: "3px",
                thick: "5px"
            },
            bottom: {
                initial: "auto"
            },
            clip: {
                initial: "rect(0px, 0px, 0px, 0px)"
            },
            color: {
                initial: "black"
            },
            fontSize: {
                initial: "100%",
                "xx-small": "60%",
                "x-small": "75%",
                "small": "89%",
                "medium": "100%",
                "large": "120%",
                "x-large": "150%",
                "xx-large": "200%"
            },
            fontWeight: {
                initial: "400",
                normal: "400",
                bold: "700"
            },
            height: {
                initial: "auto"
            },
            left: {
                initial: "auto"
            },
            letterSpacing: {
                initial: "normal"
            },
            lineHeight: {
                initial: "120%",
                normal: "120%"
            },
            marginBottom: {
                initial: "0px"
            },
            marginLeft: {
                initial: "0px"
            },
            marginRight: {
                initial: "0px"
            },
            marginTop: {
                initial: "0px"
            },
            maxHeight: {
                initial: "none"
            },
            maxWidth: {
                initial: "none"
            },
            minHeight: {
                initial: "0px"
            },
            minWidth: {
                initial: "0px"
            },
            opacity: {
                initial: "1"
            },
            outlineColor: {
                initial: "invert"
            },
            outlineOffset: {
                initial: "0px"
            },
            outlineWidth: {
                initial: "3px",
                thin: "1px",
                medium: "3px",
                thick: "5px"
            },
            paddingBottom: {
                initial: "0px"
            },
            paddingLeft: {
                initial: "0px"
            },
            paddingRight: {
                initial: "0px"
            },
            paddingTop: {
                initial: "0px"
            },
            right: {
                initial: "auto"
            },
            textIndent: {
                initial: "0px"
            },
            textShadow: {
                initial: "0px 0px 0px transparent",
                none: "0px 0px 0px transparent"
            },
            top: {
                initial: "auto"
            },
            transform: {
                initial: "",
                none: ""
            },
            verticalAlign: {
                initial: "0px"
            },
            visibility: {
                initial: "visible"
            },
            width: {
                initial: "auto"
            },
            wordSpacing: {
                initial: "normal"
            },
            zIndex: {
                initial: "auto"
            }
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
