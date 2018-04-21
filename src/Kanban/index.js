import React from 'react';
import HTML5Backend from 'react-dnd-html5-backend';
import withScrolling, { createHorizontalStrength, createVerticalStrength } from 'react-dnd-scrollzone';
import { DragDropContext } from 'react-dnd';
import { Grid } from 'react-virtualized';
import scrollbarSize from 'dom-helpers/util/scrollbarSize';
import isEqualWith from 'lodash/isEqualWith';
import isEqual from 'lodash/isEqualWith';
import has from 'lodash/has';
import isFunction from 'lodash/isFunction';
import memoize from 'memoizee';

import {
  updateLists,
  findListIndex,
  findItemIndex,
  findItemListIndex,
  findItemListId,
} from './updateLists';

import * as propTypes from './propTypes';
import * as decorators from '../decorators';
import DragLayer from '../DragLayer';
import SortableList from '../SortableList';

const ZeroScrollStrength = () => 0;
const GridWithScrollZone = withScrolling(Grid);

// import { DragDropManager } from 'dnd-core';

import PureComponent from '../PureComponent';

function listIdEqualCustomer(a,b){
  if( has(a, 'id') && has(a, 'rows') && has(b, 'id') ){
    return a.id === b.id
  }
}

const ResetDelayTime = 1000;
class Kanban extends PureComponent {
  static propTypes = propTypes;

  static defaultProps = {
    lists: [],
    itemRenderer: decorators.itemDefaultRenderer,
    listRenderer: decorators.listDefaultRenderer,
    itemPreviewRenderer: decorators.itemPreviewDefaultRenderer,
    listPreviewRenderer: decorators.listPreviewDefaultRenderer,
    onMoveRow: () => {},
    onMoveList: () => {},
    onDropRow: () => {},
    onDropList: () => {},
    onDragBeginList: () => {},
    onDragEndList: () => {},
    onDragBeginRow: () => {},
    onDragEndRow: () => {},
    canDropRow: () => true,
    canDropList: () => true,
    overscanListCount: 2,
    overscanRowCount: 2,
    itemCacheKey: ({ id }) => `${id}`,
  }

  constructor(props) {
    super(props);

    this.state = {
      lists: props.lists,
    };

    this.isDraggingList = false;
    this.horizontalStrength = createHorizontalStrength(200);

    this.onMoveList = this.onMoveList.bind(this);
    this.onMoveRow = this.onMoveRow.bind(this);

    this.onDropList = this.onDropList.bind(this);
    this.onDropRow = this.onDropRow.bind(this);

    this.onDragBeginRow = this.onDragBeginRow.bind(this);
    this.onDragEndRow = this.onDragEndRow.bind(this);
    this.onDragBeginList = this.onDragBeginList.bind(this);
    this.onDragEndList = this.onDragEndList.bind(this);

    this.renderList = this.renderList.bind(this);
    this.findItemIndex = this.findItemIndex.bind(this);
    this.findListIndex = this.findListIndex.bind(this);
    this.drawFrame = this.drawFrame.bind(this);
    // this.onScrollChange = this.onScrollChange.bind(this);
  }
  
  tempState = null;
  componentWillReceiveProps(nextProps) {
    // if( this.props.lists !== nextProps.lists ){
    //   this.lastMoveRowInfo = null;
    // }
    if( this.isDraggingList ){
      let listIdsChanged = !isEqualWith(this.props.lists, nextProps.lists, listIdEqualCustomer);
      if( listIdsChanged ){
        console.warn('dont change list ids while dragging list. Unexpected consequences may happen.')
        this.tempState = { lists: nextProps.lists };
      } else {
        // 在拖拽列表过程中，允许改变列表内的卡片位置，但不改变列表之间的位置。
        const stateLists = this.state.lists;
        const propsLists = nextProps.lists;
        const newLists = [];

        // 这里对 state.lists 更新了 rows，但保持了 state.lists 中 listId 的顺序不变。
        for( let i = 0 ; i< stateLists.length ; i ++ ){
          const list = stateLists[i];
          const listId = list.id;
          // 因为 listIdsChanged == false，所以，这里的 propsList 一定存在。
          const propsList = propsLists.find( ({id}) => id === listId );
          newLists[i] = { ...list, rows: propsList.rows };
        }
        this.scheduleUpdate( () => ({ lists: newLists }));
        this.tempState = { lists: nextProps.lists };
      }
    }else{
      this.scheduleUpdate( () => ({ lists: nextProps.lists }));
    }
  }

  componentDidUpdate(_prevProps, prevState) {
    if (prevState.lists !== this.state.lists) {
      this._grid.wrappedInstance.forceUpdate();
    }
  }

  componentWillUnmount(){
    // this.endScrollCheckTimer();
    cancelAnimationFrame(this._requestedFrame);
    this.cancelAlScrollToTopActions();
  }

  scheduleUpdate(updateFn, callbackFn) {
    this._pendingUpdateFn = updateFn;
    this._pendingUpdateCallbackFn = callbackFn;

    if (!this._requestedFrame) {
      this._requestedFrame = requestAnimationFrame(this.drawFrame);
    }
  }

  drawFrame() {
    const nextState = this._pendingUpdateFn(this.state);
    const callback = this._pendingUpdateCallbackFn;

    this.setState(nextState, callback);

    this._pendingUpdateFn = null;
    this._pendingUpdateCallbackFn = null;
    this._requestedFrame = null;
  }

  itemEndData({ itemId }) {
    const lists = this.state.lists;

    return {
      itemId,
      get rowId() {
        console.log('onDropRow: `rowId` is deprecated. Use `itemId` instead');
        return itemId;
      },
      listId: findItemListId(lists, itemId),
      rowIndex: findItemIndex(lists, itemId),
      listIndex: findItemListIndex(lists, itemId),
      lists,
    }
  }

  listEndData({ listId }) {
    const lists = this.state.lists;

    return {
      listId,
      listIndex: findListIndex(lists, listId),
      lists,
    };
  }

  findItemIndex(itemId) {
    return findItemIndex(this.state.lists, itemId);
  }

  findListIndex(listId) {
    return findListIndex(this.state.lists, listId);
  }

  // scrollCheckTimerId = 0;
  // startScrollCheckTimer(){
  //   if(!this.scrollCheckTimerId){
  //     this.scrollCheckTimerId = setInterval(() => {
  //       if(!this.hasScrollChanged ){
  //         this.endScrollCheckTimer();
  //         this.isScrolling = false;
  //         console.log('set isScrolling false');
  //       }
  //       this.hasScrollChanged = false;
  //     }, 500);
  //   }
  // }
  // endScrollCheckTimer(){
  //   if(this.scrollCheckTimerId){
  //     clearInterval(this.scrollCheckTimerId);
  //     this.scrollCheckTimerId = 0;
  //   }
  // }

  // 在等待被 resetPosition 的 list
  listIdsWaitingForScrollingToTop = new Set();
  // timerId 的暂存。
  timerIdsOfWaitingActions = {};
  delayScrollToTop( listIdSet ){
    if( listIdSet.size <= 0 ) return ;

    this.cancelScrollToTopActions(listIdSet);
    for ( const id of listIdSet ){
      if(!this.listIdsWaitingForScrollingToTop.has(id)){
        const delayFunction = () => {
          let list = this.listRefs[id];
          while(list && !isFunction(list.scrollToTop)){
            list = list.decoratedComponentInstance;
          }
          if(list){
            list.scrollToTop();
          }
          this.listIdsWaitingForScrollingToTop.delete(id);
          delete this.timerIdsOfWaitingActions[id]
        };
        const timerId = setTimeout( delayFunction, ResetDelayTime );
        this.timerIdsOfWaitingActions[id] = timerId;
      }
    };
  }

  cancelAlScrollToTopActions(){
    this.cancelScrollToTopActions(new Set(this.listIdsWaitingForScrollingToTop));
  }
  
  cancelScrollToTopActions(idSet){
    for( const id of idSet){
      const timerId = this.timerIdsOfWaitingActions[id];
      if(timerId){
        clearTimeout(timerId);
      }
      delete this.timerIdsOfWaitingActions[id];
      this.listIdsWaitingForScrollingToTop.delete(id);
    }
  }

  // 上一次腿拽过程中，有哪些 list 位置变了。
  listIdsMovedInLastDragging = new Set();
  onMoveList(from, to) {
    if(this.isScrolling) {
      console.log('is isScrolling, ignore');
      return; 
    }

    // if( this.lastMoveListInfo.lists === this.props.lists
    //   && this.lastMoveListInfo.fromListId === from.listId
    //   && this.lastMoveListInfo.toListId === to.listId
    // ){
    //   console.log('same move, ignore ');
    //   return;
    // }
    // this.lastMoveListInfo = {
    //   lists: this.props.lists,
    //   fromListId: from.listId,
    //   toListId: to.listId,
    // };
    // console.log('do move. from:', from, 'to:',to);

    // const newLists = updateLists(this.state.lists, {from, to});
    this.listIdsMovedInLastDragging.add(from.listId);
    this.listIdsMovedInLastDragging.add(to.listId);
    this.scheduleUpdate(
      prevState => ({ lists: updateLists(prevState.lists, { from, to })}),
      () => {
        const lists = this.state.lists;

        this.props.onMoveList({
          listId: from.listId,
          listIndex: findListIndex(lists, from.listId),
          lists,
        });
      }
    );
  }

  isDumplicateMove(moveInfo){
    return moveInfo.lists === this.lastMoveRowInfo.lists
     && isEqual(moveInfo.from, this.lastMoveRowInfo.from )
     && isEqual(moveInfo.to, this.lastMoveRowInfo.to )
  }

  lastMoveRowInfo = {};
  onMoveRow(from, to) {
    // console.log('onMoveRow(). from = ', from, ', to = ', to);
    const lists = this.state.lists;
    const moveInfo = { lists, from , to };
    if( this.isDumplicateMove(moveInfo)){
      return;
    }
    this.scheduleUpdate(
      prevState => ({ lists: updateLists(prevState.lists, moveInfo)}),
      () => {
          const lists = this.state.lists;

          this.props.onMoveRow({
            itemId: from.itemId,
            listId: findItemListId(lists, from.itemId),
            itemIndex: findItemIndex(lists, from.itemId),
            listIndex: findItemListIndex(lists, from.itemId),
            lists: lists,
        });
      }
    );

    this.lastMoveRowInfo = moveInfo;
  }

  onDropList({ listId }) {
    this.props.onDropList(this.listEndData({ listId }));
  }

  onDropRow({ itemId }) {
    this.props.onDropRow(this.itemEndData({ itemId }));
  }

  onDragBeginRow(data) {
    this.props.onDragBeginRow(data);
  }

  onDragEndRow({ itemId }) {
    this.props.onDragEndRow(this.itemEndData({ itemId }));
  }

  onDragBeginList(data) {
    this.isDraggingList = true;
    this.props.onDragBeginList(data);
    // this.cancelScrollToTopActions( new Set([ data.listId]));
    // 这里回调 onDragBeginList 后，上层组件一定会重新设置 props，所以不用再把 tempState 设置回去了。
    // 如果上层组件不理会这个回掉，则状态会一直维持当前状态，效果也不差。
    // if( !this.tempState ){
    //   this.setState(this.tempState);
    //   this.tempState = null;
    // }
  }

  onDragEndList({ listId }) {
    this.isDraggingList = false;
    this.props.onDragEndList(this.listEndData({ listId }));
    this.delayScrollToTop(this.listIdsMovedInLastDragging);
    this.listIdsMovedInLastDragging.clear();
  }


  // prevScrollLeft = 0;
  // hasScrollChanged = false;
  // onScrollChange(scrollLeft){
    // if( scrollLeft !== this.prevScrollLeft){
    //   console.log('set isScrolling true');
    //   this.isScrolling = true;
    //   this.hasScrollChanged = true;
    //   this.prevScrollLeft = scrollLeft;
    //   this.startScrollCheckTimer();
    // }
  // }

  
  

  listRefs = {}
  getListRefCallback = memoize(id => ref => { this.listRefs[id] = ref; })
  renderList({ columnIndex, key, style }) {
    const list = this.state.lists[columnIndex];

    return (
      <SortableList
        ref={this.getListRefCallback(list.id)}
        key={list.id}
        index={columnIndex}
        listId={list.id}
        listStyle={style}
        listRenderer={this.props.listRenderer}
        itemRenderer={this.props.itemRenderer}
        list={list}
        moveRow={this.onMoveRow}
        moveList={this.onMoveList}
        dropRow={this.onDropRow}
        dropList={this.onDropList}
        dragEndRow={this.onDragEndRow}
        dragBeginRow={this.onDragBeginRow}
        dragEndList={this.onDragEndList}
        dragBeginList={this.onDragBeginList}
        overscanRowCount={this.props.overscanRowCount}
        itemCacheKey={this.props.itemCacheKey}
        findItemIndex={this.findItemIndex}
        findListIndex={this.findListIndex}
        defaultCardHeight={this.props.defaultCardHeight}
        canDropRow={this.props.canDropRow}
        canDropList={this.props.canDropList}
      />
    );
  }

  render() {
    const { lists } = this.state;
    const {
      width,
      height,
      listWidth,
      itemPreviewRenderer,
      listPreviewRenderer,
      overscanListCount,
      scrollToList,
      scrollToAlignment,
    } = this.props;

    return (
      <div>
        <GridWithScrollZone
          lists={lists}
          className='KanbanGrid'
          // Needed for fixing disappearing items when scrolling
          containerStyle={{pointerEvents: 'auto'}}
          ref={(c) => (this._grid = c)}
          width={width}
          height={height}
          columnWidth={listWidth}
          rowHeight={height - scrollbarSize()}
          columnCount={lists.length}
          rowCount={1}
          cellRenderer={this.renderList}
          overscanColumnCount={overscanListCount}
          horizontalStrength={this.horizontalStrength}
          strengthMultiplier={5}
          verticalStrength={ZeroScrollStrength}
          scrollToColumn={scrollToList}
          scrollToAlignment={scrollToAlignment}
          speed={100}
          // onScrollChange={this.onScrollChange}
        />
        <DragLayer
          itemPreviewRenderer={itemPreviewRenderer}
          listPreviewRenderer={listPreviewRenderer}
        />
      </div>
    );
  }
}

export default DragDropContext(HTML5Backend)(Kanban);
