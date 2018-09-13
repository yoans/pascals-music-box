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
let previousTime;
let mouseX = 1;
let mouseY = 1;
let cellSize = 1;
const sqrtThree = 1.7320508075688772935274463415059;
const triangleSize = 320;
const gridCanvasWidth = triangleSize*2.0;
const gridCanvasHeight = Math.floor(triangleSize*sqrtThree);
const gridCanvasBorderSize = 1;
const convertPixelToIndex = pixel => Math.floor(
    (pixel - gridCanvasBorderSize) / cellSize
);
// const nat = () => chance.natural({
//     min: 0,
//     max: 255,
// });
export const getAdderWithMousePosition = (ballAdder) => (e) => {
    if (mouseX > 0 + gridCanvasBorderSize &&
        mouseX < gridCanvasWidth - gridCanvasBorderSize &&
        mouseY > 0 + gridCanvasBorderSize &&
        mouseY < gridCanvasHeight - gridCanvasBorderSize
    ) {
        const mouseXindex = convertPixelToIndex(mouseX);
        const mouseYindex = convertPixelToIndex(mouseY);
        ballAdder(mouseXindex, mouseYindex, e);
    } else {
    }
};
export const setUpCanvas = (state) => {
    stateDrawing = state;
    previousTime = new Date();
    const triangleDrawingArray = (topLeft, cellSize, sketch) => sketch.ellipse(
        topLeft.x + (cellSize / 2.0),
        topLeft.y + (cellSize / 2.0),
        // cellSize*0.57735026918962,
        // cellSize*0.57735026918962
        cellSize*0.4,
        cellSize*0.4
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
    const timeShift = ({ x, y }, vector, percentage, cellSize) => {
        const shifted = [
            { x: x + percentage*cellSize/2.0, y: y - percentage*cellSize * sqrtThree / 2.0 },
            { x: x + percentage*cellSize, y },
            { x: x + percentage*cellSize/2.0, y: y + percentage*cellSize * sqrtThree / 2.0 },
            { x: x - percentage*cellSize/2.0, y: y + percentage*cellSize * sqrtThree / 2.0 },
            { x: x - percentage*cellSize, y },
            { x: x - percentage*cellSize/2.0, y: y - percentage*cellSize * sqrtThree / 2.0 },
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
            sketch.background(255, 255, 255);
            // draw grid
            cellSize = (gridCanvasWidth * 1.0) / (1.0 * gridSize-1);
            sketch.strokeWeight(0);
            sketch.fill(0, 0, 0);
            sketch.triangle(gridCanvasBorderSize, gridCanvasBorderSize, gridCanvasWidth+gridCanvasBorderSize, gridCanvasBorderSize,(gridCanvasBorderSize*2+gridCanvasWidth)/2.0, gridCanvasBorderSize+gridCanvasHeight);
            //draw grid lines
            sketch.push();
            sketch.stroke(45, 45, 45);
            sketch.strokeWeight(1);
            for (var i=1; i<gridSize-1; i++) {
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
                    ballLocationDictionary[location].length === 1 ?
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
                    cellSize
                );
                // const triangleDrawer = triangleDrawingArray[ball.vector];
                triangleDrawingArray(shiftedTopLeft, cellSize, sketch);
                return undefined;
            });
            // wall Balls
            (ballDictionary[BOUNDARY] || []).map((ball) => {
                sketch.push();
                sketch.strokeWeight(0);
                sketch.fill(255, 255, 255);
                // const topLeft = convertBallToTopLeft(ball);
                // translateAndRotate(topLeft, sketch, ball.vector, cellSize);
                // sketch.quad(
                //     0, cellSize,
                //     cellSize / 2, cellSize * percentage,
                //     cellSize, cellSize,
                //     cellSize / 2, cellSize + cellSize * percentage
                // );
                triangleDrawingArray(
                    timeShift(
                        convertBallToMiddle(ball),
                        flipBall(ball).vector,
                        percentage,
                        cellSize
                    ),
                    cellSize,
                    sketch
                )
                sketch.pop();
                return undefined;
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
            sketch.cursor(sketch.CROSS);
            const mouseXindex = convertPixelToIndex(sketch.mouseX);
            const mouseYindex = convertPixelToIndex(sketch.mouseY);
            if (!stateDrawing.deleting) {
                sketch.cursor(sketch.HAND);
                // triangleDrawingArray[stateDrawing.inputDirection](
                //     convertBallToTopLeft(
                //         {
                //             x: mouseXindex,
                //             y: mouseYindex
                //         }
                //     ),
                //     cellSize,
                //     sketch
                // );
            }
            // eslint-disable-next-line no-param-reassign
            // sketch.touchEnded = (e) => {
            //     if (sketch.mouseX > 0 + gridCanvasBorderSize &&
            //         sketch.mouseX < gridCanvasSize - gridCanvasBorderSize &&
            //         sketch.mouseY > 0 + gridCanvasBorderSize &&
            //         sketch.mouseY < gridCanvasSize - gridCanvasBorderSize
            //     ) {
            //         if (ballAdder) {
            //             ballAdder(mouseXindex, mouseYindex, e);
            //             return false;
            //         }
            //     } else {
            //     }
            // };
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
