import React from 'react';
import { DragSource, DropTarget } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';

import { ROW_TYPE } from '../types';
import * as dragSpec from './dragSpec';
import * as dropSpec from './dropSpec';
import * as propTypes from './propTypes';

class SortableItem extends React.PureComponent {
  static propTypes = propTypes;

  componentDidMount() {
    this.props.connectDragPreview(getEmptyImage(), {
      captureDraggingState: true
    });
  }

  render() {
    const {
      row,
      rowId,
      listId,
      fromListId,
      itemRenderer,
      isDragging,
      connectDragSource,
      connectDropTarget,
      connectDragPreview,
      rowStyle,
      measure,
      captureHeight,
      index,
    } = this.props;

    const itemProps = {
      row, rowId, fromListId, listId, rowStyle, isDragging, 
      connectDropTarget, connectDragSource, connectDragPreview,
      measure, captureHeight, index,
    };

    return itemRenderer(itemProps);
  }
}

const connectDrop = DropTarget(ROW_TYPE, dropSpec, connect => ({
  connectDropTarget: connect.dropTarget()
}))


const connectDrag = DragSource(ROW_TYPE, dragSpec, (connect, monitor) => {
  const item = monitor.getItem();
  return {
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging(),
    captureHeight: item && item.containerHeight,
  }
})

export default connectDrop(connectDrag(SortableItem));
