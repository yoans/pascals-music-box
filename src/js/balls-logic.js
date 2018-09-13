
import * as R from 'ramda';
import Chance from 'chance';
import {playSounds} from './play-notes';

const chance = new Chance();
export const NO_BOUNDARY = 'no-boundary';
export const BOUNDARY = 'boundary';
const vectors = [
    'ball-up-right',
    'ball-right',
    'ball-down-right',
    'ball-down-left',
    'ball-left',
    'ball-up-left',
];
const vectorNumber = vectors.length;
const vectorOperations = [
    ({ x, y, vector, speed}) => ({ x: x + speed, y: y - speed, vector, speed }),
    ({ x, y, vector, speed}) => ({ x: x + speed, y, vector, speed }),
    ({ x, y, vector, speed}) => ({ x, y: y + speed, vector, speed }),
    ({ x, y, vector, speed}) => ({ x: x - speed, y: y + speed, vector, speed }),
    ({ x, y, vector, speed}) => ({ x: x - speed, y, vector, speed }),
    ({ x, y, vector, speed}) => ({ x, y: y - speed, vector, speed }),
];
const getVector = () => chance.natural({
    min: 0,
    max: 5,
});
const getSpeed = (size) => chance.pickone(
    R.range(2,size).map((n)=>1.0/n)
);
const cycleVector = (vector, number) => (vector + number - 1) % vectorNumber;
const getRandomNumber = size => chance.natural({
    min: 0,
    max: size - 1,
});
// const getRows = size => R.range(0, size).map(() => R.range(0, size));
const getBall = size => () => ({
    x: getRandomNumber(size),
    y: getRandomNumber(size),
    vector: getVector(),
    speed: getSpeed(size),
});
export const removeFromGrid = (grid, x, y) => {
    const nextGrid = {
        ...grid,
        id: chance.guid(),
        balls: grid.balls.filter(ball => ball.x !== x || ball.y !== y),
    };
    return nextGrid;
};

export const addToGrid = (grid, x, y, dir, speed) => {
    const nextGrid = {
        ...grid,
        id: chance.guid(),
        balls: [
            ...grid.balls,
            {
                x,
                y,
                vector: dir,
                speed
            },
        ],
    };
    return nextGrid;
};

export const newGrid = (size, numberOfBalls) => {
    const balls = R.range(0, numberOfBalls).map(getBall(size));
    return { size: size, id: chance.guid(), balls, muted: true };
};

export const emptyGrid = (size) => {
    return { size: size, id: chance.guid(), balls: [], muted: true };
};
// const seedGrid = () => newGrid(getRandomNumber(20) + 12, getRandomNumber(50) + 1);
const moveBall = ball => vectorOperations[ball.vector](ball);
export const ballKey = ball => `{x:${ball.x},y:${ball.y},vector:${ball.vector}}`;
export const locationKey = ball => `{x:${ball.x},y:${ball.y}}`;

export const ballBoundaryKey = (ball, size, rotations = 0) => {
    const returnVal = boundaryKey(ball, size, rotations);
    return (returnVal === 'x' || returnVal === 'y'|| returnVal === 'xy') ? BOUNDARY: returnVal;
};
const checkVectors = (vector,first,second) => R.or(vector===first,vector===second);
export const boundaryKey = (ball, size, rotations = 0) => {
    const effectiveVector = (ball.vector + rotations) % vectorNumber;
    const checkEffectiveVectors = (first,second) => checkVectors(effectiveVector,first,second);
    if (ball.y === 0 && checkEffectiveVectors(5,0)) {
        return 'y';
    }
    if (ball.x + ball.y === size - 1 && checkEffectiveVectors(1,2)) {
        return 'xy';
    }
    if (ball.x === 0 && checkEffectiveVectors(3,4)) {
        return 'x';
    }
    return NO_BOUNDARY;
};
const newArrayIfFalsey = thingToCheck => (thingToCheck || []);
const rotateBall = number => ball => ({
    ...ball,
    vector: cycleVector(ball.vector, number),
});
const rotateSet = set => set.map(rotateBall(set.length));
const flipVector = vector => [2,5,4,1,0,3][vector];
export const flipBall = ({ vector, ...rest }) => ({ vector: flipVector(vector), ...rest });
export const getBallBoundaryDictionary = (balls, size, keyFunc, rotations) => balls.reduce(
    (ballDictionary, ball) => {
        const key = keyFunc(ball, size, rotations);
        const arrayAtKey = [
            ...(newArrayIfFalsey(ballDictionary[key])),
            ball,
        ];
        const newBallDictionary = {
            ...ballDictionary,
            [key]: arrayAtKey
        };

        return newBallDictionary;
    }
    , {},
);

export const nextGrid = (grid, length) => {
    const {
        size,
        balls
    } = grid;
    const ballsWithVectorDictionary = getBallBoundaryDictionary(balls, size, ballKey);
    const reducedBalls = Object.keys(ballsWithVectorDictionary).reduce(
        (acc, ballsWithSameVectorKey) => {
            const ballsAtIndex = ballsWithVectorDictionary[ballsWithSameVectorKey];
            const reducedBallsAtIndex = R.take(ballsAtIndex.length % vectorNumber || vectorNumber, ballsAtIndex);
            return [...acc, ...reducedBallsAtIndex];
        }
        , [],
    ).filter(ball => ball.x + ball.y < size && ball.x < size && ball.y < size);
    const ballSetDictionary = getBallBoundaryDictionary(reducedBalls, size, locationKey);
    const ballSets = Object.keys(ballSetDictionary).map(key => ballSetDictionary[key]);
    const rotatedBalls = ballSets.map(rotateSet);
    const flatRotatedBalls = rotatedBalls.reduce(
        (accum, current) => [...accum, ...current],
        []
    );
    const ballBoundaryDictionary = getBallBoundaryDictionary(
        flatRotatedBalls, size, ballBoundaryKey
    );
    const ballsInMiddle = newArrayIfFalsey(
        ballBoundaryDictionary[NO_BOUNDARY]
    );
    const flippedBoundaryBalls = newArrayIfFalsey(
        ballBoundaryDictionary[BOUNDARY]
    ).map(flipBall);
    
    const secondBoundaryDictionary = getBallBoundaryDictionary(
        flippedBoundaryBalls, size, ballBoundaryKey
    );
    flippedBoundaryBalls.filter
    const doublyFlippedBoundaryBalls = newArrayIfFalsey(
        secondBoundaryDictionary[BOUNDARY]
    ).map(flipBall);
    const nextGridBalls = [
        ...ballsInMiddle,
        ...newArrayIfFalsey(secondBoundaryDictionary[NO_BOUNDARY]),
        ...doublyFlippedBoundaryBalls,
    ].map(moveBall);
    const noisyBallBoundaryDictionary = getBallBoundaryDictionary(nextGridBalls, size, ballBoundaryKey);
    playSounds(newArrayIfFalsey(noisyBallBoundaryDictionary[BOUNDARY]), size, length, grid.muted);
    return {
        ...grid,
        id: chance.guid(),
        size,
        balls: nextGridBalls,
    };
};
