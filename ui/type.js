var Montage = require("montage").Montage,
    AnimationMath = require("ui/animation-math").AnimationMath,
    Interpolation = require("ui/interpolation").Interpolation,
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
    WidthType = require("ui/types/width-type").WidthType;


    var transformType = {
        add: function (base, delta) { return base.concat(delta); },
        interpolate: function (from, to, f) {
            var out = [],
                i;

            for (i = 0; i < Math.min(from.length, to.length); i++) {
                if (from[i].t !== to[i].t || isMatrix(from[i])) {
                    break;
                }
                out.push(interpTransformValue(from[i], to[i], f));
            }

            if (i < Math.min(from.length, to.length) ||
                    from.some(isMatrix) || to.some(isMatrix)) {
                if (from.decompositionPair !== to) {
                    from.decompositionPair = to;
                    from.decomposition = decomposeMatrix(convertToMatrix(from.slice(i)));
                }
                if (to.decompositionPair !== from) {
                    to.decompositionPair = from;
                    to.decomposition = decomposeMatrix(convertToMatrix(to.slice(i)));
                }
                out.push(interpolateDecomposedTransformsWithMatrices(
                        from.decomposition, to.decomposition, f));
                return out;
            }

            for (; i < from.length; i++) {
                out.push(interpTransformValue(from[i], {t: null, d: null}, f));
            }
            for (; i < to.length; i++) {
                out.push(interpTransformValue({t: null, d: null}, to[i], f));
            }
            return out;
        },
        toCssValue: function (value, svgMode) {
            var out = "",
                unit,
                values,
                i;

            for (i = 0; i < value.length; i++) {
                switch (value[i].t) {
                    case "rotate":
                    case "rotateX":
                    case "rotateY":
                    case "rotateZ":
                    case "skewX":
                    case "skewY":
                        unit = svgMode ? "" : "deg";
                        out += value[i].t + "(" + value[i].d + unit + ") ";
                        break;
                    case "skew":
                        unit = svgMode ? "" : "deg";
                        out += value[i].t + "(" + value[i].d[0] + unit;
                        if (value[i].d[1] === 0) {
                            out += ") ";
                        } else {
                            out += ", " + value[i].d[1] + unit + ") ";
                        }
                        break;
                    case "rotate3d":
                        unit = svgMode ? "" : "deg";
                        out += value[i].t + "(" + value[i].d[0] + ", " + value[i].d[1] +
                                ", " + value[i].d[2] + ", " + value[i].d[3] + unit + ") ";
                        break;
                    case "translateX":
                    case "translateY":
                    case "translateZ":
                    case "perspective":
                        out += value[i].t + "(" + PercentLengthType.toCssValue(value[i].d[0]) +
                                ") ";
                        break;
                    case "translate":
                        if (svgMode) {
                            if (value[i].d[1] === undefined) {
                                out += value[i].t + "(" + value[i].d[0].px + ") ";
                            } else {
                                out += (
                                        value[i].t + "(" + value[i].d[0].px + ", " +
                                        value[i].d[1].px + ") ");
                            }
                            break;
                        }
                        if (value[i].d[1] === undefined) {
                            out += value[i].t + "(" + PercentLengthType.toCssValue(value[i].d[0]) +
                                    ") ";
                        } else {
                            out += value[i].t + "(" + PercentLengthType.toCssValue(value[i].d[0]) +
                                    ", " + PercentLengthType.toCssValue(value[i].d[1]) + ") ";
                        }
                        break;
                    case "translate3d":
                        values = value[i].d.map(PercentLengthType.toCssValue);
                        out += value[i].t + "(" + values[0] + ", " + values[1] +
                                ", " + values[2] + ") ";
                        break;
                    case "scale":
                        if (value[i].d[0] === value[i].d[1]) {
                            out += value[i].t + "(" + value[i].d[0] + ") ";
                        } else {
                            out += value[i].t + "(" + value[i].d[0] + ", " + value[i].d[1] +
                                    ") ";
                        }
                        break;
                    case "scaleX":
                    case "scaleY":
                    case "scaleZ":
                        out += value[i].t + "(" + value[i].d[0] + ") ";
                        break;
                    case "scale3d":
                        out += value[i].t + "(" + value[i].d[0] + ", " +
                                value[i].d[1] + ", " + value[i].d[2] + ") ";
                        break;
                    case "matrix":
                    case "matrix3d":
                        out += value[i].t + "(" + value[i].d.map(n).join(", ") + ") ";
                        break;
                }
            }
            return out.substring(0, out.length - 1);
        },
        fromCssValue: function (value) {
            var result,
                reSpec,
                r, i;

            if (value === undefined) {
                return undefined;
            }
            result = [];
            while (value.length > 0) {
                for (i = 0; i < transformREs.length; i++) {
                    reSpec = transformREs[i];
                    r = reSpec[0].exec(value);
                    if (r) {
                        result.push({t: reSpec[2], d: reSpec[1](r)});
                        value = value.substring(r[0].length);
                        break;
                    }
                }
                if ((r === undefined) || (r === null)) {
                    return result;
                }
            }
            return result;
        }
    };

    var BlurType = {
        add: function (base, delta) { return base + delta; },
        interpolate: function (from, to, f) {
            return Interpolation.interp(from, to, f);
        },
        toCssValue: function (value, svgMode) {
            return "blur(" + value + "px)";
        },
        fromCssValue: function (value) {
            return Number(value.substr(5,value.length - 8));
        }
    };

var Type = exports.Type = Montage.specialize(null, {

    getType: {
        value: function (property) {
            return Type.propertyTypes[property] || NonNumericType;
        }
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
            //d: pathType,
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
            transform: transformType,
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


    function extractValue(values, pos, hasUnits) {
        var value = Number(values[pos]),
            type,
            result;

        if (!hasUnits) {
            return value;
        }
        type = values[pos + 1];
        if (type === "") {
            type = "px";
        }
        result = {};
        result[type] = value;
        return result;
    }

    function extractValues(values, numValues, hasOptionalValue, hasUnits) {
        var result = [],
            i;

        for (i = 0; i < numValues; i++) {
            result.push(extractValue(values, 1 + 2 * i, hasUnits));
        }
        if (hasOptionalValue && values[1 + 2 * numValues]) {
            result.push(extractValue(values, 1 + 2 * numValues, hasUnits));
        }
        return result;
    }

    var SPACES = "\\s*";
    var NUMBER = "[+-]?(?:\\d+|\\d*\\.\\d+)";
    var RAW_OPEN_BRACKET = "\\(";
    var RAW_CLOSE_BRACKET = "\\)";
    var RAW_COMMA = ",";
    var UNIT = "[a-zA-Z%]*";
    var START = "^";

    function capture(x) { return "(" + x + ")"; }
    function optional(x) { return "(?:" + x + ")?"; }

    var OPEN_BRACKET = [SPACES, RAW_OPEN_BRACKET, SPACES].join("");
    var CLOSE_BRACKET = [SPACES, RAW_CLOSE_BRACKET, SPACES].join("");
    var COMMA = [SPACES, RAW_COMMA, SPACES].join("");
    var UNIT_NUMBER = [capture(NUMBER), capture(UNIT)].join("");

    function transformRE(name, numParms, hasOptionalParm) {
        var tokenList = [START, SPACES, name, OPEN_BRACKET],
            i;

        for (i = 0; i < numParms - 1; i++) {
            tokenList.push(UNIT_NUMBER);
            tokenList.push(COMMA);
        }
        tokenList.push(UNIT_NUMBER);
        if (hasOptionalParm) {
            tokenList.push(optional([COMMA, UNIT_NUMBER].join("")));
        }
        tokenList.push(CLOSE_BRACKET);
        return new RegExp(tokenList.join(""));
    }

    function buildMatcher(name, numValues, hasOptionalValue, hasUnits, baseValue) {
        var baseName = name;

        if (baseValue) {
            if (name[name.length - 1] === "X" || name[name.length - 1] === "Y") {
                baseName = name.substring(0, name.length - 1);
            } else {
                if (name[name.length - 1] === "Z") {
                    baseName = name.substring(0, name.length - 1) + "3d";
                }
            }
        }

        function f(x) {
            var r = extractValues(x, numValues, hasOptionalValue, hasUnits);

            if (baseValue !== undefined) {
                if (name[name.length - 1] === "X") {
                    r.push(baseValue);
                } else {
                    if (name[name.length - 1] === "Y") {
                        r = [baseValue].concat(r);
                    } else {
                        if (name[name.length - 1] === "Z") {
                            r = [baseValue, baseValue].concat(r);
                        } else {
                            if (hasOptionalValue) {
                                while (r.length < 2) {
                                    if (baseValue === "copy") {
                                        r.push(r[0]);
                                    } else {
                                        r.push(baseValue);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            return r;
        };
        return [transformRE(name, numValues, hasOptionalValue), f, baseName];
    }

    function buildRotationMatcher(name, numValues, hasOptionalValue, baseValue) {
        var m = buildMatcher(name, numValues, hasOptionalValue, true, baseValue);

        function f(x) {
            var r = m[1](x);

            return r.map(function (v) {
                var result = 0,
                    type;

                for (type in v) {
                    result += convertToDeg(v[type], type);
                }
                return result;
            });
        };
        return [m[0], f, m[2]];
    }

    function build3DRotationMatcher() {
        var m = buildMatcher("rotate3d", 4, false, true);

        function f(x) {
            var r = m[1](x),
                out = [],
                angle,
                unit,
                i;

            for (i = 0; i < 3; i++) {
                out.push(r[i].px);
            }
            angle = 0;
            for (unit in r[3]) {
                angle += convertToDeg(r[3][unit], unit);
            }
            out.push(angle);
            return out;
        };
        return [m[0], f, m[2]];
    }

    var transformREs = [
        buildRotationMatcher("rotate", 1, false),
        buildRotationMatcher("rotateX", 1, false),
        buildRotationMatcher("rotateY", 1, false),
        buildRotationMatcher("rotateZ", 1, false),
        build3DRotationMatcher(),
        buildRotationMatcher("skew", 1, true, 0),
        buildRotationMatcher("skewX", 1, false),
        buildRotationMatcher("skewY", 1, false),
        buildMatcher("translateX", 1, false, true, {px: 0}),
        buildMatcher("translateY", 1, false, true, {px: 0}),
        buildMatcher("translateZ", 1, false, true, {px: 0}),
        buildMatcher("translate", 1, true, true, {px: 0}),
        buildMatcher("translate3d", 3, false, true),
        buildMatcher("scale", 1, true, false, "copy"),
        buildMatcher("scaleX", 1, false, false, 1),
        buildMatcher("scaleY", 1, false, false, 1),
        buildMatcher("scaleZ", 1, false, false, 1),
        buildMatcher("scale3d", 3, false, false),
        buildMatcher("perspective", 1, false, true),
        buildMatcher("matrix", 6, false, false),
        buildMatcher("matrix3d", 16, false, false)
    ];

    function convertItemToMatrix(item) {
        switch (item.t) {
            case "rotateX":
                var angle = item.d * Math.PI / 180;

                return [
                    1, 0, 0, 0,
                    0, Math.cos(angle), Math.sin(angle), 0,
                    0, -Math.sin(angle), Math.cos(angle), 0,
                    0, 0, 0, 1
                ];
            case "rotateY":
                var angle = item.d * Math.PI / 180;

                return [
                    Math.cos(angle), 0, -Math.sin(angle), 0,
                    0, 1, 0, 0,
                    Math.sin(angle), 0, Math.cos(angle), 0,
                    0, 0, 0, 1
                ];
            case "rotate":
            case "rotateZ":
                var angle = item.d * Math.PI / 180;

                return [
                    Math.cos(angle), Math.sin(angle), 0, 0,
                    -Math.sin(angle), Math.cos(angle), 0, 0,
                    0, 0, 1, 0,
                    0, 0, 0, 1
                ];
            case "rotate3d":
                var x = item.d[0],
                    y = item.d[1],
                    z = item.d[2],
                    sqrLength = x * x + y * y + z * z,
                    length,
                    s, sc, sq;

                if (sqrLength === 0) {
                    x = 1;
                    y = 0;
                    z = 0;
                } else {
                    if (sqrLength !== 1) {
                        length = Math.sqrt(sqrLength);
                        x /= length;
                        y /= length;
                        z /= length;
                    }
                }
                s = Math.sin(item.d[3] * Math.PI / 360);
                sc = s * Math.cos(item.d[3] * Math.PI / 360);
                sq = s * s;
                return [
                    1 - 2 * (y * y + z * z) * sq,
                    2 * (x * y * sq + z * sc),
                    2 * (x * z * sq - y * sc),
                    0,

                    2 * (x * y * sq - z * sc),
                    1 - 2 * (x * x + z * z) * sq,
                    2 * (y * z * sq + x * sc),
                    0,

                    2 * (x * z * sq + y * sc),
                    2 * (y * z * sq - x * sc),
                    1 - 2 * (x * x + y * y) * sq,
                    0,

                    0, 0, 0, 1
                ];
            case "scale":
                return [item.d[0], 0, 0, 0,
                                0, item.d[1], 0, 0,
                                0, 0, 1, 0,
                                0, 0, 0, 1];
            case "scale3d":
                return [item.d[0], 0, 0, 0,
                                0, item.d[1], 0, 0,
                                0, 0, item.d[2], 0,
                                0, 0, 0, 1];
            case "skew":
                return [1, Math.tan(item.d[1] * Math.PI / 180), 0, 0,
                                Math.tan(item.d[0] * Math.PI / 180), 1, 0, 0,
                                0, 0, 1, 0,
                                0, 0, 0, 1];
            case "skewX":
                return [1, 0, 0, 0,
                                Math.tan(item.d * Math.PI / 180), 1, 0, 0,
                                0, 0, 1, 0,
                                0, 0, 0, 1];
            case "skewY":
                return [1, Math.tan(item.d * Math.PI / 180), 0, 0,
                                0, 1, 0, 0,
                                0, 0, 1, 0,
                                0, 0, 0, 1];
            // TODO: Work out what to do with non-px values.
            case "translate":
                return [1, 0, 0, 0,
                                0, 1, 0, 0,
                                0, 0, 1, 0,
                                item.d[0].px, item.d[1].px, 0, 1];
            case "translate3d":
                return [1, 0, 0, 0,
                                0, 1, 0, 0,
                                0, 0, 1, 0,
                                item.d[0].px, item.d[1].px, item.d[2].px, 1];
            case "perspective":
                return [
                    1, 0, 0, 0,
                    0, 1, 0, 0,
                    0, 0, 1, -1 / item.d.px,
                    0, 0, 0, 1];
            case "matrix":
                return [item.d[0], item.d[1], 0, 0,
                                item.d[2], item.d[3], 0, 0,
                                0, 0, 1, 0,
                                item.d[4], item.d[5], 0, 1];
            case "matrix3d":
                return item.d;
            default:
                // conversion to matrix not yet implemented
        }
    }

    function convertToMatrix(transformList) {
        if (transformList.length === 0) {
            return [
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            ];
        }
        return transformList.map(convertItemToMatrix).reduce(multiplyMatrices);
    }

    function interpolateDecomposedTransformsWithMatrices(fromM, toM, f) {
        var product = dot(fromM.quaternion, toM.quaternion),
            translate,
            scale,
            skew,
            perspective,
            theta,
            quat,
            w, i;

        product = clamp(product, -1, 1);
        quat = [];
        if (product === 1) {
            quat = fromM.quaternion;
        } else {
            theta = Math.acos(product);
            w = Math.sin(f * theta) * 1 / Math.sqrt(1 - product * product);
            for (i = 0; i < 4; i++) {
                quat.push(fromM.quaternion[i] * (Math.cos(f * theta) - product * w) +
                                    toM.quaternion[i] * w);
            }
        }
        translate = Interpolation.interp(fromM.translate, toM.translate, f);
        scale = Interpolation.interp(fromM.scale, toM.scale, f);
        skew = Interpolation.interp(fromM.skew, toM.skew, f);
        perspective = Interpolation.interp(fromM.perspective, toM.perspective, f);
        return composeMatrix(translate, scale, skew, quat, perspective);
    }

    function interpTransformValue(from, to, f) {
        var type,
            result,
            maxVal,
            j;

        if (from.t) {
            type = from.t;
        } else {
            type = to.t;
        }
        switch (type) {
            case "matrix":
            case "matrix3d":
                // This one is not valid:
                // Must use matrix decomposition when interpolating raw matrices
            // Transforms with unitless parameters.
            case "rotate":
            case "rotateX":
            case "rotateY":
            case "rotateZ":
            case "rotate3d":
            case "scale":
            case "scaleX":
            case "scaleY":
            case "scaleZ":
            case "scale3d":
            case "skew":
            case "skewX":
            case "skewY":
                return {t: type, d: Interpolation.interp(from.d, to.d, f, type)};
            default:
                result = [];
                if (from.d && to.d) {
                    maxVal = Math.max(from.d.length, to.d.length);
                } else {
                    if (from.d) {
                        maxVal = from.d.length;
                    } else {
                        maxVal = to.d.length;
                    }
                }
                if (from.d) {
                    if (to.d) {
                        for (j = 0; j < maxVal; j++) {
                            result.push(PercentLengthType.interpolate(from.d[j], to.d[j], f));
                        }
                    } else {
                        for (j = 0; j < maxVal; j++) {
                            result.push(PercentLengthType.interpolate(from.d[j], {}, f));
                        }
                    }
                } else {
                    if (to.d) {
                        for (j = 0; j < maxVal; j++) {
                            result.push(PercentLengthType.interpolate({}, to.d[j], f));
                        }
                    } else {
                        // Will this case ever happen?
                        for (j = 0; j < maxVal; j++) {
                            result.push(PercentLengthType.interpolate({}, {}, f));
                        }
                    }

                }
                return {t: type, d: result};
        }
    }

    function isMatrix(item) {
        return item.t[0] === "m";
    }
