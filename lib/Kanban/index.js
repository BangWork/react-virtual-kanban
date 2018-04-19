'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

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

var _reactDndHtml5Backend = require('react-dnd-html5-backend');

var _reactDndHtml5Backend2 = _interopRequireDefault(_reactDndHtml5Backend);

var _reactDndScrollzone = require('react-dnd-scrollzone');

var _reactDndScrollzone2 = _interopRequireDefault(_reactDndScrollzone);

var _reactDnd = require('react-dnd');

var _reactVirtualized = require('react-virtualized');

var _scrollbarSize = require('dom-helpers/util/scrollbarSize');

var _scrollbarSize2 = _interopRequireDefault(_scrollbarSize);

var _isEqualWith = require('lodash/isEqualWith');

var _isEqualWith2 = _interopRequireDefault(_isEqualWith);

var _has = require('lodash/has');

var _has2 = _interopRequireDefault(_has);

var _updateLists = require('./updateLists');

var _propTypes = require('./propTypes');

var propTypes = _interopRequireWildcard(_propTypes);

var _decorators = require('../decorators');

var decorators = _interopRequireWildcard(_decorators);

var _DragLayer = require('../DragLayer');

var _DragLayer2 = _interopRequireDefault(_DragLayer);

var _SortableList = require('../SortableList');

var _SortableList2 = _interopRequireDefault(_SortableList);

var _PureComponent2 = require('../PureComponent');

var _PureComponent3 = _interopRequireDefault(_PureComponent2);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var GridWithScrollZone = (0, _reactDndScrollzone2.default)(_reactVirtualized.Grid);

// import { DragDropManager } from 'dnd-core';

function listIdEqualCustomer(a, b) {
  if ((0, _has2.default)(a, 'id') && (0, _has2.default)(a, 'rows') && (0, _has2.default)(b, 'id')) {
    return a.id === b.id;
  }
}

var Kanban = function (_PureComponent) {
  (0, _inherits3.default)(Kanban, _PureComponent);

  function Kanban(props) {
    (0, _classCallCheck3.default)(this, Kanban);

    var _this = (0, _possibleConstructorReturn3.default)(this, (Kanban.__proto__ || (0, _getPrototypeOf2.default)(Kanban)).call(this, props));

    _this.tempState = null;
    _this.lastMoveListInfo = {};
    _this.lastMoveInfo = null;


    _this.state = {
      lists: props.lists
    };

    _this.isDraggingList = false;
    _this.horizontalStrength = (0, _reactDndScrollzone.createHorizontalStrength)(200);
    _this.verticalStrength = function () {};

    _this.onMoveList = _this.onMoveList.bind(_this);
    _this.onMoveRow = _this.onMoveRow.bind(_this);

    _this.onDropList = _this.onDropList.bind(_this);
    _this.onDropRow = _this.onDropRow.bind(_this);

    _this.onDragBeginRow = _this.onDragBeginRow.bind(_this);
    _this.onDragEndRow = _this.onDragEndRow.bind(_this);
    _this.onDragBeginList = _this.onDragBeginList.bind(_this);
    _this.onDragEndList = _this.onDragEndList.bind(_this);

    _this.renderList = _this.renderList.bind(_this);
    _this.findItemIndex = _this.findItemIndex.bind(_this);
    _this.findListIndex = _this.findListIndex.bind(_this);
    _this.drawFrame = _this.drawFrame.bind(_this);
    // this.onScrollChange = this.onScrollChange.bind(this);
    return _this;
  }

  (0, _createClass3.default)(Kanban, [{
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      if (this.props.lists !== nextProps.lists) {
        this.lastMoveInfo = null;
      }
      if (this.isDraggingList) {
        var listIdsChanged = !(0, _isEqualWith2.default)(this.props.lists, nextProps.lists, listIdEqualCustomer);
        if (listIdsChanged) {
          this.tempState = { lists: nextProps.lists };
        } else {
          // 在拖拽列表过程中，允许改变列表内的卡片位置，但不改变列表之间的位置。
          var stateLists = this.state.lists;
          var propsLists = nextProps.lists;
          var newLists = [];

          // 这里对 state.lists 更新了 rows，但保持了 state.lists 中 listId 的顺序不变。

          var _loop = function _loop(i) {
            var list = stateLists[i];
            var listId = list.id;
            // 因为 listIdsChanged == false，所以，这里的 propsList 一定存在。
            var propsList = propsLists.find(function (_ref) {
              var id = _ref.id;
              return id === listId;
            });
            newLists[i] = (0, _extends3.default)({}, list, { rows: propsList.rows });
          };

          for (var i = 0; i < stateLists.length; i++) {
            _loop(i);
          }
          this.scheduleUpdate(function () {
            return { lists: newLists };
          });
          this.tempState = { lists: nextProps.lists };
        }
      } else {
        this.scheduleUpdate(function () {
          return { lists: nextProps.lists };
        });
      }
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(_prevProps, prevState) {
      if (prevState.lists !== this.state.lists) {
        this._grid.wrappedInstance.forceUpdate();
      }
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      // this.endScrollCheckTimer();
      cancelAnimationFrame(this._requestedFrame);
    }
  }, {
    key: 'scheduleUpdate',
    value: function scheduleUpdate(updateFn, callbackFn) {
      this._pendingUpdateFn = updateFn;
      this._pendingUpdateCallbackFn = callbackFn;

      if (!this._requestedFrame) {
        this._requestedFrame = requestAnimationFrame(this.drawFrame);
      }
    }
  }, {
    key: 'drawFrame',
    value: function drawFrame() {
      var nextState = this._pendingUpdateFn(this.state);
      var callback = this._pendingUpdateCallbackFn;

      this.setState(nextState, callback);

      this._pendingUpdateFn = null;
      this._pendingUpdateCallbackFn = null;
      this._requestedFrame = null;
    }
  }, {
    key: 'itemEndData',
    value: function itemEndData(_ref2) {
      var itemId = _ref2.itemId;

      var lists = this.state.lists;

      return {
        itemId: itemId,
        get rowId() {
          return itemId;
        },
        listId: (0, _updateLists.findItemListId)(lists, itemId),
        rowIndex: (0, _updateLists.findItemIndex)(lists, itemId),
        listIndex: (0, _updateLists.findItemListIndex)(lists, itemId),
        lists: lists
      };
    }
  }, {
    key: 'listEndData',
    value: function listEndData(_ref3) {
      var listId = _ref3.listId;

      var lists = this.state.lists;

      return {
        listId: listId,
        listIndex: (0, _updateLists.findListIndex)(lists, listId),
        lists: lists
      };
    }
  }, {
    key: 'findItemIndex',
    value: function findItemIndex(itemId) {
      return (0, _updateLists.findItemIndex)(this.state.lists, itemId);
    }
  }, {
    key: 'findListIndex',
    value: function findListIndex(listId) {
      return (0, _updateLists.findListIndex)(this.state.lists, listId);
    }

    // scrollCheckTimerId = 0;
    // startScrollCheckTimer(){
    //   if(!this.scrollCheckTimerId){
    //     this.scrollCheckTimerId = setInterval(() => {
    //       if(!this.hasScrollChanged ){
    //         this.endScrollCheckTimer();
    //         this.isScrolling = false;
    //         console.log('set isScrolling false');
    //       }
    //       this.hasScrollChanged = false;
    //     }, 500);
    //   }
    // }
    // endScrollCheckTimer(){
    //   if(this.scrollCheckTimerId){
    //     clearInterval(this.scrollCheckTimerId);
    //     this.scrollCheckTimerId = 0;
    //   }
    // }

  }, {
    key: 'onMoveList',
    value: function onMoveList(from, to) {
      var _this2 = this;

      if (this.isScrolling) {
        return;
      }

      // if( this.lastMoveListInfo.lists === this.props.lists
      //   && this.lastMoveListInfo.fromListId === from.listId
      //   && this.lastMoveListInfo.toListId === to.listId
      // ){
      //   console.log('same move, ignore ');
      //   return;
      // }
      // this.lastMoveListInfo = {
      //   lists: this.props.lists,
      //   fromListId: from.listId,
      //   toListId: to.listId,
      // };
      // console.log('do move. from:', from, 'to:',to);

      // const newLists = updateLists(this.state.lists, {from, to});
      this.scheduleUpdate(function (prevState) {
        return { lists: (0, _updateLists.updateLists)(prevState.lists, { from: from, to: to }) };
      }, function () {
        var lists = _this2.state.lists;

        _this2.props.onMoveList({
          listId: from.listId,
          listIndex: (0, _updateLists.findListIndex)(lists, from.listId),
          lists: lists
        });
      });
    }
  }, {
    key: 'onMoveRow',
    value: function onMoveRow(from, to) {
      var _this3 = this;

      // console.log('onMoveRow(). from = ', from, ', to = ', to);
      var moveInfo = { from: from, to: to };
      if ((0, _isEqualWith2.default)(moveInfo, this.lastMoveInfo)) {
        return;
      }
      this.scheduleUpdate(function (prevState) {
        return { lists: (0, _updateLists.updateLists)(prevState.lists, moveInfo) };
      }, function () {
        var lists = _this3.state.lists;

        _this3.props.onMoveRow({
          itemId: from.itemId,
          listId: (0, _updateLists.findItemListId)(lists, from.itemId),
          itemIndex: (0, _updateLists.findItemIndex)(lists, from.itemId),
          listIndex: (0, _updateLists.findItemListIndex)(lists, from.itemId),
          lists: lists
        });
      });

      this.lastMoveInfo = { from: from, to: to };
    }
  }, {
    key: 'onDropList',
    value: function onDropList(_ref4) {
      var listId = _ref4.listId;

      this.props.onDropList(this.listEndData({ listId: listId }));
    }
  }, {
    key: 'onDropRow',
    value: function onDropRow(_ref5) {
      var itemId = _ref5.itemId;

      this.props.onDropRow(this.itemEndData({ itemId: itemId }));
    }
  }, {
    key: 'onDragBeginRow',
    value: function onDragBeginRow(data) {
      this.props.onDragBeginRow(data);
    }
  }, {
    key: 'onDragEndRow',
    value: function onDragEndRow(_ref6) {
      var itemId = _ref6.itemId;

      this.props.onDragEndRow(this.itemEndData({ itemId: itemId }));
    }
  }, {
    key: 'onDragBeginList',
    value: function onDragBeginList(data) {
      this.isDraggingList = true;
      this.props.onDragBeginList(data);
      // 这里回调 onDragBeginList 后，上层组件一定会重新设置 props，所以不用再把 tempState 设置回去了。
      // 如果上层组件不理会这个回掉，则状态会一直维持当前状态，效果也不差。
      // if( !this.tempState ){
      //   this.setState(this.tempState);
      //   this.tempState = null;
      // }
    }
  }, {
    key: 'onDragEndList',
    value: function onDragEndList(_ref7) {
      var listId = _ref7.listId;

      this.isDraggingList = false;
      this.props.onDragEndList(this.listEndData({ listId: listId }));
    }

    // prevScrollLeft = 0;
    // hasScrollChanged = false;
    // onScrollChange(scrollLeft){
    // if( scrollLeft !== this.prevScrollLeft){
    //   console.log('set isScrolling true');
    //   this.isScrolling = true;
    //   this.hasScrollChanged = true;
    //   this.prevScrollLeft = scrollLeft;
    //   this.startScrollCheckTimer();
    // }
    // }


  }, {
    key: 'renderList',
    value: function renderList(_ref8) {
      var columnIndex = _ref8.columnIndex,
          key = _ref8.key,
          style = _ref8.style;

      var list = this.state.lists[columnIndex];

      return _react2.default.createElement(_SortableList2.default, {
        key: list.id,
        index: columnIndex,
        listId: list.id,
        listStyle: style,
        listRenderer: this.props.listRenderer,
        itemRenderer: this.props.itemRenderer,
        list: list,
        moveRow: this.onMoveRow,
        moveList: this.onMoveList,
        dropRow: this.onDropRow,
        dropList: this.onDropList,
        dragEndRow: this.onDragEndRow,
        dragBeginRow: this.onDragBeginRow,
        dragEndList: this.onDragEndList,
        dragBeginList: this.onDragBeginList,
        overscanRowCount: this.props.overscanRowCount,
        itemCacheKey: this.props.itemCacheKey,
        findItemIndex: this.findItemIndex,
        findListIndex: this.findListIndex,
        defaultCardHeight: this.props.defaultCardHeight,
        canDropRow: this.props.canDropRow,
        canDropList: this.props.canDropList
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var _this4 = this;

      var lists = this.state.lists;
      var _props = this.props,
          width = _props.width,
          height = _props.height,
          listWidth = _props.listWidth,
          itemPreviewRenderer = _props.itemPreviewRenderer,
          listPreviewRenderer = _props.listPreviewRenderer,
          overscanListCount = _props.overscanListCount,
          scrollToList = _props.scrollToList,
          scrollToAlignment = _props.scrollToAlignment;


      return _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(GridWithScrollZone, {
          lists: lists,
          className: 'KanbanGrid'
          // Needed for fixing disappearing items when scrolling
          , containerStyle: { pointerEvents: 'auto' },
          ref: function ref(c) {
            return _this4._grid = c;
          },
          width: width,
          height: height,
          columnWidth: listWidth,
          rowHeight: height - (0, _scrollbarSize2.default)(),
          columnCount: lists.length,
          rowCount: 1,
          cellRenderer: this.renderList,
          overscanColumnCount: overscanListCount,
          horizontalStrength: this.horizontalStrength,
          strengthMultiplier: 5
          // verticalStrength={this.verticalStrength}
          , scrollToColumn: scrollToList,
          scrollToAlignment: scrollToAlignment,
          speed: 100
          // onScrollChange={this.onScrollChange}
        }),
        _react2.default.createElement(_DragLayer2.default, {
          itemPreviewRenderer: itemPreviewRenderer,
          listPreviewRenderer: listPreviewRenderer
        })
      );
    }
  }]);
  return Kanban;
}(_PureComponent3.default);

Kanban.defaultProps = {
  lists: [],
  itemRenderer: decorators.itemDefaultRenderer,
  listRenderer: decorators.listDefaultRenderer,
  itemPreviewRenderer: decorators.itemPreviewDefaultRenderer,
  listPreviewRenderer: decorators.listPreviewDefaultRenderer,
  onMoveRow: function onMoveRow() {},
  onMoveList: function onMoveList() {},
  onDropRow: function onDropRow() {},
  onDropList: function onDropList() {},
  onDragBeginList: function onDragBeginList() {},
  onDragEndList: function onDragEndList() {},
  onDragBeginRow: function onDragBeginRow() {},
  onDragEndRow: function onDragEndRow() {},
  canDropRow: function canDropRow() {
    return true;
  },
  canDropList: function canDropList() {
    return true;
  },
  overscanListCount: 2,
  overscanRowCount: 2,
  itemCacheKey: function itemCacheKey(_ref9) {
    var id = _ref9.id;
    return '' + id;
  }
};
exports.default = (0, _reactDnd.DragDropContext)(_reactDndHtml5Backend2.default)(Kanban);