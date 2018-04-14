import React from 'react';
import HTML5Backend from 'react-dnd-html5-backend';
import withScrolling, { createHorizontalStrength, createVerticalStrength } from 'react-dnd-scrollzone';
import { DragDropContext } from 'react-dnd';
import { Grid } from 'react-virtualized';
import scrollbarSize from 'dom-helpers/util/scrollbarSize';

import {
  updateLists,
  findListIndex,
  findItemIndex,
  findItemListIndex,
  findItemListId,
} from './updateLists';

import * as propTypes from './propTypes';
import * as decorators from '../decorators';
// import DragLayer from '../DragLayer';
import SortableList from '../SortableList';

const GridWithScrollZone = withScrolling(Grid);

// import { DragDropManager } from 'dnd-core';

import PureComponent from '../PureComponent';

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
      lists: props.lists
    };

    this.horizontalStrength = createHorizontalStrength(200);
    this.verticalStrength = () => {};

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
  }


  componentWillReceiveProps(nextProps) {
    this.setState({ lists: nextProps.lists });
  }

  onMoveList(from, to) {
    this.setState(
      { lists: updateLists(this.state.lists, {from, to}) },
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

  onMoveRow(from, to) {
    this.setState(
      {lists: updateLists(this.state.lists, {from, to})},
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
  }

  onDropList({ listId }) {
    this.props.onDropList(this.listEndData({ listId }));
  }

  itemEndData({ itemId }) {
    const lists = this.state.lists;

    return {
      itemId,
      get rowId() {
        console.warn('onDropRow: `rowId` is deprecated. Use `itemId` instead');
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
    this.props.onDragBeginList(data);
  }

  onDragEndList({ listId }) {
    this.props.onDragEndList(this.listEndData({ listId }));
  }

  componentDidUpdate(_prevProps, prevState) {
    if (prevState.lists !== this.state.lists) {
      this._grid.wrappedInstance.forceUpdate();
    }
  }

  findItemIndex(itemId) {
    return findItemIndex(this.state.lists, itemId);
  }

  findListIndex(listId) {
    return findListIndex(this.state.lists, listId);
  }

  renderList({ columnIndex, key, style }) {
    const list = this.state.lists[columnIndex];

    return (
      <SortableList
        key={list.id}
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
          // verticalStrength={this.verticalStrength}
          scrollToColumn={scrollToList}
          scrollToAlignment={scrollToAlignment}
          speed={100}
        />
        {/* <DragLayer
          lists={lists}
          itemPreviewRenderer={itemPreviewRenderer}
          listPreviewRenderer={listPreviewRenderer}
        /> */}
      </div>
    );
  }
}

export default DragDropContext(HTML5Backend)(Kanban);
