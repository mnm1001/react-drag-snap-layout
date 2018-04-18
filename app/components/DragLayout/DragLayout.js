import React, { Component, PropTypes } from 'react'
import classNames from 'classnames'
import { map, isEmpty } from 'lodash'
import MoveAndResizeWrapper from './MoveAndResizeWrapper'
import './DragLayout.less'

export default class DragLayout extends Component {
  static propTypes = {
    children: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    style: PropTypes.object,
    width: PropTypes.number,
    height: PropTypes.number,
    childMinWidth: PropTypes.number,
    childMinHeight: PropTypes.number,
    onChangePosition: PropTypes.func,
    dragHandleClassName: PropTypes.string,
    canDrag: PropTypes.bool,
    onSelect: PropTypes.func.isRequired,
    onStartDragging: PropTypes.func,
    onEndDragging: PropTypes.func,
    onLayoutClick: PropTypes.func,
    scale: PropTypes.number,
    selectedItem: PropTypes.string
  }

  static defaultProps = {
    canDrag: true,
    scale: 1,
    width: 800,
    height: 600,
    childMinWidth: 0,
    childMinHeight: 0,
    onChangePosition: () => {},
    onSelect: () => {},
    onStartDragging: () => {},
    onEndDragging: () => {}
  }

  constructor(props) {
    super(props)
    this.handleStartDragging = this.handleStartDragging.bind(this)
    this.handleEndDragging = this.handleEndDragging.bind(this)
    this.handleChangeOverlapLines = this.handleChangeOverlapLines.bind(this)
    this.state = {
      overlapLines: {x: [], y: []},
      isDragging: ''
    }
  }

  handleStartDragging(dragId) {
    this.setState({isDragging: dragId})
    this.props.onStartDragging(dragId)
  }

  handleEndDragging(dragId) {
    this.setState({isDragging: ''})
    this.props.onEndDragging(dragId)
  }

  handleChangeOverlapLines(overlapLines) {
    this.setState({overlapLines})
  }

  render() {
    const { width, height, childMinWidth, canDrag, childMinHeight, scale, style, selectedItem } = this.props
    const { isDragging } = this.state
    const children = React.Children.toArray(this.props.children)
    const dragLayoutStyle = {width: width * scale, height: height * scale, ...style}
    return (
      <div className={`DragLayout ${classNames({noDrag: !canDrag})}`} style={dragLayoutStyle} onClick={this.props.onLayoutClick}>
        {map(children, (child) =>
          <MoveAndResizeWrapper
            scale={scale}
            isDragging={isDragging === child.props.dragId}
            isSelected={selectedItem === child.props.dragId}
            onSelect={this.props.onSelect}
            dragHandleClassName={this.props.dragHandleClassName}
            onStartDragging={this.handleStartDragging}
            onEndDragging={this.handleEndDragging}
            onChangePosition={this.props.onChangePosition}
            key={child.props.dragId}
            canDrag={canDrag}
            onChangeOverlapLines={this.handleChangeOverlapLines}
            dragId={child.props.dragId}
            position={child.props.position}
            layoutWidth={width}
            layoutHeight={height}
            minWidth={childMinWidth}
            minHeight={childMinHeight}
          >
            {child}
          </MoveAndResizeWrapper>
        )}
        {this.renderOverlapLines()}
      </div>
    )
  }

  renderOverlapLines() {
    const { width, height, scale } = this.props
    const { overlapLines, isDragging} = this.state

    if (isEmpty(isDragging)) return false

    const linesX = map(overlapLines.x, (line, index) => (
      <div
        key={index}
        className='overlapLines'
        style={{width: '0px', height: `${height}px`, left: `${line * scale}px`}}
      >
      </div>
    ))
    const linesY = map(overlapLines.y, (line, index) => (
      <div
        key={index}
        className='overlapLines'
        style={{width: `${width}px`, height: '0px', top: `${line * scale}px`}}
      >
      </div>
    ))
    return (
      <div>
        {linesX}
        {linesY}
      </div>
    )
  }
}
