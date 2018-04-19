import React from 'react';
import { List, CellMeasurer, CellMeasurerCache, AutoSizer } from 'react-virtualized';
import { DragSource, DropTarget } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import withScrolling, { createVerticalStrength } from 'react-dnd-scrollzone';
import memoize from 'memoizee';

// import { ItemCache } from './itemCache';
import SortableItem from '../SortableItem';

import { LIST_TYPE, ROW_TYPE } from '../types';
import * as dragSpec from './dragSpec';
import * as dropSpec from './dropSpec';
import * as propTypes from './propTypes';

import PureComponent from '../PureComponent';
const AutoScrollList = withScrolling(List);


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
    canDropRow: () => true,
  }

  constructor(props) {
    super(props);

    this.renderRow = this.renderRow.bind(this);
    // this.renderList = this.renderList.bind(this);

    this.verticalStrength = createVerticalStrength(props.defaultCardHeight);
    this.measureCache = new CellMeasurerCache({
      defaultHeight: props.defaultCardHeight,
      fixedWidth: true,
      keyMapper: this.keyMapper,
    });  

    const _this = this;
    this.renderList = memoize((rowCount, overscanRowCount ) => {
      // TODO: Check whether scrollbar is visible or not :/
      const listProps = {
        ref: _this.onListRef,
        className:'KanbanList',
        deferredMeasurementCache: _this.measureCache,
        rowHeight: _this.measureCache.rowHeight,
        rowRenderer: _this.renderRow,
        verticalStrength: _this.verticalStrength,
        rowCount, overscanRowCount, 
      }
  
      return <AutoSizer>
        { 
          ({width, height}) => {
            // console.log('SortabeList:(id=' + _this.props.listId  + ')renderList:', width, height, rowCount, scrollToIndex );
            return <AutoScrollList 
              {...listProps}
              width={width}
              height={height}
            />;
          }
        }
      </AutoSizer>
    }, { max: 1 });
  }
  
  componentDidMount() {
    this.props.connectDragPreview(getEmptyImage(), {
      captureDraggingState: true
    });
  }

  componentWillReceiveProps(nextProps) {
    // todo if defaultCardHeight change, recreate cache.
    // if( nextProps.index !== this.props.index ){
    //   if( !!this._list){
    //     this._list.wrappedInstance.scrollToPosition(0);
    //   }
    // }
  }

  componentDidUpdate(prevProps) {
    if( !!this._list){
      if (prevProps.list.rows !== this.props.list.rows) {
        this._list.wrappedInstance.recomputeRowHeights();
      }
      if( prevProps.index !== this.props.index ){
        // fixme: 实在没有办法，出此下策。
        setTimeout(() => {
          if(this._list){
            this._list.wrappedInstance.scrollToPosition(0);
          }
        }, 1000 );
      }
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

  onListRef = (ref) => {
    this._list = ref;
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
        index={index}
        row={row}
        rowId={row.id}
        listId={this.props.listId}
        list={this.props.list}
        rowStyle={style}
        itemRenderer={this.props.itemRenderer}
        moveRow={this.props.moveRow}
        dropRow={this.onDropRow}
        dragBeginRow={this.onDragBeginRow}
        dragEndRow={this.onDragEndRow}
        findItemIndex={this.props.findItemIndex}
        canDropRow={this.props.canDropRow}
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

  // lastListProps = {}


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
      index,
    } = this.props;

    const children = this.renderList(
      this.props.list.rows.length,
      this.props.overscanRowCount,
    );
    const listProps = {
      list, listId, listStyle, index,
      connectDragSource, connectDropTarget, connectDragPreview,
      isDragging, isDraggingOver, canDrop, children,
    };
    return listRenderer(listProps);
  }
}

const connectDrop = DropTarget([LIST_TYPE, ROW_TYPE], dropSpec, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  canDrop: monitor.canDrop(),
  isDraggingOver: monitor.isOver(/*{ shallow: true }*/),
  isDraggingListOver: monitor.isOver() && monitor.getItemType() === LIST_TYPE,
  isDraggingRowOver: monitor.isOver() && monitor.getItemType() === ROW_TYPE,
}))

const connectDrag = DragSource(LIST_TYPE, dragSpec, (connect, monitor) => {
  return {
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging(),
  }
})

export default connectDrop(connectDrag(SortableList));
