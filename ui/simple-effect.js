var Montage = require("montage").Montage;

var SimpleEffect = exports.SimpleEffect = Montage.specialize({

    start: {
        value: [0, 0, 0]
    },

    end: {
        value: [0, 0, 0]
    },

    _sample: {
        value: function (timeFraction, currentIteration, target) {
            var k = 1 - timeFraction,
                x = this.start[0] * k + this.end[0] * timeFraction,
                y = this.start[1] * k + this.end[1] * timeFraction,
                z = this.start[2] * k + this.end[2] * timeFraction;

            target.style.webkitTransform = "translate3d(" + x + "px," + y + "px," + z + "px)";
        }
    }

});