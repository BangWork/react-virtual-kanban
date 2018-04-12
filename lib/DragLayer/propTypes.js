'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.listPreviewRenderer = exports.itemPreviewRenderer = exports.isDragging = exports.currentOffset = exports.itemType = exports.item = exports.lists = undefined;

var _react = require('react');

var lists = exports.lists = _react.PropTypes.array;
var item = exports.item = _react.PropTypes.object;
var itemType = exports.itemType = _react.PropTypes.string;
var currentOffset = exports.currentOffset = _react.PropTypes.shape({
  x: _react.PropTypes.number.isRequired,
  y: _react.PropTypes.number.isRequire
});
var isDragging = exports.isDragging = _react.PropTypes.bool.isRequired;
var itemPreviewRenderer = exports.itemPreviewRenderer = _react.PropTypes.func.isRequired;
var listPreviewRenderer = exports.listPreviewRenderer = _react.PropTypes.func.isRequired;