import React from 'react';
import { DragSource, DropTarget } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';

import { ROW_TYPE } from '../types';
import * as dragSpec from './dragSpec';
import * as dropSpec from './dropSpec';
import * as propTypes from './propTypes';

class SortableItem extends React.PureComponent {
  static propTypes = propTypes;

  render() {
    const {
      row,
      rowId,
      listId,
      itemRenderer,
      isDragging,
      connectDragSource,
      connectDropTarget,
      connectDragPreview,
      rowStyle,
      measure,
    } = this.props;

    const itemProps = {
      row, rowId, listId, rowStyle, isDragging, 
      connectDropTarget, connectDragSource, connectDragPreview,
      measure, 
    };

    return itemRenderer(itemProps);
  }
}

const connectDrop = DropTarget(ROW_TYPE, dropSpec, connect => ({
  connectDropTarget: connect.dropTarget()
}))


const connectDrag = DragSource(ROW_TYPE, dragSpec, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  connectDragPreview: connect.dragPreview(),
  isDragging: monitor.isDragging(),
}))

export default connectDrop(connectDrag(SortableItem));
