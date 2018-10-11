import p5 from 'p5';
import {
    BOUNDARY,
    NO_BOUNDARY,
    getBallBoundaryDictionary,
    locationKey,
    ballBoundaryKey,
    boundaryKey,
    flipBall
} from './balls-logic';

let stateDrawing;
let mouseIsPressed;
let previousTime;
let mouseX = 1;
let mouseY = 1;
let mouseXstart = 1;
let mouseYstart = 1;
let cellSize = 1;
let thisBallAdder = () => {};
const sqrtThree = 1.7320508075688772935274463415059;
const triangleSize = 320;
const gridCanvasWidth = triangleSize*2.0;
const gridCanvasHeight = Math.floor(triangleSize*sqrtThree);
const gridCanvasBorderSize = 1;
const convertExWhyPixelToIndex = (x,y) => {
    const whyIndex = Math.floor((y - gridCanvasBorderSize)/(cellSize*sqrtThree/2));
    const exIndex = Math.floor((x - gridCanvasBorderSize - whyIndex*cellSize/2)/cellSize);
    return {
        x: exIndex,
        y: whyIndex
    };
};
// const nat = () => chance.natural({
//     min: 0,
//     max: 255,
// });
const mouseIsInSketch = () => (
    mouseX-mouseY/sqrtThree > 0 + gridCanvasBorderSize
    &&
    mouseX < gridCanvasWidth - gridCanvasBorderSize - mouseY/sqrtThree
    &&
    mouseY > 0 + gridCanvasBorderSize
);

export const getAdderWithMousePosition = (ballAdder) => (e) => {
    thisBallAdder = ballAdder;
    if (mouseIsInSketch()) {
        const mouseXYindex = convertExWhyPixelToIndex(mouseX, mouseY);
        ballAdder(mouseXYindex.x, mouseXYindex.y, e);
    } else {
    }
};
export const setUpCanvas = (state) => {
    stateDrawing = state;
    previousTime = new Date();
    const triangleDrawingArray = (topLeft, cellSize, sketch) => sketch.ellipse(
        topLeft.x + (cellSize / 2.0),
        topLeft.y + (sqrtThree*cellSize/6),
        // cellSize*0.57735026918962,
        // cellSize*0.57735026918962
        cellSize*sqrtThree/3,
        cellSize*sqrtThree/3
    );
    const triangleRotatingArray = [

        (cellSize, sketch, percentage) => sketch.triangle(
            cellSize / 2.0, -(cellSize * percentage),
            cellSize, cellSize - (cellSize * percentage),
            0, cellSize - (cellSize * percentage)
        ),
        (cellSize, sketch, percentage) => sketch.triangle(
            0 + cellSize * percentage, cellSize - (cellSize * percentage),
            (cellSize / 2) + (cellSize * percentage * 1.5), 0.5 * cellSize * percentage,
            cellSize, cellSize
        ),
        (cellSize, sketch, percentage) => sketch.quad(
            0, cellSize,
            cellSize / 2, cellSize * percentage,
            cellSize, cellSize,
            cellSize / 2, cellSize + cellSize * percentage),
        (cellSize, sketch, percentage) => sketch.triangle(
            0, cellSize,
            (cellSize / 2) - (1.5 * cellSize * percentage), 0.5 * cellSize * percentage,
            cellSize - (cellSize * percentage), cellSize - (cellSize * percentage))
    ];
    const translateAndRotate = (topLeft, sketch, vector, cellSize) => {
        const xShift = vector === 1 || vector === 2 ? cellSize : 0;
        const yShift = vector === 2 || vector === 3 ? cellSize : 0;
        sketch.translate(topLeft.x + xShift, topLeft.y + yShift);
        sketch.angleMode(sketch.DEGREES);
        sketch.rotate(90 * vector);
    };
    const timeShift = ({ x, y }, vector, percentage, cellSize, speed) => {
        const shifted = [
            { x: x + percentage*cellSize/2.0 / speed, y: y - percentage*cellSize * sqrtThree / 2.0 / speed},
            { x: x + percentage*cellSize / speed, y },
            { x: x + percentage*cellSize/2.0 / speed, y: y + percentage*cellSize * sqrtThree / 2.0 / speed},
            { x: x - percentage*cellSize/2.0 / speed, y: y + percentage*cellSize * sqrtThree / 2.0 / speed},
            { x: x - percentage*cellSize / speed, y },
            { x: x - percentage*cellSize/2.0 / speed, y: y - percentage*cellSize * sqrtThree / 2.0 / speed},
        ];
        return shifted[vector];
    };

    const drawingContext = (sketch) => {
        // eslint-disable-next-line no-param-reassign
        sketch.setup = () => {
            sketch.createCanvas(gridCanvasWidth + gridCanvasBorderSize * 2, gridCanvasHeight + gridCanvasBorderSize * 2).parent('sketch-holder').id('balls-animation');
        };
        // eslint-disable-next-line no-param-reassign
        sketch.draw = () => {
            const gridSize = stateDrawing.grid.size;
            mouseX = sketch.mouseX;
            mouseY = sketch.mouseY;
            // draw background slash border
            // sketch.background(255, 255, 255);
            
            mouseIsPressed = sketch.mouseIsPressed;
            
            const setMouseStart = (e) => {
                mouseXstart=mouseX;
                mouseYstart=mouseY;
                const {x:mouseXindexStart, y:mouseYindexStart} = convertExWhyPixelToIndex(mouseXstart,mouseYstart)
                if(mouseIsInSketch()){
                    thisBallAdder(mouseXindexStart, mouseYindexStart, e, true);
                }
            }
            const setTouchStart = (e) => {
                mouseXstart=mouseX;
                mouseYstart=mouseY;
                const {x:mouseXindexStart, y:mouseYindexStart} = convertExWhyPixelToIndex(mouseXstart,mouseYstart)
                if(mouseIsPressed && mouseIsInSketch()){
                    thisBallAdder(mouseXindexStart, mouseYindexStart, e, true);
                }
            }
            const sameAsStart = ()=>{
                const {x:mouseXindex, y:mouseYindex} = convertExWhyPixelToIndex(mouseX,mouseY)
                const {x:mouseXindexStart, y:mouseYindexStart} = convertExWhyPixelToIndex(mouseXstart,mouseYstart)
                return mouseXindexStart === mouseXindex && mouseYindexStart === mouseYindex;
            };
            const setMouseEnd = (e) => {
                mouseXstart=-1000;
                mouseYstart=-1000;
            }
            
            sketch.touchStarted = setTouchStart;
            sketch.touchEnded = setMouseEnd;
            sketch.mousePressed = setMouseStart;
            sketch.mouseReleased = setMouseEnd;


            const onDrag = (e) =>{
                
                if(mouseIsPressed && mouseIsInSketch() && !sameAsStart()){
                    const {x:mouseXindex, y:mouseYindex} = convertExWhyPixelToIndex(mouseX,mouseY)
                    thisBallAdder(mouseXindex, mouseYindex, e);
                    e.preventDefault()
                }
            }
            sketch.mouseDragged = onDrag;
            sketch.touchMoved = onDrag;
            // draw grid
            cellSize = (gridCanvasWidth * 1.0) / (1.0 * gridSize);
            sketch.strokeWeight(0);
            sketch.fill(0, 0, 0);
            sketch.triangle(gridCanvasBorderSize, gridCanvasBorderSize, gridCanvasWidth+gridCanvasBorderSize, gridCanvasBorderSize,(gridCanvasBorderSize*2+gridCanvasWidth)/2.0, gridCanvasBorderSize+gridCanvasHeight);
            //draw grid lines
            sketch.push();
            sketch.stroke(45, 45, 45);
            sketch.strokeWeight(1);
            for (var i=.5; i<gridSize; i++) {
                // horizontal
                sketch.line(
                    1 + gridCanvasBorderSize + i * cellSize/2.0,
                    1+gridCanvasBorderSize + i * cellSize * sqrtThree / 2.0,
                    gridCanvasWidth - i * cellSize/2.0,
                    1+gridCanvasBorderSize + i * cellSize * sqrtThree / 2.0
                );
                // forward-vertical
                sketch.line(
                    1 + gridCanvasBorderSize + i * cellSize/2.0,
                    1+gridCanvasBorderSize + i * cellSize * sqrtThree / 2.0,
                    1 + i * cellSize,
                    1+gridCanvasBorderSize
                );
                // backward-vertical
                sketch.line(
                    1 + i * cellSize,
                    1+gridCanvasBorderSize,
                    1 + gridCanvasBorderSize + gridCanvasWidth/2.0 + i * cellSize/2.0,
                    gridCanvasHeight - i * cellSize * sqrtThree / 2.0
                );
            }
            sketch.pop();

            sketch.fill(255, 255, 255);
            sketch.strokeWeight(0);
            // const convertIndexToPixel = index => (index * cellSize) + gridCanvasBorderSize;
            const convertBallToMiddle = xy => (
                {
                    x: gridCanvasBorderSize + xy.x * cellSize + xy.y * cellSize / 2.0,
                    y: gridCanvasBorderSize + xy.y * cellSize * sqrtThree / 2.0
                }
            );
            const timeDiff = new Date().getTime() - previousTime.getTime();
            const possiblePercentage = ((
                stateDrawing.playing ? timeDiff : 0
            ) / (
                1.0 * stateDrawing.noteLength
            ));
            const percentage = possiblePercentage > 1 ? 1 : possiblePercentage;
            const boundaryDictionary = getBallBoundaryDictionary(
                stateDrawing.grid.balls || [],
                gridSize,
                boundaryKey
            );
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

            const ballLocationDictionary = getBallBoundaryDictionary(
                stateDrawing.grid.balls,
                gridSize,
                locationKey
            );

            // non-rotated balls
            const ballsToNotRotateDictionary = Object.keys(ballLocationDictionary).reduce(
                (acc, location) => (
                    // ballLocationDictionary[location].length === 1 ?
                     1 ?
                        [
                            ...acc,
                            ...ballLocationDictionary[location],
                        ] :
                        acc
                ),
                []
            );
            // non-wall Balls
            const ballDictionary = getBallBoundaryDictionary(
                ballsToNotRotateDictionary,
                gridSize,
                ballBoundaryKey
            );
            (ballDictionary[NO_BOUNDARY] || []).map((ball) => {
                const shiftedTopLeft = timeShift(
                    convertBallToMiddle(ball),
                    ball.vector,
                    percentage,
                    cellSize,
                    ball.speed
                );
                // const triangleDrawer = triangleDrawingArray[ball.vector];
                triangleDrawingArray(shiftedTopLeft, cellSize, sketch);
                return undefined;
            });
            // wall Balls
            const flippedBalls = (ballDictionary[BOUNDARY] || []).map((ball) => {
                sketch.push();
                sketch.strokeWeight(0);
                sketch.fill(255, 255, 255);
                let flippedBall = flipBall(ball);
                if(NO_BOUNDARY!==ballBoundaryKey(flippedBall,gridSize)){
                    flippedBall = flipBall(flippedBall);
                }
                triangleDrawingArray(
                    timeShift(
                        convertBallToMiddle(ball),
                        flippedBall.vector,
                        percentage,
                        cellSize,
                        ball.speed
                    ),
                    cellSize,
                    sketch
                )
                sketch.pop();
                return flippedBall;
            });
            // rotating Balls

            // const ballsToRotateDictionary = Object.keys(ballLocationDictionary).reduce(
            //     (acc, location) => (
            //         ballLocationDictionary[location].length !== 1 ?
            //             {
            //                 ...acc,
            //                 [location]: ballLocationDictionary[location],
            //             } :
            //             acc
            //     ),
            //     {}
            // );
            // Object.keys(ballsToRotateDictionary).map((ballsToRotateIndex) => {
            //     const rotations = (
            //         (
            //             ballsToRotateDictionary[ballsToRotateIndex].length % 4
            //         ) || 4
            //     ) - 1;
            //     const bouncedRotation = (rotations + 2) % 4;
            //     // draw not bounced
            //     const bouncingDictionary = getBallBoundaryDictionary(
            //         ballsToRotateDictionary[ballsToRotateIndex],
            //         stateDrawing.grid.size,
            //         ballBoundaryKey,
            //         rotations
            //     );
            //     const ballsNotBouncing = bouncingDictionary[NO_BOUNDARY] || [];
            //     ballsNotBouncing.map((ball) => {
            //         const topLeft = convertBallToTopLeft(ball);
                    
            //         sketch.push();
            //         sketch.strokeWeight(0);
            //         sketch.fill(255, 255, 255);
            //         translateAndRotate(topLeft, sketch, ball.vector, cellSize);
                    
            //         triangleRotatingArray[rotations](cellSize, sketch, percentage);
                    
            //         sketch.pop();
            //         return undefined;
            //     });
                
            //     const ballsBouncing = bouncingDictionary[BOUNDARY] || [];

            //     // bounced
            //     ballsBouncing.map((ball) => {
            //         const topLeft = convertBallToTopLeft(ball);

            //         sketch.push();
            //         sketch.strokeWeight(0);
            //         sketch.fill(255, 255, 255);
            //         translateAndRotate(topLeft, sketch, ball.vector, cellSize);
            //         triangleRotatingArray[bouncedRotation](cellSize, sketch, percentage);

            //         sketch.pop();
            //         return undefined;
            //     });
            //     return undefined;
            // });

            // draw hover input
            if (mouseIsInSketch()){
                sketch.cursor(sketch.CROSS);
                if (!stateDrawing.deleting ) {
                    sketch.cursor(sketch.HAND);
                }
            }

        };
    };

    // eslint-disable-next-line
    new p5(drawingContext);
};
export const updateCanvas = (state, date) => {
    if (state.playing !== stateDrawing.playing ||
        state.noteLength!==stateDrawing.noteLength ||
        state.grid.id!==stateDrawing.grid.id ||
        state.currentPreset!==stateDrawing.currentPreset) {

            if(state.noteLength!==stateDrawing.noteLength || date.getTime() - previousTime.getTime()>=stateDrawing.noteLength-40){
                previousTime = date;
            }

            stateDrawing = state;
    }
};
