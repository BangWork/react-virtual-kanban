import { findDOMNode } from 'react-dom';
import { width } from 'dom-helpers/query';

export function hover(props, monitor, component) {
  const item = monitor.getItem();
  if (!monitor.canDrop()) return;

  const { rowId: dragItemId } = item;
  const { rowId: hoverItemId, findItemIndex } = props;

  // Hovering over the same item
  if (dragItemId === hoverItemId) {
    return;
  }

  // Sometimes component may be null when it's been unmounted
  if (!component) {
    console.warn(`null component for #${dragItemId}`);
    return;
  }

  const dragItemIndex = findItemIndex(dragItemId);
  const hoverItemIndex = findItemIndex(hoverItemId);

  // In order to avoid swap flickering when dragging element is smaller than
  // dropping one, we check whether dropping middle has been reached or not.

  // Determine rectangle on screen
  const node = findDOMNode(component);
  const hoverBoundingRect = node.getBoundingClientRect();

    // Get vertical middle
  const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

  // Determine mouse position
  const clientOffset = monitor.getClientOffset();

  // Get pixels to the top
  const hoverClientY = clientOffset.y - hoverBoundingRect.top;

  // Dragging downwards
  if (dragItemIndex < hoverItemIndex && hoverClientY < hoverMiddleY) {
    return;
  }

  // Dragging upwards
  if (dragItemIndex > hoverItemIndex && hoverClientY > hoverMiddleY) {
    return;
  }

  item.containerWidth = width(node);

  props.moveRow(
    {itemId: dragItemId},
    {itemId: hoverItemId}
  );
}

export function canDrop(props, monitor) {
  const item = monitor.getItem();

  const ret = props.canDropRow({
    source: item,
    target: {
      listId: props.listId,
      list: props.list,
    },
  });
  // console.log('SortableItem:canDrop:', ret );
  return ret;
}

export function drop(props) {
  const { rowId: itemId } = props;

  props.dropRow({itemId});
}
