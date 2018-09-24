'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.nextGrid = exports.getBallBoundaryDictionary = exports.flipBall = exports.boundaryKey = exports.ballBoundaryKey = exports.locationKey = exports.ballKey = exports.emptyGrid = exports.newGrid = exports.addToGrid = exports.removeFromGrid = exports.BOUNDARY = exports.NO_BOUNDARY = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _ramda = require('ramda');

var R = _interopRequireWildcard(_ramda);

var _chance = require('chance');

var _chance2 = _interopRequireDefault(_chance);

var _playNotes = require('./play-notes');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

const chance = new _chance2.default();
const NO_BOUNDARY = exports.NO_BOUNDARY = 'no-boundary';
const BOUNDARY = exports.BOUNDARY = 'boundary';
const vectors = ['ball-up-right', 'ball-right', 'ball-down-right', 'ball-down-left', 'ball-left', 'ball-up-left'];
const vectorNumber = vectors.length;
const vectorOperations = [function ({ x, y, vector, speed }) {
    return { x: x + speed, y: y - speed, vector, speed };
}, function ({ x, y, vector, speed }) {
    return { x: x + speed, y, vector, speed };
}, function ({ x, y, vector, speed }) {
    return { x, y: y + speed, vector, speed };
}, function ({ x, y, vector, speed }) {
    return { x: x - speed, y: y + speed, vector, speed };
}, function ({ x, y, vector, speed }) {
    return { x: x - speed, y, vector, speed };
}, function ({ x, y, vector, speed }) {
    return { x, y: y - speed, vector, speed };
}];
const getVector = function () {
    return chance.natural({
        min: 0,
        max: 5
    });
};
const getSpeed = function (size) {
    return chance.pickone(R.range(2, size).map(function (n) {
        return 1.0 / n;
    }));
};
const cycleVector = function (vector, number) {
    return (vector + number - 1) % vectorNumber;
};
const getRandomNumber = function (size) {
    return chance.natural({
        min: 0,
        max: size - 1
    });
};
// const getRows = size => R.range(0, size).map(() => R.range(0, size));
const getBall = function (size) {
    return function () {
        return {
            x: getRandomNumber(size),
            y: getRandomNumber(size),
            vector: getVector(),
            speed: getSpeed(size)
        };
    };
};
const removeFromGrid = exports.removeFromGrid = function (grid, x, y) {
    const nextGrid = _extends({}, grid, {
        id: chance.guid(),
        balls: grid.balls.filter(function (ball) {
            return ball.x !== x || ball.y !== y;
        })
    });
    return nextGrid;
};

const addToGrid = exports.addToGrid = function (grid, x, y, dir, number, speed, forced) {
    if (grid.balls.length > 400 || !forced && grid.balls.filter(function (ball) {
        return ball.x === x && ball.y === y && ball.vector === dir;
    }).length) {
        return grid;
    }
    const nextGrid = _extends({}, grid, {
        id: chance.guid(),
        balls: [...grid.balls, {
            x,
            y,
            vector: dir,
            speed
        }]
    });

    return nextGrid;
};

const newGrid = exports.newGrid = function (size, numberOfBalls) {
    const balls = R.range(0, numberOfBalls).map(getBall(size));
    return { size: size, id: chance.guid(), balls, muted: true };
};

const emptyGrid = exports.emptyGrid = function (size) {
    return { size: size, id: chance.guid(), balls: [], muted: true };
};
// const seedGrid = () => newGrid(getRandomNumber(20) + 12, getRandomNumber(50) + 1);
const moveBall = function (ball) {
    return vectorOperations[ball.vector](ball);
};
const ballKey = exports.ballKey = function (ball) {
    return `{x:${ball.x},y:${ball.y},vector:${ball.vector}}`;
};
const locationKey = exports.locationKey = function (ball) {
    return `{x:${ball.x},y:${ball.y}}`;
};

const ballBoundaryKey = exports.ballBoundaryKey = function (ball, size, rotations = 0) {
    const returnVal = boundaryKey(ball, size, rotations);
    return returnVal === 'x' || returnVal === 'y' || returnVal === 'xy' ? BOUNDARY : returnVal;
};
const checkVectors = function (vector, first, second) {
    return R.or(vector === first, vector === second);
};
const boundaryKey = exports.boundaryKey = function (ball, size, rotations = 0) {
    const effectiveVector = (ball.vector + rotations) % vectorNumber;
    const checkEffectiveVectors = function (first, second) {
        return checkVectors(effectiveVector, first, second);
    };
    if (ball.y === 0 && checkEffectiveVectors(5, 0)) {
        return 'y';
    }
    if (ball.x + ball.y === size - 1 && checkEffectiveVectors(1, 2)) {
        return 'xy';
    }
    if (ball.x === 0 && checkEffectiveVectors(3, 4)) {
        return 'x';
    }
    return NO_BOUNDARY;
};
const newArrayIfFalsey = function (thingToCheck) {
    return thingToCheck || [];
};
const rotateBall = function (number) {
    return function (ball) {
        return _extends({}, ball, {
            vector: cycleVector(ball.vector, number)
        });
    };
};
const rotateSet = function (set) {
    return set.map(rotateBall(set.length));
};
const flipVector = function (vector) {
    return [2, 5, 4, 1, 0, 3][vector];
};
const flipBall = function (_ref) {
    let { vector } = _ref,
        rest = _objectWithoutProperties(_ref, ['vector']);

    return _extends({ vector: flipVector(vector) }, rest);
};
exports.flipBall = flipBall;
const getBallBoundaryDictionary = exports.getBallBoundaryDictionary = function (balls, size, keyFunc, rotations) {
    return balls.reduce(function (ballDictionary, ball) {
        const key = keyFunc(ball, size, rotations);
        const arrayAtKey = [...newArrayIfFalsey(ballDictionary[key]), ball];
        const newBallDictionary = _extends({}, ballDictionary, {
            [key]: arrayAtKey
        });

        return newBallDictionary;
    }, {});
};

const nextGrid = exports.nextGrid = function (grid, length) {
    const {
        size,
        balls
    } = grid;
    const ballsWithVectorDictionary = getBallBoundaryDictionary(balls, size, ballKey);
    const reducedBalls = Object.keys(ballsWithVectorDictionary).reduce(function (acc, ballsWithSameVectorKey) {
        const ballsAtIndex = ballsWithVectorDictionary[ballsWithSameVectorKey];
        const reducedBallsAtIndex = R.take(ballsAtIndex.length % vectorNumber || vectorNumber, ballsAtIndex);
        return [...acc, ...reducedBallsAtIndex];
    }, []).filter(function (ball) {
        return ball.x + ball.y < size && ball.x < size && ball.y < size;
    });
    const ballSetDictionary = getBallBoundaryDictionary(reducedBalls, size, locationKey);
    const ballSets = Object.keys(ballSetDictionary).map(function (key) {
        return ballSetDictionary[key];
    });
    const rotatedBalls = ballSets; //.map(rotateSet);
    const flatRotatedBalls = rotatedBalls.reduce(function (accum, current) {
        return [...accum, ...current];
    }, []);
    const ballBoundaryDictionary = getBallBoundaryDictionary(flatRotatedBalls, size, ballBoundaryKey);
    const ballsInMiddle = newArrayIfFalsey(ballBoundaryDictionary[NO_BOUNDARY]);
    const flippedBoundaryBalls = newArrayIfFalsey(ballBoundaryDictionary[BOUNDARY]).map(flipBall);

    const secondBoundaryDictionary = getBallBoundaryDictionary(flippedBoundaryBalls, size, ballBoundaryKey);
    flippedBoundaryBalls.filter;
    const doublyFlippedBoundaryBalls = newArrayIfFalsey(secondBoundaryDictionary[BOUNDARY]).map(flipBall);
    const nextGridBalls = [...ballsInMiddle, ...newArrayIfFalsey(secondBoundaryDictionary[NO_BOUNDARY]), ...doublyFlippedBoundaryBalls].map(moveBall);
    const noisyBallBoundaryDictionary = getBallBoundaryDictionary(nextGridBalls, size, ballBoundaryKey);
    (0, _playNotes.playSounds)(newArrayIfFalsey(noisyBallBoundaryDictionary[BOUNDARY]), size, length, grid.muted);
    return _extends({}, grid, {
        id: chance.guid(),
        size,
        balls: nextGridBalls
    });
};