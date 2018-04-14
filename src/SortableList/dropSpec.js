import { findDOMNode } from 'react-dom';
import { width, querySelectorAll } from 'dom-helpers/query';

import { LIST_TYPE, ROW_TYPE } from '../types';

function calculateContainerWidth(component) {
  const innerScrollContainer = querySelectorAll(
    findDOMNode(component),
    '.ReactVirtualized__Grid__innerScrollContainer'
  )[0];

  if (!innerScrollContainer) return 0;

  return width(innerScrollContainer);
}

export function hover(props, monitor, component) {
  if (!monitor.isOver({shallow: true})) return;
  if (!monitor.canDrop()) return;

  const item = monitor.getItem();
  const itemType = monitor.getItemType();
  const { listId: dragListId } = item;
  const { listId: hoverListId, findListIndex } = props;

  if (dragListId === hoverListId) {
    return;
  }

  if (itemType === LIST_TYPE) {
      // Sometimes component may be null when it's been unmounted
    if (!component) {
      console.warn(`null component for #${dragListId}`);
      return;
    }

    const dragListIndex = findListIndex(dragListId);
    const hoverListIndex = findListIndex(hoverListId);

    // In order to avoid swap flickering when dragging element is smaller than
    // dropping one, we check whether dropping middle has been reached or not.

    // Determine rectangle on screen
    const node = findDOMNode(component);
    const hoverBoundingRect = node.getBoundingClientRect();

      // Get vertical middle
    const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) / 2;

    // Determine mouse position
    const clientOffset = monitor.getClientOffset();

    // Get pixels to the top
    const hoverClientX = clientOffset.x - hoverBoundingRect.left;

    // Dragging downwards
    if (dragListIndex < hoverListIndex && hoverClientX < hoverMiddleX) {
      return;
    }

    // Dragging upwards
    if (dragListIndex > hoverListIndex && hoverClientX > hoverMiddleX) {
      return;
    }

    props.moveList({listId: dragListId}, {listId: hoverListId});
    return;
  }

  if (itemType === ROW_TYPE) {
    // const dragItemId = item.rowId;

    // item.containerWidth = calculateContainerWidth(component) || item.containerWidth;

    // props.moveRow(
    //   {itemId: dragItemId},
    //   {listId: hoverListId}
    // );
    return;
  }
}

export function canDrop(props, monitor) {
  const item = monitor.getItem();
  const itemType = monitor.getItemType();

  if (itemType === LIST_TYPE) {
    return props.canDropList({
      source: item,
      target: {
        listId: props.listId,
        list: props.list,
      }
    });
  }

  if (itemType === ROW_TYPE) {
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

export function drop(props, monitor) {
  if (!monitor.isOver({shallow: true})) return;

  const { listId } = props;

  props.dropList({listId});
}
