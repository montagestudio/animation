var Montage = require("montage").Montage,
    ColorType = require("ui/types/color-type").ColorType,
    PercentLengthType = require("ui/types/percent-length-type").PercentLengthType,
    PercentLengthAutoType = require("ui/types/percent-length-auto-type").PercentLengthAutoType,
    PositionType = require("ui/types/position-type").PositionType,
    PositionListType = require("ui/types/position-list-type").PositionListType,
    NonNumericType = require("ui/types/non-numeric-type").NonNumericType,
    FontSizeType = require("ui/types/font-size-type").FontSizeType,
    NumberType = require("ui/types/number-type").NumberType,
    ZIndexType = require("ui/types/z-index-type").ZIndexType,
    FontWeightType = require("ui/types/font-weight-type").FontWeightType,
    OriginType = require("ui/types/origin-type").OriginType,
    ShadowType = require("ui/types/shadow-type").ShadowType,
    VisibilityType = require("ui/types/visibility-type").VisibilityType,
    RectangleType = require("ui/types/rectangle-type").RectangleType,
    LetterSpacingType = require("ui/types/letter-spacing-type").LetterSpacingType,
    MaxLengthType = require("ui/types/max-length-type").MaxLengthType,
    MinLengthType = require("ui/types/min-length-type").MinLengthType,
    OutlineColorType = require("ui/types/outline-color-type").OutlineColorType,
    WordSpacingType = require("ui/types/word-spacing-type").WordSpacingType,
    PerspectiveType = require("ui/types/perspective-type").PerspectiveType,
    TextIndentType = require("ui/types/text-indent-type").TextIndentType,
    VerticalAlignType = require("ui/types/vertical-align-type").VerticalAlignType,
    WidthType = require("ui/types/width-type").WidthType,
    BlurType = require("ui/types/blur-type").BlurType,
    TransformType = require("ui/types/transform-type").TransformType,
    Properties = require("ui/properties").Properties;

var Type = exports.Type = Montage.specialize(null, {

    setValue: {
        value: function (target, property, value) {
            property = Properties.prefixProperty(property);
            target.style[property] = value;
        }
    },

    clearValue: {
        value: function (target, property) {
            property = Properties.prefixProperty(property);
            target.style[property] = "";
        }
    },

    toCssValue: {
        value: function (property, value) {
            if (value === "inherit") {
                return value;
            }
            return Type.getType(property).toCssValue(value);
        }
    },

    getType: {
        value: function (property) {
            return Type.propertyTypes[property] || NonNumericType;
        }
    },

    fromCssValue: {
        value: function (property, value) {
            if (value === Type.cssNeutralValue) {
                return Type.rawNeutralValue;
            }
            if (value === "inherit") {
                return value;
            }
            if (Properties.propertyValueAliases[property] && (Properties.propertyValueAliases[property][value] !== undefined)) {
                value = Properties.propertyValueAliases[property][value];
            }
            return Type.getType(property).fromCssValue(value);
        }
    },

    cssNeutralValue: {
        value: {}
    },

    rawNeutralValue: {
        value: {}
    },

    interpolate: {
        value: function (property, from, to, f) {
            if ((from === "inherit") || (to === "inherit")) {
                return this.NonNumericType.interpolate(from, to, f);
            }
            if (f === 0) {
                return from;
            }
            if (f === 1) {
                return to;
            }
            return Type.getType(property).interpolate(from, to, f);
        }
    },

    propertyTypes: {
        value: {
            backgroundColor: ColorType,
            backgroundPosition: PositionListType,
            borderBottomColor: ColorType,
            borderBottomLeftRadius: PercentLengthType,
            borderBottomRightRadius: PercentLengthType,
            borderBottomWidth: PercentLengthType,
            borderLeftColor: ColorType,
            borderLeftWidth: PercentLengthType,
            borderRightColor: ColorType,
            borderRightWidth: PercentLengthType,
            borderSpacing: PercentLengthType,
            borderTopColor: ColorType,
            borderTopLeftRadius: PercentLengthType,
            borderTopRightRadius: PercentLengthType,
            borderTopWidth: PercentLengthType,
            bottom: PercentLengthAutoType,
            boxShadow: ShadowType,
            clip: RectangleType,
            color: ColorType,
            cx: PercentLengthType,
            cy: PercentLengthType,
            dx: PercentLengthType,
            dy: PercentLengthType,
            fill: ColorType,
            floodColor: ColorType,
            fontSize: FontSizeType,
            fontWeight: FontWeightType,
            height: PercentLengthAutoType,
            left: PercentLengthAutoType,
            letterSpacing: LetterSpacingType,
            lightingColor: ColorType,
            lineHeight: PercentLengthType,
            marginBottom: PercentLengthAutoType,
            marginLeft: PercentLengthAutoType,
            marginRight: PercentLengthAutoType,
            marginTop: PercentLengthAutoType,
            maxHeight: MaxLengthType,
            maxWidth: MaxLengthType,
            minHeight: MinLengthType,
            minWidth: MinLengthType,
            opacity: NumberType,
            outlineColor: OutlineColorType,
            outlineOffset: PercentLengthType,
            outlineWidth: PercentLengthType,
            paddingBottom: PercentLengthType,
            paddingLeft: PercentLengthType,
            paddingRight: PercentLengthType,
            paddingTop: PercentLengthType,
            perspective: PerspectiveType,
            perspectiveOrigin: OriginType,
            r: PercentLengthType,
            right: PercentLengthAutoType,
            stopColor: ColorType,
            stroke: ColorType,
            textIndent: TextIndentType,
            textShadow: ShadowType,
            top: PercentLengthAutoType,
            transform: TransformType,
            transformOrigin: OriginType,
            verticalAlign: VerticalAlignType,
            visibility: VisibilityType,
            width: WidthType,
            wordSpacing: WordSpacingType,
            x: PercentLengthType,
            y: PercentLengthType,
            zIndex: ZIndexType,
            "-webkit-filter": BlurType
        }
    }

});
