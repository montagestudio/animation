var TestPageLoader = require("montage-testing/testpageloader").TestPageLoader,
    Timing = require("ui/timing").Timing,
    TimingFunctions = require("ui/timing-functions"),
    CubicBezierTimingFunction = TimingFunctions.CubicBezierTimingFunction,
    AnimationTimeline = require("ui/animation-timeline").AnimationTimeline,
    AnimationPlayer = require("ui/animation-player.reel").AnimationPlayer;

describe("test/animation/animation-spec", function() {
    describe("Timing", function() {
        var timing;

        beforeEach(function () {
            timing = Timing.create();
        });
        describe("initialization", function() {
            describe("after creation", function() {
                it("should be properly initialised", function() {
                    expect(timing.delay).toEqual(0);
                    expect(timing.endDelay).toEqual(0);
                    expect(timing.fill).toEqual("auto");
                    expect(timing.iterationStart).toEqual(0);
                    expect(timing.iterations).toEqual(1);
                    expect(timing.duration).toEqual("auto");
                    expect(timing.playbackRate).toEqual(1);
                    expect(timing.direction).toEqual("normal");
                    expect(timing.easing).toEqual("linear");
                });
            });
            describe("with numerical init", function() {
                it("should set duration", function() {
                    timing.init(3);
                    expect(timing.duration).toEqual(3);
                });
            });
            describe("with object init", function() {
                it("should set properties", function() {
                    timing.init({
                        delay: 1,
                        endDelay: 2,
                        fill: "backwards",
                        iterationStart: 3,
                        iterations: 4,
                        duration: 1000,
                        playbackRate: 5,
                        direction: "reverse",
                        easing: "ease-in"
                    });
                    expect(timing.delay).toEqual(1);
                    expect(timing.endDelay).toEqual(2);
                    expect(timing.fill).toEqual("backwards");
                    expect(timing.iterationStart).toEqual(3);
                    expect(timing.iterations).toEqual(4);
                    expect(timing.duration).toEqual(1000);
                    expect(timing.playbackRate).toEqual(5);
                    expect(timing.direction).toEqual("reverse");
                    expect(timing.easing).toEqual("ease-in");
                });
            });
        });
    });
});
