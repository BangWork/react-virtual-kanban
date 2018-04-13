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

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactVirtualized = require('react-virtualized');

var _reactDnd = require('react-dnd');

var _reactDndHtml5Backend = require('react-dnd-html5-backend');

var _SortableItem = require('../SortableItem');

var _SortableItem2 = _interopRequireDefault(_SortableItem);

var _types = require('../types');

var _dragSpec = require('./dragSpec');

var dragSpec = _interopRequireWildcard(_dragSpec);

var _dropSpec = require('./dropSpec');

var dropSpec = _interopRequireWildcard(_dropSpec);

var _propTypes = require('./propTypes');

var propTypes = _interopRequireWildcard(_propTypes);

var _PureComponent2 = require('../PureComponent');

var _PureComponent3 = _interopRequireDefault(_PureComponent2);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// const identity = (c) => c;


// import { ItemCache } from './itemCache';
function callWithListInfo(func, params, props) {
  return func((0, _extends3.default)({}, params, {
    listId: props.listId,
    list: props.list
  }));
}

var SortableList = function (_PureComponent) {
  (0, _inherits3.default)(SortableList, _PureComponent);

  function SortableList(props) {
    (0, _classCallCheck3.default)(this, SortableList);

    var _this = (0, _possibleConstructorReturn3.default)(this, (SortableList.__proto__ || (0, _getPrototypeOf2.default)(SortableList)).call(this, props));

    _this.keyMapper = function (rowIndex) {
      var row = _this.props.list.rows[rowIndex];
      return _this.props.itemCacheKey(row);
    };

    _this.onDragBeginRow = function (params) {
      return callWithListInfo(_this.props.dragBeginRow, params, _this.props);
    };

    _this.onDragEndRow = function (params) {
      return callWithListInfo(_this.props.dragEndRow, params, _this.props);
    };

    _this.onDropRow = function (params) {
      return callWithListInfo(_this.props.dropRow, params, _this.props);
    };

    _this.renderRow = _this.renderRow.bind(_this);
    _this.renderList = _this.renderList.bind(_this);

    _this.measureCache = new _reactVirtualized.CellMeasurerCache({
      defaultHeight: props.defaultCardHeight,
      fixedWidth: true,
      keyMapper: _this.keyMapper
    });
    return _this;
  }

  (0, _createClass3.default)(SortableList, [{
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      // todo if defaultCardHeight change, recreate cache.
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps) {
      if (prevProps.list.rows !== this.props.list.rows && !!this._list) {
        this._list.recomputeRowHeights();
      }
    }
  }, {
    key: 'renderRow',
    value: function renderRow(_ref) {
      var _this2 = this;

      var index = _ref.index,
          key = _ref.key,
          style = _ref.style,
          parent = _ref.parent;

      var row = this.props.list.rows[index];

      return _react2.default.createElement(
        _reactVirtualized.CellMeasurer,
        {
          cache: this.measureCache,
          columnIndex: 0,
          rowIndex: index,
          key: row.id,
          parent: parent
        },
        function (_ref2) {
          var measure = _ref2.measure;
          return _react2.default.createElement(_SortableItem2.default, {
            key: row.id,
            row: row,
            rowId: row.id,
            listId: _this2.props.listId,
            rowStyle: style,
            itemRenderer: _this2.props.itemRenderer,
            moveRow: _this2.props.moveRow,
            dropRow: _this2.onDropRow,
            dragBeginRow: _this2.onDragBeginRow,
            dragEndRow: _this2.onDragEndRow,
            findItemIndex: _this2.props.findItemIndex,
            measure: measure
          });
        }
      );
    }

    // renderItemForMeasure({ rowIndex }) {
    //   const { itemRenderer } = this.props;
    //   const row = this.props.list.rows[rowIndex];

    //   const itemProps = {
    //     row, rowId: row.id, 
    //     listId: this.props.listId, 
    //     rowStyle: {},
    //     isDragging: false, 
    //     connectDropTarget: identity, 
    //     connectDragSource: identity,
    //   };
    //   return itemRenderer(itemProps);
    // }

  }, {
    key: 'renderList',
    value: function renderList(_ref3) {
      var _this3 = this;

      var width = _ref3.width,
          height = _ref3.height;

      // TODO: Check whether scrollbar is visible or not :/

      return _react2.default.createElement(_reactVirtualized.List, {
        ref: function ref(c) {
          return _this3._list = c;
        },
        className: 'KanbanList',
        width: width,
        height: height,
        deferredMeasurementCache: this.measureCache,
        rowHeight: this.measureCache.rowHeight,
        rowCount: this.props.list.rows.length,
        rowRenderer: this.renderRow,
        overscanRowCount: this.props.overscanRowCount
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var _this4 = this;

      var _props = this.props,
          list = _props.list,
          listId = _props.listId,
          listRenderer = _props.listRenderer,
          isDragging = _props.isDragging,
          isDraggingOver = _props.isDraggingOver,
          canDrop = _props.canDrop,
          connectDragSource = _props.connectDragSource,
          connectDropTarget = _props.connectDropTarget,
          connectDragPreview = _props.connectDragPreview,
          listStyle = _props.listStyle;


      var children = _react2.default.createElement(
        _reactVirtualized.AutoSizer,
        null,
        function (dimensions) {
          return _this4.renderList(dimensions);
        }
      );
      var listProps = {
        list: list, listId: listId, listStyle: listStyle,
        connectDragSource: connectDragSource, connectDropTarget: connectDropTarget, connectDragPreview: connectDragPreview,
        isDragging: isDragging,
        isDraggingOver: isDraggingOver,
        canDrop: canDrop,
        children: children
      };
      return listRenderer(listProps);
    }
  }]);
  return SortableList;
}(_PureComponent3.default);

SortableList.defaultProps = {
  defaultCardHeight: 60
};


var connectDrop = (0, _reactDnd.DropTarget)([_types.LIST_TYPE, _types.ROW_TYPE], dropSpec, function (connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    canDrop: monitor.canDrop(),
    isDraggingOver: monitor.isOver()
  };
});

var connectDrag = (0, _reactDnd.DragSource)(_types.LIST_TYPE, dragSpec, function (connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging()
  };
});

exports.default = connectDrop(connectDrag(SortableList));