'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hover = hover;
exports.canDrop = canDrop;
exports.drop = drop;

var _reactDom = require('react-dom');

var _query = require('dom-helpers/query');

var _types = require('../types');

function calculateContainerWidth(component) {
  var innerScrollContainer = (0, _query.querySelectorAll)((0, _reactDom.findDOMNode)(component), '.ReactVirtualized__Grid__innerScrollContainer')[0];

  if (!innerScrollContainer) return 0;

  return (0, _query.width)(innerScrollContainer);
}

function hover(props, monitor, component) {
  if (!monitor.isOver({ shallow: true })) return;
  if (!monitor.canDrop()) return;

  var item = monitor.getItem();
  var itemType = monitor.getItemType();
  var dragListId = item.listId;
  var hoverListId = props.listId,
      findListIndex = props.findListIndex;


  if (dragListId === hoverListId) {
    return;
  }

  if (itemType === _types.LIST_TYPE) {
    // Sometimes component may be null when it's been unmounted
    if (!component) {
      return;
    }

    // const dragListIndex = findListIndex(dragListId);
    // const hoverListIndex = findListIndex(hoverListId);

    // // In order to avoid swap flickering when dragging element is smaller than
    // // dropping one, we check whether dropping middle has been reached or not.

    // // Determine rectangle on screen
    // const node = findDOMNode(component);
    // const hoverBoundingRect = node.getBoundingClientRect();

    //   // Get vertical middle
    // const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) / 2;

    // // Determine mouse position
    // const clientOffset = monitor.getClientOffset();

    // // Get pixels to the top
    // const hoverClientX = clientOffset.x - hoverBoundingRect.left;

    // // console.log(
    // //   'clientOffset: ',  clientOffset,  '\n', 
    // //   'hoverBoundingRect: ', hoverBoundingRect, '\n',
    // //   'dragListId: ' + dragListId + '\n'
    // //   + 'dragListIndex: ' + dragListIndex + '\n'
    // //   + 'hoverListId: ' + hoverListId + '\n'
    // //   + 'hoverListIndex: ' + hoverListIndex + '\n'
    // // );

    // // Dragging rightwards
    // if (dragListIndex < hoverListIndex && hoverClientX < hoverMiddleX) {
    //   // console.log('mouse need move left move')
    //   return;
    // }

    // // Dragging leftwards
    // if (dragListIndex > hoverListIndex && hoverClientX > hoverMiddleX) {
    //   // console.log('mouse need move left move')
    //   return;
    // }

    props.moveList({ listId: dragListId }, { listId: hoverListId });
    return;
  }

  if (itemType === _types.ROW_TYPE) {
    // const dragItemId = item.rowId;

    // item.containerWidth = calculateContainerWidth(component) || item.containerWidth;

    // props.moveRow(
    //   {itemId: dragItemId},
    //   {listId: hoverListId}
    // );
    return;
  }
}

function canDrop(props, monitor) {
  var item = monitor.getItem();
  var itemType = monitor.getItemType();

  if (itemType === _types.LIST_TYPE) {
    return props.canDropList({
      source: item,
      target: {
        listId: props.listId,
        list: props.list
      }
    });
  }

  if (itemType === _types.ROW_TYPE) {
    return false;
    // return props.canDropRow({
    //   source: item,
    //   target: {
    //     listId: props.listId,
    //     list: props.list,
    //   },
    // });
  }
}

function drop(props, monitor) {
  if (!monitor.isOver({ shallow: true })) return;

  var listId = props.listId;


  props.dropList({ listId: listId });
}