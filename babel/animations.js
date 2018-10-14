'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.updateCanvas = exports.setUpCanvas = exports.getAdderWithMousePosition = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _p = require('p5');

var _p2 = _interopRequireDefault(_p);

var _ballsLogic = require('./balls-logic');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let stateDrawing;
let mouseIsPressed;
let previousTime;
let mouseX = 1;
let mouseY = 1;
let mouseXstart = 1;
let mouseYstart = 1;
let cellSize = 1;
let thisBallAdder = function () {};
const sqrtThree = 1.7320508075688772935274463415059;
const triangleSize = 320;
const gridCanvasWidth = triangleSize * 2.0;
const gridCanvasHeight = Math.floor(triangleSize * sqrtThree);
const gridCanvasBorderSize = 1;
const convertExWhyPixelToIndex = function (x, y) {
    const whyIndex = Math.floor((y - gridCanvasBorderSize) / (cellSize * sqrtThree / 2));
    const exIndex = Math.floor((x - gridCanvasBorderSize - whyIndex * cellSize / 2) / cellSize);
    return {
        x: exIndex,
        y: whyIndex
    };
};
const polygon = function (sketch, x, y, radius, npoints) {
    var angle = sketch.TWO_PI / npoints;
    sketch.beginShape();
    for (var a = 0; a < sketch.TWO_PI; a += angle) {
        var sx = x + sketch.cos(a) * radius;
        var sy = y + sketch.sin(a) * radius;
        sketch.vertex(sx, sy);
    }
    sketch.endShape(sketch.CLOSE);
};
// const nat = () => chance.natural({
//     min: 0,
//     max: 255,
// });
const mouseIsInSketch = function () {
    return mouseX - mouseY / sqrtThree > 0 + gridCanvasBorderSize && mouseX < gridCanvasWidth - gridCanvasBorderSize - mouseY / sqrtThree && mouseY > 0 + gridCanvasBorderSize;
};

const getAdderWithMousePosition = exports.getAdderWithMousePosition = function (ballAdder) {
    return function (e) {
        thisBallAdder = ballAdder;
        if (mouseIsInSketch()) {
            const mouseXYindex = convertExWhyPixelToIndex(mouseX, mouseY);
            ballAdder(mouseXYindex.x, mouseXYindex.y, e);
        } else {}
    };
};
const setUpCanvas = exports.setUpCanvas = function (state) {
    stateDrawing = state;
    previousTime = new Date();
    const triangleDrawingArray = function (topLeft, cellSize, sketch) {
        // sketch.ellipse(
        //     topLeft.x + (cellSize / 2.0),
        //     topLeft.y + (sqrtThree*cellSize/6),
        //     cellSize*sqrtThree/3,
        //     cellSize*sqrtThree/3
        // )

        polygon(sketch, topLeft.x + cellSize / 2.0, topLeft.y + sqrtThree * cellSize / 6, cellSize / 3, 6);
    };
    const triangleRotatingArray = [function (cellSize, sketch, percentage) {
        return sketch.triangle(cellSize / 2.0, -(cellSize * percentage), cellSize, cellSize - cellSize * percentage, 0, cellSize - cellSize * percentage);
    }, function (cellSize, sketch, percentage) {
        return sketch.triangle(0 + cellSize * percentage, cellSize - cellSize * percentage, cellSize / 2 + cellSize * percentage * 1.5, 0.5 * cellSize * percentage, cellSize, cellSize);
    }, function (cellSize, sketch, percentage) {
        return sketch.quad(0, cellSize, cellSize / 2, cellSize * percentage, cellSize, cellSize, cellSize / 2, cellSize + cellSize * percentage);
    }, function (cellSize, sketch, percentage) {
        return sketch.triangle(0, cellSize, cellSize / 2 - 1.5 * cellSize * percentage, 0.5 * cellSize * percentage, cellSize - cellSize * percentage, cellSize - cellSize * percentage);
    }];
    const translateAndRotate = function (topLeft, sketch, vector, cellSize) {
        const xShift = vector === 1 || vector === 2 ? cellSize : 0;
        const yShift = vector === 2 || vector === 3 ? cellSize : 0;
        sketch.translate(topLeft.x + xShift, topLeft.y + yShift);
        sketch.angleMode(sketch.DEGREES);
        sketch.rotate(90 * vector);
    };
    const timeShift = function ({ x, y }, vector, percentage, cellSize, speed) {
        const shifted = [{ x: x + percentage * cellSize / 2.0 / speed, y: y - percentage * cellSize * sqrtThree / 2.0 / speed }, { x: x + percentage * cellSize / speed, y }, { x: x + percentage * cellSize / 2.0 / speed, y: y + percentage * cellSize * sqrtThree / 2.0 / speed }, { x: x - percentage * cellSize / 2.0 / speed, y: y + percentage * cellSize * sqrtThree / 2.0 / speed }, { x: x - percentage * cellSize / speed, y }, { x: x - percentage * cellSize / 2.0 / speed, y: y - percentage * cellSize * sqrtThree / 2.0 / speed }];
        return shifted[vector];
    };

    const drawingContext = function (sketch) {
        // eslint-disable-next-line no-param-reassign
        sketch.setup = function () {
            sketch.createCanvas(gridCanvasWidth + gridCanvasBorderSize * 2, gridCanvasHeight + gridCanvasBorderSize * 2).parent('sketch-holder').id('balls-animation');
        };
        // eslint-disable-next-line no-param-reassign
        sketch.draw = function () {
            const gridSize = stateDrawing.grid.size;
            mouseX = sketch.mouseX;
            mouseY = sketch.mouseY;

            mouseIsPressed = sketch.mouseIsPressed;

            const setMouseStart = function (e) {
                mouseXstart = mouseX;
                mouseYstart = mouseY;
                const { x: mouseXindexStart, y: mouseYindexStart } = convertExWhyPixelToIndex(mouseXstart, mouseYstart);
                if (mouseIsInSketch()) {
                    thisBallAdder(mouseXindexStart, mouseYindexStart, e, true);
                }
            };
            const setTouchStart = function (e) {
                mouseXstart = mouseX;
                mouseYstart = mouseY;
                const { x: mouseXindexStart, y: mouseYindexStart } = convertExWhyPixelToIndex(mouseXstart, mouseYstart);
                if (mouseIsPressed && mouseIsInSketch()) {
                    thisBallAdder(mouseXindexStart, mouseYindexStart, e, true);
                }
            };
            const sameAsStart = function () {
                const { x: mouseXindex, y: mouseYindex } = convertExWhyPixelToIndex(mouseX, mouseY);
                const { x: mouseXindexStart, y: mouseYindexStart } = convertExWhyPixelToIndex(mouseXstart, mouseYstart);
                return mouseXindexStart === mouseXindex && mouseYindexStart === mouseYindex;
            };
            const setMouseEnd = function (e) {
                mouseXstart = -1000;
                mouseYstart = -1000;
            };

            sketch.touchStarted = setTouchStart;
            sketch.touchEnded = setMouseEnd;
            sketch.mousePressed = setMouseStart;
            sketch.mouseReleased = setMouseEnd;

            const onDrag = function (e) {

                if (mouseIsPressed && mouseIsInSketch() && !sameAsStart()) {
                    const { x: mouseXindex, y: mouseYindex } = convertExWhyPixelToIndex(mouseX, mouseY);
                    thisBallAdder(mouseXindex, mouseYindex, e);
                    e.preventDefault();
                }
            };
            sketch.mouseDragged = onDrag;
            sketch.touchMoved = onDrag;
            // draw grid
            cellSize = gridCanvasWidth * 1.0 / (1.0 * gridSize);
            sketch.strokeWeight(0);
            sketch.fill(0, 0, 0);
            sketch.triangle(gridCanvasBorderSize, gridCanvasBorderSize, gridCanvasWidth + gridCanvasBorderSize, gridCanvasBorderSize, (gridCanvasBorderSize * 2 + gridCanvasWidth) / 2.0, gridCanvasBorderSize + gridCanvasHeight);
            //draw grid lines
            sketch.push();
            sketch.stroke(45, 45, 45);
            sketch.strokeWeight(1);
            for (var i = .5; i < gridSize; i++) {
                // horizontal
                sketch.line(gridCanvasBorderSize + i * cellSize / 2.0, gridCanvasBorderSize + i * cellSize * sqrtThree / 2.0, gridCanvasWidth - i * cellSize / 2.0, gridCanvasBorderSize + i * cellSize * sqrtThree / 2.0);
                // forward-vertical
                sketch.line(gridCanvasBorderSize + i * cellSize / 2.0, gridCanvasBorderSize + i * cellSize * sqrtThree / 2.0, i * cellSize, gridCanvasBorderSize);
                // backward-vertical
                sketch.line(i * cellSize, gridCanvasBorderSize, gridCanvasBorderSize + gridCanvasWidth / 2.0 + i * cellSize / 2.0, gridCanvasBorderSize + gridCanvasHeight - i * cellSize * sqrtThree / 2.0);
            }
            sketch.pop();

            const convertBallToMiddle = function (xy) {
                return {
                    x: gridCanvasBorderSize + xy.x * cellSize + xy.y * cellSize / 2.0,
                    y: gridCanvasBorderSize + xy.y * cellSize * sqrtThree / 2.0
                };
            };
            //draw Spot Markers
            sketch.push();
            sketch.stroke(45);
            sketch.fill(45);
            sketch.strokeWeight(2);
            for (var x = 0; x < gridSize; x++) {
                for (var y = 0; x + y < gridSize; y++) {
                    const xAndY = convertBallToMiddle({ x, y });

                    polygon(sketch, xAndY.x + cellSize / 2.0, xAndY.y + sqrtThree * cellSize / 6, cellSize / 3, 6);
                }
            }
            sketch.pop();

            // draw border

            sketch.push();
            sketch.strokeWeight(gridCanvasBorderSize * 2);
            sketch.stroke(255);
            sketch.noFill();
            sketch.triangle(0, 0, gridCanvasWidth + 2 * gridCanvasBorderSize, 0, (gridCanvasBorderSize * 2 + gridCanvasWidth) / 2.0, 2 * gridCanvasBorderSize + gridCanvasHeight);
            sketch.pop();

            sketch.fill(255, 255, 255);
            sketch.strokeWeight(0);
            const timeDiff = new Date().getTime() - previousTime.getTime();
            const possiblePercentage = (stateDrawing.playing ? timeDiff : 0) / (1.0 * stateDrawing.noteLength);
            const percentage = possiblePercentage > 1 ? 1 : possiblePercentage;
            const boundaryDictionary = (0, _ballsLogic.getBallBoundaryDictionary)(stateDrawing.grid.balls || [], gridSize, _ballsLogic.boundaryKey);
            const boundaryDictionaryX = boundaryDictionary['x'] || [];
            const boundaryDictionaryY = boundaryDictionary['y'] || [];
            // // draw highlighted rows and columns

            // if (stateDrawing.playing) {
            //     const prepareDrawForColumnsAndRows = (topLeft) => {
            //         sketch.push();
            //         sketch.strokeWeight(0);
            //         // const scaledColor = 255*percentage*2+(percentage>.5?(-255*(percentage-.5)*2*2):0);
            //         const scaledColor = 255 - 255 * percentage;
            //         sketch.fill(scaledColor, scaledColor, scaledColor, scaledColor);
            //         translateAndRotate(topLeft, sketch, 0, cellSize);
            //         return scaledColor;
            //     }
            //     boundaryDictionaryX.map((ball) => {
            //         const topLeft = {
            //             x:convertIndexToPixel(0),
            //             y:convertIndexToPixel(ball.y)
            //         };

            //         prepareDrawForColumnsAndRows(topLeft);
            //         sketch.rect(0, 0, cellSize*stateDrawing.grid.size, cellSize)

            //         sketch.pop();
            //         return undefined;
            //     });
            //     boundaryDictionaryY.map((ball) => {
            //         const topLeft = {
            //             x:convertIndexToPixel(ball.x),
            //             y:convertIndexToPixel(0)
            //         };
            //         prepareDrawForColumnsAndRows(topLeft);
            //         sketch.rect(0, 0, cellSize, cellSize*stateDrawing.grid.size)

            //         sketch.pop();
            //         return undefined;
            //     });
            // }
            // draw balls

            const ballLocationDictionary = (0, _ballsLogic.getBallBoundaryDictionary)(stateDrawing.grid.balls, gridSize, _ballsLogic.locationKey);

            // non-rotated balls
            const ballsToNotRotateDictionary = Object.keys(ballLocationDictionary).reduce(function (acc, location) {
                return ballLocationDictionary[location].length === 1 || !stateDrawing.collisionsOn ? [...acc, ...ballLocationDictionary[location]] : acc;
            }, []);
            // non-wall Balls
            const ballDictionary = (0, _ballsLogic.getBallBoundaryDictionary)(ballsToNotRotateDictionary, gridSize, _ballsLogic.ballBoundaryKey);
            (ballDictionary[_ballsLogic.NO_BOUNDARY] || []).map(function (ball) {
                const shiftedTopLeft = timeShift(convertBallToMiddle(ball), ball.vector, percentage, cellSize, ball.speed);
                // const triangleDrawer = triangleDrawingArray[ball.vector];
                triangleDrawingArray(shiftedTopLeft, cellSize, sketch);
                return undefined;
            });
            // wall Balls
            const flippedBalls = (ballDictionary[_ballsLogic.BOUNDARY] || []).map(function (ball) {
                sketch.push();
                sketch.strokeWeight(0);
                sketch.fill(255, 255, 255);
                let flippedBall = (0, _ballsLogic.flipBall)(ball);
                if (_ballsLogic.NO_BOUNDARY !== (0, _ballsLogic.ballBoundaryKey)(flippedBall, gridSize)) {
                    flippedBall = (0, _ballsLogic.flipBall)(flippedBall);
                }
                triangleDrawingArray(timeShift(convertBallToMiddle(ball), flippedBall.vector, percentage, cellSize, ball.speed), cellSize, sketch);
                sketch.pop();
                return flippedBall;
            });
            // rotating Balls

            const ballsToRotateDictionary = Object.keys(ballLocationDictionary).reduce(function (acc, location) {
                return ballLocationDictionary[location].length !== 1 && stateDrawing.collisionsOn ? _extends({}, acc, {
                    [location]: ballLocationDictionary[location]
                }) : acc;
            }, {});
            Object.keys(ballsToRotateDictionary).map(function (ballsToRotateIndex) {
                const rotations = (ballsToRotateDictionary[ballsToRotateIndex].length % 6 || 6) - 1;
                const bouncedRotation = (rotations + 3) % 6;
                // draw not bounced
                const bouncingDictionary = (0, _ballsLogic.getBallBoundaryDictionary)(ballsToRotateDictionary[ballsToRotateIndex], stateDrawing.grid.size, _ballsLogic.ballBoundaryKey, rotations);
                const ballsNotBouncing = bouncingDictionary[_ballsLogic.NO_BOUNDARY] || [];
                ballsNotBouncing.map(function (ball) {

                    sketch.push();
                    sketch.strokeWeight(0);
                    sketch.fill(255, 255, 255);

                    triangleDrawingArray(timeShift(convertBallToMiddle(ball), (ball.vector + rotations) % 6, percentage, cellSize, ball.speed), cellSize, sketch);
                    sketch.pop();
                    return undefined;
                });

                const ballsBouncing = bouncingDictionary[_ballsLogic.BOUNDARY] || [];

                // bounced
                ballsBouncing.map(function (ball) {
                    sketch.push();
                    sketch.strokeWeight(0);
                    sketch.fill(255, 255, 255);

                    triangleDrawingArray(timeShift(convertBallToMiddle(ball), (0, _ballsLogic.flipVector)((ball.vector + rotations) % 6), percentage, cellSize, ball.speed), cellSize, sketch);
                    sketch.pop();
                    return undefined;
                });
                return undefined;
            });

            // draw hover input
            if (mouseIsInSketch()) {
                sketch.cursor(sketch.CROSS);
                if (!stateDrawing.deleting) {
                    sketch.cursor(sketch.HAND);
                }
            }
        };
    };

    // eslint-disable-next-line
    new _p2.default(drawingContext);
};
const updateCanvas = exports.updateCanvas = function (state, date) {
    if (state.playing !== stateDrawing.playing || state.noteLength !== stateDrawing.noteLength || state.grid.id !== stateDrawing.grid.id || state.currentPreset !== stateDrawing.currentPreset) {

        if (state.noteLength !== stateDrawing.noteLength || date.getTime() - previousTime.getTime() >= stateDrawing.noteLength - 40) {
            previousTime = date;
        }

        stateDrawing = state;
    }
};