'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.MinusButton = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _icons = require('./icons');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const MinusButton = exports.MinusButton = function ({ onClick }) {
    return _react2.default.createElement(
        'button',
        { className: "PlusButton isEnabled", onClick: onClick },
        _react2.default.createElement(_icons.MinusIcon, null)
    );
};