import update from 'react-addons-update';
import memoize from 'memoizee';

function rotateRight(range, offset) {
  const length = range.length;

  return range.map((_, index, list) => list[(index + offset) % length]);
}

function rotateLeft(range, offset) {
  return rotateRight(range, range.length - Math.abs(offset % range.length));
}

function buildUpdateOperation(list, { from, to }) {
  const lower = Math.min(from, to);
  const upper = Math.max(from, to);
  const range = list.slice(lower, upper + 1);
  const rotated = to - from > 0 ? rotateRight(range, 1) : rotateLeft(range, 1);

  return [lower, rotated.length, ...rotated];
}

export const findListIndex = memoize(function findListIndex(lists, listId) {
  // console.log(`findListIndex(). listId = ${listId}`);
  return lists.findIndex(({ id }) => id === listId);
}, { max: 2 });

export const findItemIndex = memoize(function findItemIndex(lists, itemId) {
  let index = -1;

  // console.log(`findItemIndex(). itemId = ${itemId}`);
  lists.forEach(({ rows }) => {
    if (index !== -1) return;
    index = rows.findIndex(({ id }) => id === itemId);
  });

  return index;
}, { max: 2 });

export const findItemListIndex = memoize(function findItemListIndex(lists, itemId) {
  let index = -1;
  // console.log(`findItemListIndex(). itemId = ${itemId}`);
  lists.forEach(({ rows }, i) => {
    if (index !== -1) return;

    if (rows.some(({ id }) => id === itemId)) {
      index = i;
    }
  });

  return index;
}, { max: 2});

export const findItemListId = memoize(function findItemListId(lists, itemId) {
  // console.log(`findItemListId(). itemId = ${itemId}`);
  const list = lists.find(({ rows }) => {
    return rows.some(({ id }) => id === itemId);
  });

  return list && list.id;
}, { max: 2 });

function moveLists(lists, { fromId, toId }) {
  const fromIndex = findListIndex(lists, fromId);
  const toIndex = findListIndex(lists, toId);

  // Sanity checks
  if (fromIndex === -1 || toIndex === -1) {
    console.warn(`List not in bounds`);
    return lists;
  }

  const fromList = lists[fromIndex];

  if (!fromList) {
    console.warn(`List is not an object`);
    return lists;
  }

  return update(lists, {
    $splice: [
      [fromIndex, 1],
      [toIndex, 0, fromList],
    ]
  });
}

function moveItems(lists, { fromId, toId }) {
  const fromListIndex = findItemListIndex(lists, fromId);
  const toListIndex = findItemListIndex(lists, toId);
  const fromIndex = findItemIndex(lists, fromId);
  const toIndex = findItemIndex(lists, toId);

  // Sanity checks
  if (fromListIndex === -1) {
    console.warn(`List not in bounds`);
    return lists;
  }

  if (fromIndex === -1 || toIndex === -1) {
    console.warn(`Item not in bounds`);
    return lists;
  }

  const fromList = lists[fromListIndex];
  const fromItem = fromList.rows[fromIndex];

  // Remove item from source list
  const removeUpdateItem = {
    [fromListIndex]: {
      rows: {
        $splice: [
          [fromIndex, 1],
        ]
      }
    },
  };

  // Add item to target list
  const pushUpdateItem = {
    [toListIndex]: {
      rows: {
        $splice: [
          [toIndex, 0, fromItem]
        ]
      }
    },
  }

  // console.log('moveItems. lists: ', lists, 'fromId: ', fromId, 'toId: ', toId);
  let ret = lists;
  if( fromListIndex === toListIndex ){
    if(fromIndex !== toIndex ){
      ret = update(ret, removeUpdateItem);
      ret = update(ret, pushUpdateItem);
    }
  }else{
    const updateItem = {...removeUpdateItem, ...pushUpdateItem };
    // console.log('moveItems: updateItem: ', updateItem );
    ret = update(ret, updateItem);
  }

  // console.log('ret: ', ret);
  return ret;
}

function moveItemToList(lists, { fromId, toId }) {
  const fromIndex = findItemIndex(lists, fromId);
  const fromListIndex = findItemListIndex(lists, fromId);
  const toListIndex = findListIndex(lists, toId);

  let ret = lists;
  if (fromIndex === -1) {
    console.warn(`Item not in bounds`);
    return ret;
  }


  const fromList = lists[fromListIndex];
  const toList = lists[toListIndex];

  if (!toList) {
    console.warn(`List is not an object`);
    return ret;
  }


  // Only move when list is empty
  // if (toList.rows.length > 0) {
    // return lists;
  // }

  const fromItem = fromList.rows[fromIndex];

  // console.log('moveItemToList. lists: ', lists, 'fromId: ', fromId, 'toId: ', toId);

  // Remove item from source list
  const removeUpdateItem = {
    [fromListIndex]: {
      rows: {
        $splice: [
          [fromIndex, 1],
        ]
      }
    }
  };
  // Add item to target list
  const pushUpdateItem = {
    [toListIndex]: {
      rows: {
        $push: [
          fromItem
        ]
      }
    },
  };

  if( fromListIndex === toListIndex ){
    if(fromIndex !== fromList.rows.length -1){
      ret = update(ret, removeUpdateItem);
      ret = update(ret, pushUpdateItem);
    }
  }else{
    const updateItem = { ...removeUpdateItem, ...pushUpdateItem};
    ret = update(ret, updateItem);
  }

  // console.log('ret: ', ret);
  return ret;
}

export function updateLists(lists, params) {
  console.log('updateLists():params: ' + params);
  const { from, to } = params;
  const { itemId: fromItemId, listId: fromListId } = from;
  const { itemId: toItemId, listId: toListId } = to;

  // Deprecation checks
  if (from.listIndex || from.rowIndex || to.listIndex || to.rowIndex) {
    console.warn(`Deprecated listIndex and rowIndex param. Use listId or itemId`);
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
