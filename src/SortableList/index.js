import React from 'react';
import { List, CellMeasurer, CellMeasurerCache, AutoSizer } from 'react-virtualized';
import { DragSource, DropTarget } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';

// import { ItemCache } from './itemCache';
import SortableItem from '../SortableItem';

import { LIST_TYPE, ROW_TYPE } from '../types';
import * as dragSpec from './dragSpec';
import * as dropSpec from './dropSpec';
import * as propTypes from './propTypes';

import PureComponent from '../PureComponent';

// const identity = (c) => c;
function callWithListInfo(func,params, props){
  return func({
    ...params,
    listId: props.listId,
    list: props.list,
  })
}

class SortableList extends PureComponent {
  static propTypes = propTypes;
  static defaultProps = {
    defaultCardHeight: 60,
  }

  constructor(props) {
    super(props);

    this.renderRow = this.renderRow.bind(this);
    this.renderList = this.renderList.bind(this);

    this.measureCache = new CellMeasurerCache({
      defaultHeight: props.defaultCardHeight,
      fixedWidth: true,
      keyMapper: this.keyMapper,
    });  
  }
  
  componentWillReceiveProps(nextProps) {
    // todo if defaultCardHeight change, recreate cache.
  }

  componentDidUpdate(prevProps) {
    if (prevProps.list.rows !== this.props.list.rows && !!this._list) {
      this._list.recomputeRowHeights();
    }
  }

  keyMapper = (rowIndex) => {
    const row = this.props.list.rows[rowIndex]; 
    return this.props.itemCacheKey(row);
  }

  onDragBeginRow=(params) => {
    return callWithListInfo(this.props.dragBeginRow, params, this.props);
  }

  onDragEndRow=(params) => {
    return callWithListInfo(this.props.dragEndRow, params, this.props);
  }

  onDropRow=(params)=>{
    return callWithListInfo(this.props.dropRow, params, this.props);
  }

  renderRow({ index, key, style, parent }) {
    const row = this.props.list.rows[index];

    return (<CellMeasurer
      cache={this.measureCache}
      columnIndex={0}
      rowIndex={index}
      key={row.id}
      parent={parent}
    >
      {({measure}) => ( <SortableItem
        key={row.id}
        row={row}
        rowId={row.id}
        listId={this.props.listId}
        rowStyle={style}
        itemRenderer={this.props.itemRenderer}
        moveRow={this.props.moveRow}
        dropRow={this.onDropRow}
        dragBeginRow={this.onDragBeginRow}
        dragEndRow={this.onDragEndRow}
        findItemIndex={this.props.findItemIndex}
        measure={measure}
      />)}
    </CellMeasurer>);
  }

  // renderItemForMeasure({ rowIndex }) {
  //   const { itemRenderer } = this.props;
  //   const row = this.props.list.rows[rowIndex];

  //   const itemProps = {
  //     row, rowId: row.id, 
  //     listId: this.props.listId, 
  //     rowStyle: {},
  //     isDragging: false, 
  //     connectDropTarget: identity, 
  //     connectDragSource: identity,
  //   };
  //   return itemRenderer(itemProps);
  // }

  renderList({ width, height }) {
    // TODO: Check whether scrollbar is visible or not :/

    return <List
      ref={(c) => (this._list = c)}
      className='KanbanList'
      width={width}
      height={height}
      deferredMeasurementCache={this.measureCache}
      rowHeight={this.measureCache.rowHeight}
      rowCount={this.props.list.rows.length}
      rowRenderer={this.renderRow}
      overscanRowCount={this.props.overscanRowCount}
    />
  }

  render() {
    const {
      list,
      listId,
      listRenderer,
      isDragging,
      isDraggingOver,
      canDrop,
      connectDragSource,
      connectDropTarget,
      connectDragPreview,
      listStyle,
    } = this.props;

    const children = (<AutoSizer>
      {(dimensions) => this.renderList(dimensions)}
    </AutoSizer>);
    const listProps = {
      list, listId, listStyle, 
      connectDragSource, connectDropTarget, connectDragPreview,
      isDragging,
      isDraggingOver,
      canDrop,
      children,
    };
    return listRenderer(listProps);
  }
}

const connectDrop = DropTarget([LIST_TYPE, ROW_TYPE], dropSpec, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  canDrop: monitor.canDrop(),
  isDraggingOver: monitor.isOver(/*{ shallow: true }*/),
}))

const connectDrag = DragSource(LIST_TYPE, dragSpec, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  connectDragPreview: connect.dragPreview(),
  isDragging: monitor.isDragging(),
}))

export default connectDrop(connectDrag(SortableList));
