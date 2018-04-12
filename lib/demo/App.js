'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactVirtualized = require('react-virtualized');

var _ = require('../');

require('./App.css');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var keyGenerator = function keyGenerator(_ref) {
  var id = _ref.id,
      lastModified = _ref.lastModified;
  return id + '-' + lastModified;
};

var App = function (_Component) {
  (0, _inherits3.default)(App, _Component);

  function App(props) {
    (0, _classCallCheck3.default)(this, App);

    var _this = (0, _possibleConstructorReturn3.default)(this, (App.__proto__ || (0, _getPrototypeOf2.default)(App)).call(this, props));

    _this.state = {
      lists: props.getLists()
    };

    // setInterval(() => {
    //   this.setState((prevState) => {
    //     if (prevState.lists[0].rows.length > 0) {
    //       this._initialLists = prevState.lists;
    //       return {lists: prevState.lists.map((list) => ({...list, rows: []}))};
    //     } else {
    //       return {lists: this._initialLists.concat()};
    //     }
    //   });
    // }, 3000);
    return _this;
  }

  (0, _createClass3.default)(App, [{
    key: 'render',
    value: function render() {
      var _this2 = this;

      return _react2.default.createElement(
        'div',
        { className: 'KanbanWrapper' },
        _react2.default.createElement(
          _reactVirtualized.AutoSizer,
          null,
          function (_ref2) {
            var width = _ref2.width,
                height = _ref2.height;
            return _react2.default.createElement(_.VirtualKanban, {
              lists: _this2.state.lists,
              width: width,
              height: height,
              listWidth: 200,
              itemCacheKey: keyGenerator,
              onMoveRow: function onMoveRow(_ref3) {
                var lists = _ref3.lists;
                return _this2.setState(function () {
                  return { lists: lists };
                });
              },
              onMoveList: function onMoveList(_ref4) {
                var lists = _ref4.lists;
                return _this2.setState(function () {
                  return { lists: lists };
                });
              }
            });
          }
        )
      );
    }
  }]);
  return App;
}(_react.Component);

exports.default = App;