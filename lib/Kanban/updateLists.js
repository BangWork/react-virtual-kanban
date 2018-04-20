'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findItemListId = exports.findItemListIndex = exports.findItemIndex = exports.findListIndex = undefined;

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

exports.updateLists = updateLists;

var _reactAddonsUpdate = require('react-addons-update');

var _reactAddonsUpdate2 = _interopRequireDefault(_reactAddonsUpdate);

var _memoizee = require('memoizee');

var _memoizee2 = _interopRequireDefault(_memoizee);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function rotateRight(range, offset) {
  var length = range.length;

  return range.map(function (_, index, list) {
    return list[(index + offset) % length];
  });
}

function rotateLeft(range, offset) {
  return rotateRight(range, range.length - Math.abs(offset % range.length));
}

function buildUpdateOperation(list, _ref) {
  var from = _ref.from,
      to = _ref.to;

  var lower = Math.min(from, to);
  var upper = Math.max(from, to);
  var range = list.slice(lower, upper + 1);
  var rotated = to - from > 0 ? rotateRight(range, 1) : rotateLeft(range, 1);

  return [lower, rotated.length].concat((0, _toConsumableArray3.default)(rotated));
}

var findListIndex = exports.findListIndex = (0, _memoizee2.default)(function findListIndex(lists, listId) {
  // console.log(`findListIndex(). listId = ${listId}`);
  return lists.findIndex(function (_ref2) {
    var id = _ref2.id;
    return id === listId;
  });
}, { max: 2 });

var findItemIndex = exports.findItemIndex = (0, _memoizee2.default)(function findItemIndex(lists, itemId) {
  var index = -1;

  // console.log(`findItemIndex(). itemId = ${itemId}`);
  lists.forEach(function (_ref3) {
    var rows = _ref3.rows;

    if (index !== -1) return;
    index = rows.findIndex(function (_ref4) {
      var id = _ref4.id;
      return id === itemId;
    });
  });

  return index;
}, { max: 2 });

var findItemListIndex = exports.findItemListIndex = (0, _memoizee2.default)(function findItemListIndex(lists, itemId) {
  var index = -1;
  // console.log(`findItemListIndex(). itemId = ${itemId}`);
  lists.forEach(function (_ref5, i) {
    var rows = _ref5.rows;

    if (index !== -1) return;

    if (rows.some(function (_ref6) {
      var id = _ref6.id;
      return id === itemId;
    })) {
      index = i;
    }
  });

  return index;
}, { max: 2 });

var findItemListId = exports.findItemListId = (0, _memoizee2.default)(function findItemListId(lists, itemId) {
  // console.log(`findItemListId(). itemId = ${itemId}`);
  var list = lists.find(function (_ref7) {
    var rows = _ref7.rows;

    return rows.some(function (_ref8) {
      var id = _ref8.id;
      return id === itemId;
    });
  });

  return list && list.id;
}, { max: 2 });

function moveLists(lists, _ref9) {
  var fromId = _ref9.fromId,
      toId = _ref9.toId;

  var fromIndex = findListIndex(lists, fromId);
  var toIndex = findListIndex(lists, toId);

  // Sanity checks
  if (fromIndex === -1 || toIndex === -1) {
    return lists;
  }

  var fromList = lists[fromIndex];

  if (!fromList) {
    return lists;
  }

  return (0, _reactAddonsUpdate2.default)(lists, {
    $splice: [[fromIndex, 1], [toIndex, 0, fromList]]
  });
}

function moveItems(lists, _ref10) {
  var fromId = _ref10.fromId,
      toId = _ref10.toId;

  var fromListIndex = findItemListIndex(lists, fromId);
  var toListIndex = findItemListIndex(lists, toId);
  var fromIndex = findItemIndex(lists, fromId);
  var toIndex = findItemIndex(lists, toId);

  // Sanity checks
  if (fromListIndex === -1) {
    return lists;
  }

  if (fromIndex === -1 || toIndex === -1) {
    return lists;
  }

  var fromList = lists[fromListIndex];
  var fromItem = fromList.rows[fromIndex];

  // Remove item from source list
  var removeUpdateItem = (0, _defineProperty3.default)({}, fromListIndex, {
    rows: {
      $splice: [[fromIndex, 1]]
    }
  });

  // Add item to target list
  var pushUpdateItem = (0, _defineProperty3.default)({}, toListIndex, {
    rows: {
      $splice: [[toIndex, 0, fromItem]]
    }
  });

  // console.log('moveItems. lists: ', lists, 'fromId: ', fromId, 'toId: ', toId);
  var ret = lists;
  if (fromListIndex === toListIndex) {
    if (fromIndex !== toIndex) {
      ret = (0, _reactAddonsUpdate2.default)(ret, removeUpdateItem);
      ret = (0, _reactAddonsUpdate2.default)(ret, pushUpdateItem);
    }
  } else {
    var updateItem = (0, _extends3.default)({}, removeUpdateItem, pushUpdateItem);
    // console.log('moveItems: updateItem: ', updateItem );
    ret = (0, _reactAddonsUpdate2.default)(ret, updateItem);
  }

  // console.log('ret: ', ret);
  return ret;
}

function moveItemToList(lists, _ref11) {
  var fromId = _ref11.fromId,
      toId = _ref11.toId;

  var fromIndex = findItemIndex(lists, fromId);
  var fromListIndex = findItemListIndex(lists, fromId);
  var toListIndex = findListIndex(lists, toId);

  var ret = lists;
  if (fromIndex === -1) {
    return ret;
  }

  var fromList = lists[fromListIndex];
  var toList = lists[toListIndex];

  if (!toList) {
    return ret;
  }

  // Only move when list is empty
  // if (toList.rows.length > 0) {
  // return lists;
  // }

  var fromItem = fromList.rows[fromIndex];

  // console.log('moveItemToList. lists: ', lists, 'fromId: ', fromId, 'toId: ', toId);

  // Remove item from source list
  var removeUpdateItem = (0, _defineProperty3.default)({}, fromListIndex, {
    rows: {
      $splice: [[fromIndex, 1]]
    }
  });
  // Add item to target list
  var pushUpdateItem = (0, _defineProperty3.default)({}, toListIndex, {
    rows: {
      $push: [fromItem]
    }
  });

  if (fromListIndex === toListIndex) {
    if (fromIndex !== fromList.rows.length - 1) {
      ret = (0, _reactAddonsUpdate2.default)(ret, removeUpdateItem);
      ret = (0, _reactAddonsUpdate2.default)(ret, pushUpdateItem);
    }
  } else {
    var updateItem = (0, _extends3.default)({}, removeUpdateItem, pushUpdateItem);
    ret = (0, _reactAddonsUpdate2.default)(ret, updateItem);
  }

  // console.log('ret: ', ret);
  return ret;
}

function updateLists(lists, params) {
  var from = params.from,
      to = params.to;
  var fromItemId = from.itemId,
      fromListId = from.listId;
  var toItemId = to.itemId,
      toListId = to.listId;

  // Deprecation checks

  if (from.listIndex || from.rowIndex || to.listIndex || to.rowIndex) {
    return lists;
  }

  // Move lists
  if (fromListId !== toListId && fromItemId === void 0 && toItemId === void 0) {
    return moveLists(lists, { fromId: fromListId, toId: toListId });
  }

  // Move item inside same list
  if (fromListId === toListId && fromItemId !== void 0 && toItemId !== void 0) {
    return moveItems(lists, { fromId: fromItemId, toId: toItemId });
  }

  // Move item to a different list
  if (fromListId === void 0 && toListId !== void 0 && fromItemId !== void 0 && toItemId === void 0) {
    return moveItemToList(lists, { fromId: fromItemId, toId: toListId });
  }

  return lists;
}