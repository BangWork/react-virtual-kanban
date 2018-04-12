import { PropTypes } from 'react';

export const lists = PropTypes.array;
export const item = PropTypes.object;
export const itemType = PropTypes.string;
export const currentOffset = PropTypes.shape({
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequire,
});
export const isDragging = PropTypes.bool.isRequired;
export const itemPreviewRenderer = PropTypes.func.isRequired;
export const listPreviewRenderer = PropTypes.func.isRequired;
