import React, { Component } from 'react'
import { findDOMNode } from 'react-dom'
import PropTypes from 'prop-types'
import { addMoveListener, addResizeListener, getDomPosition, movePositionLimited } from './DragLayoutService'
import { resizeHandlePosition } from './DragLayoutConstants'
import './MoveAndResizeWrapper.less'
import { map, forEach, includes } from 'lodash'
import classNames from 'classnames'

export default class MoveAndResizeWrapper extends Component {
  static propTypes = {
    children: PropTypes.object,
    layoutWidth: PropTypes.number,
    layoutHeight: PropTypes.number,
    minWidth: PropTypes.number,
    scale: PropTypes.number,
    minHeight: PropTypes.number,
    onChangeOverlapLines: PropTypes.func,
    onChangePosition: PropTypes.func,
    position: PropTypes.object,
    disableDrag: PropTypes.bool,
    onSelect: PropTypes.func,
    isDragging: PropTypes.bool,
    isSelected: PropTypes.bool,
    onStartDragging: PropTypes.func,
    onEndDragging: PropTypes.func,
    dragHandleClassName: PropTypes.string,
    id: PropTypes.string.isRequired
  }

  static defaultProps = {
    position: {width: 100, height: 100, left: 0, top: 0}
  }

  constructor(props) {
    super(props)
    this.handleSelect = this.handleSelect.bind(this)
    this.handleKeyDown = this.handleKeyDown.bind(this)
  }

  componentDidMount() {
    const { scale, disableDrag, id, dragHandleClassName, minWidth, minHeight, onChangePosition, layoutWidth, layoutHeight, onStartDragging, onEndDragging, onChangeOverlapLines } = this.props
    if (!disableDrag) {
      const layoutOption = { layoutWidth, layoutHeight }
      const wrapperDomOption = { minWidth, minHeight, scale, id }
      const funcCallBack = { onChangePosition, onStartDragging, onEndDragging, onChangeOverlapLines }

      addMoveListener(findDOMNode(this), dragHandleClassName, wrapperDomOption, layoutOption, funcCallBack)
      forEach(resizeHandlePosition, positionHandler => {
        addResizeListener(findDOMNode(this), this.refs[positionHandler], wrapperDomOption, layoutOption, funcCallBack)
      })
    }
  }

  componentWillReceiveProps(nextProps) {
    const { scale, disableDrag, id, dragHandleClassName, minWidth, minHeight, layoutWidth, layoutHeight, onStartDragging, onEndDragging, onChangePosition, onChangeOverlapLines } = nextProps

    if (!disableDrag && this.props.scale !== scale) {
      const layoutOption = { layoutWidth, layoutHeight }
      const wrapperDomOption = { minWidth, minHeight, scale, id }
      const funcCallBack = { onChangePosition, onStartDragging, onEndDragging, onChangeOverlapLines }

      addMoveListener(findDOMNode(this), dragHandleClassName, wrapperDomOption, layoutOption, funcCallBack)
      forEach(resizeHandlePosition, positionHandler => {
        addResizeListener(findDOMNode(this), this.refs[positionHandler], wrapperDomOption, layoutOption, funcCallBack)
      })
    }
  }

  handleKeyDown(event) {
    const isArrowKey = includes([37, 38, 39, 40], event.keyCode)
    if (!isArrowKey) return

    event.preventDefault()
    const { disableDrag, onChangePosition, id, layoutWidth, layoutHeight, scale } = this.props
    if (disableDrag) return

    const wrapperDom = findDOMNode(this)
    const oldPosition = getDomPosition(wrapperDom, scale)
    const moveGap = 1
    let newDomLeft = oldPosition.left * scale
    let newDomTop = oldPosition.top * scale

    if (event.keyCode === 37)
      newDomLeft = newDomLeft - moveGap

    if (event.keyCode === 38)
      newDomTop = newDomTop - moveGap

    if (event.keyCode === 39)
      newDomLeft = newDomLeft + moveGap

    if (event.keyCode === 40)
      newDomTop = newDomTop + moveGap

    newDomLeft = movePositionLimited(newDomLeft, oldPosition.width * scale, layoutWidth * scale)
    newDomTop = movePositionLimited(newDomTop, oldPosition.height * scale, layoutHeight * scale)

    wrapperDom.style.left = `${newDomLeft}px`
    wrapperDom.style.top = `${newDomTop}px`

    onChangePosition(id, {width: oldPosition.width, height: oldPosition.height, left: newDomLeft / scale, top: newDomTop / scale})
  }

  handleSelect(e) {
    e.stopPropagation()
    const { id } = this.props
    this.props.onSelect(id)
  }

  render() {
    const { position, isSelected, scale, isDragging } = this.props
    const { width, height, left, top } = position
    
    const moveAndResizeWrapperStyle = {
      width,
      height,
      left: left * scale,
      top: top * scale,
      transformOrigin: `0px 0px 0px`,
      transform: `scale(${scale}) translate3d(0,0,0)`
    }

    return (
      <div
        className={`MoveAndResizeWrapper ${classNames({selected: isSelected, isDragging})}`}
        onClick={this.handleSelect}
        style={moveAndResizeWrapperStyle}
        onKeyDown={this.handleKeyDown}
        tabIndex={0}
      >
        {this.props.children}
        {map(resizeHandlePosition, (positionHandler) =>
          <div
            key={positionHandler}
            className='resizeHandle'
            data-direction={positionHandler}
            ref={positionHandler}
          >
          </div>
        )}
      </div>
    )
  }
}
