import { map } from 'lodash'
import React, { PureComponent } from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import './DragLayout.less'

export default class DragLayout extends PureComponent {
  static propTypes = {
    children: PropTypes.array.isRequired,
    style: PropTypes.object,
    layoutWidth: PropTypes.number,
    layoutHeight: PropTypes.number,
    itemMinWidth: PropTypes.number,
    itemMinHeight: PropTypes.number,
    onChangePosition: PropTypes.func,
    dragHandleClassName: PropTypes.string,
    disableDrag: PropTypes.bool,
    onSelect: PropTypes.func,
    onStartDragging: PropTypes.func,
    onEndDragging: PropTypes.func,
    scale: PropTypes.number
  }

  static defaultProps = {
    scale: 1,
    style: {},
    dragHandleClassName: '',
    disableDrag: false,
    layoutWidth: 800,
    layoutHeight: 600,
    itemMinWidth: 30,
    itemMinHeight: 30,
    onChangePosition: () => {},
    onSelect: () => {},
    onStartDragging: () => {},
    onEndDragging: () => {}
  }

  constructor(props) {
    map()
    super(props)
    this.handleStartDragging = this.handleStartDragging.bind(this)
    this.handleEndDragging = this.handleEndDragging.bind(this)
    this.handleChangeOverlapLines = this.handleChangeOverlapLines.bind(this)
    this.state = {
      overlapLines: { x: [], y: [] },
      selectedId: '',
      draggingId: ''
    }
  }

  handleStartDragging(id) {
    this.setState({ draggingId: id })
    this.props.onStartDragging(id)
  }

  handleEndDragging(id) {
    this.setState({ draggingId: '' })
    this.props.onEndDragging(id)
  }

  handleChangeOverlapLines(overlapLines) {
    this.setState({ overlapLines })
  }

  handleSelect = (selectedId) => {
    this.setState({
      selectedId
    })
    this.props.onSelect(selectedId)
  }

  handleLayoutClick = () => {
    this.setState({
      selectedId: ''
    })
  }

  renderOverlapLines() {
    const { layoutWidth, layoutHeight, scale } = this.props
    const { overlapLines } = this.state

    const linesX = map(overlapLines.x, (line, index) => (
      <div
        key={index}
        className='overlapLine'
        style={{ width: '0px', height: `${layoutHeight}px`, left: `${line * scale}px` }}
      />
    ))
    const linesY = map(overlapLines.y, (line, index) => (
      <div
        key={index}
        className='overlapLine'
        style={{ width: `${layoutWidth}px`, height: '0px', top: `${line * scale}px` }}
      />
    ))

    return (
      <div className='overlapLines'>
        {linesX}
        {linesY}
      </div>
    )
  }

  render() {
    const { layoutWidth, layoutHeight, itemMinWidth, disableDrag, itemMinHeight, scale, style, dragHandleClassName, onChangePosition } = this.props
    const { draggingId, selectedId } = this.state
    const children = React.Children.toArray(this.props.children)
    const dragLayoutStyle = { width: layoutWidth * scale, height: layoutHeight * scale, ...style }

    return (
      <div className={`DragLayout ${classNames({ disableDrag })}`} style={dragLayoutStyle} onMouseDown={this.handleLayoutClick}>
        {map(children, (child) => {
          return React.cloneElement(
            child,
            {
              scale,
              disableDrag,
              isDragging: draggingId === child.props.id,
              isSelected: selectedId === child.props.id,
              dragHandleClassName,
              onSelect: this.handleSelect,
              onStartDragging: this.handleStartDragging,
              onEndDragging: this.handleEndDragging,
              onChangePosition,
              onChangeOverlapLines: this.handleChangeOverlapLines,
              layoutWidth,
              layoutHeight,
              minWidth: itemMinWidth,
              minHeight: itemMinHeight
            },
          )
        })}
        {this.renderOverlapLines()}
      </div>
    )
  }
}
