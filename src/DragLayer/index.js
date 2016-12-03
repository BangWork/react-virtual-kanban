import React, { Component, PropTypes } from 'react';
import { DragLayer } from 'react-dnd';

import * as ItemTypes from '../types';

import './styles/index.css';

function getStyles({ currentOffset }) {
  if (!currentOffset) {
    return {
      display: 'none'
    };
  }

  const { x, y } = currentOffset;
  const transform = `translate(${x}px, ${y}px)`;

  return {
    transform,
  };
}

class KanbanDragLayer extends Component {
  static propTypes = {
    item: PropTypes.object,
    itemType: PropTypes.string,
    currentOffset: PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired
    }),
    isDragging: PropTypes.bool.isRequired,
  }

  constructor(props) {
    super(props);

    this.renderItem = this.renderItem.bind(this);
  }

  renderItem(type, item) {
    let Preview;

    switch (type) {
    case ItemTypes.ROW_TYPE:
      Preview = this.props.itemPreviewComponent;

      return <Preview />;
    case ItemTypes.LIST_TYPE:
      Preview = this.props.listPreviewComponent;

      return <Preview />;
    default:
      return null;
    }
  }

  render() {
    const { item, itemType, isDragging } = this.props;

    if (!isDragging) {
      return null;
    }

    return (
      <div className='KanbanDragLayer'>
        <div style={getStyles(this.props)}>
          {this.renderItem(itemType, item)}
        </div>
      </div>
    );
  }
}

function collect(monitor) {
  return {
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging()
  };
}

export default DragLayer(collect)(KanbanDragLayer);
