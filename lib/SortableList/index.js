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

var _reactDndScrollzone = require('react-dnd-scrollzone');

var _reactDndScrollzone2 = _interopRequireDefault(_reactDndScrollzone);

var _memoizee = require('memoizee');

var _memoizee2 = _interopRequireDefault(_memoizee);

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

// import { ItemCache } from './itemCache';
var AutoScrollList = (0, _reactDndScrollzone2.default)(_reactVirtualized.List);

// const identity = (c) => c;
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

    var _this2 = (0, _possibleConstructorReturn3.default)(this, (SortableList.__proto__ || (0, _getPrototypeOf2.default)(SortableList)).call(this, props));

    _this2.keyMapper = function (rowIndex) {
      var row = _this2.props.list.rows[rowIndex];
      return _this2.props.itemCacheKey(row);
    };

    _this2.onDragBeginRow = function (params) {
      return callWithListInfo(_this2.props.dragBeginRow, params, _this2.props);
    };

    _this2.onDragEndRow = function (params) {
      return callWithListInfo(_this2.props.dragEndRow, params, _this2.props);
    };

    _this2.onDropRow = function (params) {
      return callWithListInfo(_this2.props.dropRow, params, _this2.props);
    };

    _this2.onListRef = function (ref) {
      _this2._list = ref;
    };

    _this2.renderRow = _this2.renderRow.bind(_this2);
    // this.renderList = this.renderList.bind(this);

    _this2.verticalStrength = (0, _reactDndScrollzone.createVerticalStrength)(props.defaultCardHeight);
    _this2.measureCache = new _reactVirtualized.CellMeasurerCache({
      defaultHeight: props.defaultCardHeight,
      fixedWidth: true,
      keyMapper: _this2.keyMapper
    });

    var _this = _this2;
    _this2.renderList = (0, _memoizee2.default)(function (rowCount, overscanRowCount) {
      // TODO: Check whether scrollbar is visible or not :/
      var listProps = {
        ref: _this.onListRef,
        className: 'KanbanList',
        deferredMeasurementCache: _this.measureCache,
        rowHeight: _this.measureCache.rowHeight,
        rowRenderer: _this.renderRow,
        verticalStrength: _this.verticalStrength,
        rowCount: rowCount, overscanRowCount: overscanRowCount
      };

      return _react2.default.createElement(
        _reactVirtualized.AutoSizer,
        null,
        function (_ref) {
          var width = _ref.width,
              height = _ref.height;

          // console.log('SortabeList:(id=' + _this.props.listId  + ')renderList:', width, height, rowCount, scrollToIndex );
          return _react2.default.createElement(AutoScrollList, (0, _extends3.default)({}, listProps, {
            width: width,
            height: height
          }));
        }
      );
    }, { max: 1 });
    return _this2;
  }

  (0, _createClass3.default)(SortableList, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.props.connectDragPreview((0, _reactDndHtml5Backend.getEmptyImage)(), {
        captureDraggingState: true
      });
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      // todo if defaultCardHeight change, recreate cache.
      // if( nextProps.index !== this.props.index ){
      //   if( !!this._list){
      //     this._list.wrappedInstance.scrollToPosition(0);
      //   }
      // }
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps) {
      var _this3 = this;

      if (!!this._list) {
        if (prevProps.list.rows !== this.props.list.rows) {
          this._list.wrappedInstance.recomputeRowHeights();
        }
        if (prevProps.index !== this.props.index) {
          // fixme: 实在没有办法，出此下策。
          setTimeout(function () {
            if (_this3._list) {
              _this3._list.wrappedInstance.scrollToPosition(0);
            }
          }, 1000);
        }
      }
    }
  }, {
    key: 'renderRow',
    value: function renderRow(_ref2) {
      var _this4 = this;

      var index = _ref2.index,
          key = _ref2.key,
          style = _ref2.style,
          parent = _ref2.parent;

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
        function (_ref3) {
          var measure = _ref3.measure;
          return _react2.default.createElement(_SortableItem2.default, {
            key: row.id,
            index: index,
            row: row,
            rowId: row.id,
            listId: _this4.props.listId,
            list: _this4.props.list,
            rowStyle: style,
            itemRenderer: _this4.props.itemRenderer,
            moveRow: _this4.props.moveRow,
            dropRow: _this4.onDropRow,
            dragBeginRow: _this4.onDragBeginRow,
            dragEndRow: _this4.onDragEndRow,
            findItemIndex: _this4.props.findItemIndex,
            canDropRow: _this4.props.canDropRow,
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

    // lastListProps = {}


  }, {
    key: 'render',
    value: function render() {
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
          listStyle = _props.listStyle,
          index = _props.index,
          hasJustMoved = _props.hasJustMoved;

      // const scrollToRow = hasJustMoved ? 0 : -1;
      // const renderStamp = hasJustMoved ? (new Date()).getTime() : 0;

      var children = this.renderList(this.props.list.rows.length, this.props.overscanRowCount);
      var listProps = {
        list: list, listId: listId, listStyle: listStyle, index: index,
        connectDragSource: connectDragSource, connectDropTarget: connectDropTarget, connectDragPreview: connectDragPreview,
        isDragging: isDragging, isDraggingOver: isDraggingOver, canDrop: canDrop, children: children
      };
      return listRenderer(listProps);
    }
  }]);
  return SortableList;
}(_PureComponent3.default);

SortableList.defaultProps = {
  defaultCardHeight: 60,
  canDropRow: function canDropRow() {
    return true;
  }
};


var connectDrop = (0, _reactDnd.DropTarget)([_types.LIST_TYPE, _types.ROW_TYPE], dropSpec, function (connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    canDrop: monitor.canDrop(),
    isDraggingOver: monitor.isOver(),
    isDraggingListOver: monitor.isOver() && monitor.getItemType() === _types.LIST_TYPE,
    isDraggingRowOver: monitor.isOver() && monitor.getItemType() === _types.ROW_TYPE
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