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
  const { listId: hoverListId } = props;

  if (dragListId === hoverListId) {
    return;
  }

  if (itemType === LIST_TYPE) {
      // Sometimes component may be null when it's been unmounted
    if (!component) {
      console.warn(`null component for #${dragListId}`);
      return;
    }

    props.moveList({listId: dragListId}, {listId: hoverListId});
    return;
  }

  if (itemType === ROW_TYPE) {
    const dragItemId = item.rowId;

    item.containerWidth = calculateContainerWidth(component) || item.containerWidth;

    props.moveRow(
      {itemId: dragItemId},
      {listId: hoverListId}
    );
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
    return item.listId !== props.listId 
      && props.canDropRow({
        source: item,
        target: {
          listId: props.listId,
          list: props.list,
        },
      });
  }
}

export function drop(props, monitor) {
  if (!monitor.isOver({shallow: true})) return;

  const { listId } = props;

  props.dropList({listId});
}
