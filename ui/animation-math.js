var Montage = require("montage").Montage;

var AnimationMath = exports.AnimationMath = Montage.specialize(null, {

    clamp: {
        value: function (x, min, max) {
            return Math.max(Math.min(x, max), min);
        }
    },

    convertToDeg: {
        value: function (num, type) {
            switch (type) {
            case "grad":
                return num / 400 * 360;
            case "rad":
                return num / 2 / Math.PI * 360;
            case "turn":
                return num * 360;
            default:
                return num;
            }
        }
    },

    determinant: {
        value: function (m) {
            return (
                m[0][0] * m[1][1] * m[2][2] +
                m[1][0] * m[2][1] * m[0][2] +
                m[2][0] * m[0][1] * m[1][2] -
                m[0][2] * m[1][1] * m[2][0] -
                m[1][2] * m[2][1] * m[0][0] -
                m[2][2] * m[0][1] * m[1][0]
            );
        }
    },

    inverse: {
        value: function (m) {
            var iDet = 1 / this.determinant(m),
                a = m[0][0], b = m[0][1], c = m[0][2],
                d = m[1][0], e = m[1][1], f = m[1][2],
                g = m[2][0], h = m[2][1], k = m[2][2],
                Ainv = [
                    [
                        (e * k - f * h) * iDet,
                        (c * h - b * k) * iDet,
                        (b * f - c * e) * iDet,
                        0
                    ],
                    [
                        (f * g - d * k) * iDet,
                        (a * k - c * g) * iDet,
                        (c * d - a * f) * iDet,
                        0
                    ],
                    [
                        (d * h - e * g) * iDet,
                        (g * b - a * h) * iDet,
                        (a * e - b * d) * iDet,
                        0
                    ]
                ],
                lastRow = [],
                val,
                i, j;

            for (i = 0; i < 3; i++) {
                val = 0;
                for (j = 0; j < 3; j++) {
                    val += m[3][j] * Ainv[j][i];
                }
                lastRow.push(val);
            }
            lastRow.push(1);
            Ainv.push(lastRow);
            return Ainv;
        }
    },

    transposeMatrix4: {
        value: function (m) {
            return [
                [m[0][0], m[1][0], m[2][0], m[3][0]],
                [m[0][1], m[1][1], m[2][1], m[3][1]],
                [m[0][2], m[1][2], m[2][2], m[3][2]],
                [m[0][3], m[1][3], m[2][3], m[3][3]]
            ];
        }
    },

    multVecMatrix: {
        value: function (v, m) {
            var result = [],
                val,
                i, j;

            for (i = 0; i < 4; i++) {
                val = 0;
                for (j = 0; j < 4; j++) {
                    val += v[j] * m[j][i];
                }
                result.push(val);
            }
            return result;
        }
    },

    normalize: {
        value: function (v) {
            var len = this.vectorLength(v);

            return [v[0] / len, v[1] / len, v[2] / len];
        }
    },

    vectorLength: {
        value: function (v) {
            return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
        }
    },

    combine: {
        value: function (v1, v2, v1s, v2s) {
            return [
                v1s * v1[0] + v2s * v2[0],
                v1s * v1[1] + v2s * v2[1],
                v1s * v1[2] + v2s * v2[2]
            ];
        }
    },

    cross: {
        value: function (v1, v2) {
            return [
                v1[1] * v2[2] - v1[2] * v2[1],
                v1[2] * v2[0] - v1[0] * v2[2],
                v1[0] * v2[1] - v1[1] * v2[0]
            ];
        }
    },

    decomposeMatrix: {
        value: function (matrix) {
            var m3d = [
                    matrix.slice(0, 4),
                    matrix.slice(4, 8),
                    matrix.slice(8, 12),
                    matrix.slice(12, 16)
                ],
                inversePerspectiveMatrix,
                transposedInversePerspectiveMatrix,
                perspectiveMatrix,
                perspective,
                translate,
                row,
                scale,
                skew,
                rhs,
                pdum3,
                quaternion,
                i, t, s;

            // skip normalization step as m3d[3][3] should always be 1
            if (m3d[3][3] !== 1) {
                throw "attempt to decompose non-normalized matrix";
            }
            perspectiveMatrix = m3d.concat(); // copy m3d
            for (i = 0; i < 3; i++) {
                perspectiveMatrix[i][3] = 0;
            }
            if (this.determinant(perspectiveMatrix) === 0) {
                return false;
            }
            rhs = [];
            if (m3d[0][3] !== 0 || m3d[1][3] !== 0 || m3d[2][3] !== 0) {
                rhs.push(m3d[0][3]);
                rhs.push(m3d[1][3]);
                rhs.push(m3d[2][3]);
                rhs.push(m3d[3][3]);
                inversePerspectiveMatrix = this.inverse(perspectiveMatrix);
                transposedInversePerspectiveMatrix = this.transposeMatrix4(inversePerspectiveMatrix);
                perspective = this.multVecMatrix(rhs, transposedInversePerspectiveMatrix);
            } else {
                perspective = [0, 0, 0, 1];
            }
            translate = m3d[3].slice(0, 3);
            row = [];
            row.push(m3d[0].slice(0, 3));
            scale = [];
            scale.push(this.vectorLength(row[0]));
            row[0] = this.normalize(row[0]);
            skew = [];
            row.push(m3d[1].slice(0, 3));
            skew.push(dot(row[0], row[1]));
            row[1] = this.combine(row[1], row[0], 1, -skew[0]);
            scale.push(this.vectorLength(row[1]));
            row[1] = this.normalize(row[1]);
            skew[0] /= scale[1];
            row.push(m3d[2].slice(0, 3));
            skew.push(dot(row[0], row[2]));
            row[2] = this.combine(row[2], row[0], 1, -skew[1]);
            skew.push(dot(row[1], row[2]));
            row[2] = this.combine(row[2], row[1], 1, -skew[2]);
            scale.push(this.vectorLength(row[2]));
            row[2] = this.normalize(row[2]);
            skew[1] /= scale[2];
            skew[2] /= scale[2];
            pdum3 = this.cross(row[1], row[2]);
            if (dot(row[0], pdum3) < 0) {
                for (i = 0; i < 3; i++) {
                    scale[i] *= -1;
                    row[i][0] *= -1;
                    row[i][1] *= -1;
                    row[i][2] *= -1;
                }
            }
            t = row[0][0] + row[1][1] + row[2][2] + 1;
            quaternion;
            if (t > 1e-4) {
                s = 0.5 / Math.sqrt(t);
                quaternion = [
                    (row[2][1] - row[1][2]) * s,
                    (row[0][2] - row[2][0]) * s,
                    (row[1][0] - row[0][1]) * s,
                    0.25 / s
                ];
            } else {
                if (row[0][0] > row[1][1] && row[0][0] > row[2][2]) {
                    s = Math.sqrt(1 + row[0][0] - row[1][1] - row[2][2]) * 2;
                    quaternion = [
                        0.25 * s,
                        (row[0][1] + row[1][0]) / s,
                        (row[0][2] + row[2][0]) / s,
                        (row[2][1] - row[1][2]) / s
                    ];
                } else {
                    if (row[1][1] > row[2][2]) {
                        s = Math.sqrt(1 + row[1][1] - row[0][0] - row[2][2]) * 2;
                        quaternion = [
                            (row[0][1] + row[1][0]) / s,
                            0.25 * s,
                            (row[1][2] + row[2][1]) / s,
                            (row[0][2] - row[2][0]) / s
                        ];
                    } else {
                        s = Math.sqrt(1 + row[2][2] - row[0][0] - row[1][1]) * 2;
                        quaternion = [
                            (row[0][2] + row[2][0]) / s,
                            (row[1][2] + row[2][1]) / s,
                            0.25 * s,
                            (row[1][0] - row[0][1]) / s
                        ];
                    }
                }
            }
            return {
                translate: translate,
                scale: scale,
                skew: skew,
                quaternion: quaternion,
                perspective: perspective
            };
        }
    },

    dot: {
        value: function (v1, v2) {
            var result = 0,
                i;

            for (i = 0; i < v1.length; i++) {
                result += v1[i] * v2[i];
            }
            return result;
        }
    },

    multiplyMatrices: {
        value: function (a, b) {
            return [
                a[0] * b[0] + a[4] * b[1] + a[8] * b[2] + a[12] * b[3],
                a[1] * b[0] + a[5] * b[1] + a[9] * b[2] + a[13] * b[3],
                a[2] * b[0] + a[6] * b[1] + a[10] * b[2] + a[14] * b[3],
                a[3] * b[0] + a[7] * b[1] + a[11] * b[2] + a[15] * b[3],
                a[0] * b[4] + a[4] * b[5] + a[8] * b[6] + a[12] * b[7],
                a[1] * b[4] + a[5] * b[5] + a[9] * b[6] + a[13] * b[7],
                a[2] * b[4] + a[6] * b[5] + a[10] * b[6] + a[14] * b[7],
                a[3] * b[4] + a[7] * b[5] + a[11] * b[6] + a[15] * b[7],
                a[0] * b[8] + a[4] * b[9] + a[8] * b[10] + a[12] * b[11],
                a[1] * b[8] + a[5] * b[9] + a[9] * b[10] + a[13] * b[11],
                a[2] * b[8] + a[6] * b[9] + a[10] * b[10] + a[14] * b[11],
                a[3] * b[8] + a[7] * b[9] + a[11] * b[10] + a[15] * b[11],
                a[0] * b[12] + a[4] * b[13] + a[8] * b[14] + a[12] * b[15],
                a[1] * b[12] + a[5] * b[13] + a[9] * b[14] + a[13] * b[15],
                a[2] * b[12] + a[6] * b[13] + a[10] * b[14] + a[14] * b[15],
                a[3] * b[12] + a[7] * b[13] + a[11] * b[14] + a[15] * b[15]
            ];
        }
    },

    // TODO: Use only one format for matrices and remove this multiply

    multiply: {
        value: function (a, b) {
            var result = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
                i, j, k;

            for (i = 0; i < 4; i++) {
                for (j = 0; j < 4; j++) {
                    for (k = 0; k < 4; k++) {
                        result[i][j] += b[i][k] * a[k][j];
                    }
                }
            }
            return result;
        }
    },

    is2D: {
        value: function (m) {
            return (
                m[0][2] == 0 &&
                m[0][3] == 0 &&
                m[1][2] == 0 &&
                m[1][3] == 0 &&
                m[2][0] == 0 &&
                m[2][1] == 0 &&
                m[2][2] == 1 &&
                m[2][3] == 0 &&
                m[3][2] == 0 &&
                m[3][3] == 1
            );
        }
    },

    composeMatrix: {
        value: function (translate, scale, skew, quat, perspective) {
            var matrix = [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]],
                i, j,
                x, y, z, w,
                rotMatrix,
                temp;

            for (i = 0; i < 4; i++) {
                matrix[i][3] = perspective[i];
            }
            for (i = 0; i < 3; i++) {
                for (j = 0; j < 3; j++) {
                    matrix[3][i] += translate[j] * matrix[j][i];
                }
            }
            x = quat[0]; y = quat[1]; z = quat[2]; w = quat[3];
            rotMatrix = [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]];
            rotMatrix[0][0] = 1 - 2 * (y * y + z * z);
            rotMatrix[0][1] = 2 * (x * y - z * w);
            rotMatrix[0][2] = 2 * (x * z + y * w);
            rotMatrix[1][0] = 2 * (x * y + z * w);
            rotMatrix[1][1] = 1 - 2 * (x * x + z * z);
            rotMatrix[1][2] = 2 * (y * z - x * w);
            rotMatrix[2][0] = 2 * (x * z - y * w);
            rotMatrix[2][1] = 2 * (y * z + x * w);
            rotMatrix[2][2] = 1 - 2 * (x * x + y * y);
            matrix = this.multiply(matrix, rotMatrix);
            temp = [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]];
            if (skew[2]) {
                temp[2][1] = skew[2];
                matrix = this.multiply(matrix, temp);
            }
            if (skew[1]) {
                temp[2][1] = 0;
                temp[2][0] = skew[0];
                matrix = this.multiply(matrix, temp);
            }
            if (skew[0]) {
                temp[2][0] = 0;
                temp[1][0] = skew[0];
                matrix = this.multiply(matrix, temp);
            }
            for (i = 0; i < 3; i++) {
                for (j = 0; j < 3; j++) {
                    matrix[i][j] *= scale[i];
                }
            }
            if (this.is2D(matrix)) {
                return {
                    t: "matrix",
                    d: [matrix[0][0], matrix[0][1], matrix[1][0], matrix[1][1], matrix[3][0], matrix[3][1]]
                };
            }
            return {
                t: "matrix3d",
                d: matrix[0].concat(matrix[1], matrix[2], matrix[3])
            };
        }
    }

});