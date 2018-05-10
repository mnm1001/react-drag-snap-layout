import { includes, filter, forEach, isEmpty, isUndefined, isNull, inRange, uniq, min, max } from 'lodash'
import { UP, DOWN, LEFT, RIGHT, UP_LEFT, UP_RIGHT, DOWN_LEFT, DOWN_RIGHT } from './DragLayoutConstants'

export const addMoveListener = (wrapperDom, dragHandleClassName, wrapperDomOption, layoutOption, funcCallBack) => {
  const handleDom = getChildDomByClassName(wrapperDom, dragHandleClassName)
  const { layoutWidth, layoutHeight } = layoutOption
  const { onChangePosition, onStartDragging, onEndDragging, onChangeOverlapLines } = funcCallBack
  const { scale, id } = wrapperDomOption

  handleDom.onmousedown = () => {
    const oldEvent = window.event
    const oldPosition = getDomPosition(wrapperDom, scale)
    const linesArray = getSiblingElementsLines(wrapperDom, scale)
    onStartDragging(id)
    document.onmousemove = (newEvent) => {
      newEvent.preventDefault()
      const mouseMoveX = (newEvent.clientX - oldEvent.clientX) / scale
      const mouseMoveY = (newEvent.clientY - oldEvent.clientY) / scale
      let newDomLeft = oldPosition.left + mouseMoveX
      let newDomTop = oldPosition.top + mouseMoveY

      const linesOfDom = getSnapLinesOfDom(oldPosition.width, oldPosition.height, newDomLeft, newDomTop)
      const snapDistanceX = getSnapDistance(linesArray.x, linesOfDom.x)
      const snapDistanceY = getSnapDistance(linesArray.y, linesOfDom.y)
      newDomLeft = newDomLeft - snapDistanceX
      newDomTop = newDomTop - snapDistanceY

      newDomLeft = movePositionLimited(newDomLeft, oldPosition.width, layoutWidth)
      newDomTop = movePositionLimited(newDomTop, oldPosition.height, layoutHeight)

      wrapperDom.style.left = `${newDomLeft * scale}px`
      wrapperDom.style.top = `${newDomTop * scale}px`

      changeOverlapLines(linesArray, oldPosition.width, oldPosition.height, newDomLeft, newDomTop, onChangeOverlapLines)
      onChangePosition(id, { width: oldPosition.width, height: oldPosition.height, left: newDomLeft, top: newDomTop })
    }
    document.onmouseup = () => {
      documentMouseUp(id, onEndDragging, onChangeOverlapLines)
    }
  }
}

export const addResizeListener = (dragDom, resizeHandleDom, wrapperDomOption, layoutOption, funcCallBack) => {
  const resizeHandlePosition = resizeHandleDom.getAttribute('data-direction')
  const { onChangePosition, onStartDragging, onEndDragging, onChangeOverlapLines } = funcCallBack
  const { scale, id } = wrapperDomOption

  resizeHandleDom.onmousedown = (e) => {
    e.stopPropagation()
    const oldEvent = window.event
    const oldPosition = getDomPosition(dragDom, scale)
    const linesArray = getSiblingElementsLines(dragDom, scale)
    onStartDragging(id)
    document.onmousemove = (newEvent) => {
      newEvent.preventDefault()
      newEvent.stopPropagation()
      let newDomWidth = oldPosition.width
      let newDomHeight = oldPosition.height
      let newDomLeft = oldPosition.left
      let newDomTop = oldPosition.top
      const mouseMoveX = (newEvent.clientX - oldEvent.clientX) / scale
      const mouseMoveY = (newEvent.clientY - oldEvent.clientY) / scale

      if (includes([RIGHT, UP_RIGHT, DOWN_RIGHT], resizeHandlePosition)) {
        const newPosition = getNewPositionOfRight(oldPosition, mouseMoveX, layoutOption, wrapperDomOption, linesArray)
        newDomWidth = newPosition.width
      }

      if (includes([DOWN, DOWN_LEFT, DOWN_RIGHT], resizeHandlePosition)) {
        const newPosition = getNewPositionOfDown(oldPosition, mouseMoveY, layoutOption, wrapperDomOption, linesArray)
        newDomHeight = newPosition.height
      }

      if (includes([LEFT, UP_LEFT, DOWN_LEFT], resizeHandlePosition)) {
        const newPosition = getNewPositionOfLeft(oldPosition, mouseMoveX, layoutOption, wrapperDomOption, linesArray)
        newDomWidth = newPosition.width
        newDomLeft = newPosition.left
      }

      if (includes([UP, UP_LEFT, UP_RIGHT], resizeHandlePosition)) {
        const newPosition = getNewPositionOfUp(oldPosition, mouseMoveY, layoutOption, wrapperDomOption, linesArray)
        newDomHeight = newPosition.height
        newDomTop = newPosition.top
      }

      dragDom.style.width = `${newDomWidth}px`
      dragDom.style.height = `${newDomHeight}px`
      dragDom.style.left = `${newDomLeft * scale}px`
      dragDom.style.top = `${newDomTop * scale}px`

      changeOverlapLines(linesArray, newDomWidth, newDomHeight, newDomLeft, newDomTop, onChangeOverlapLines)
      onChangePosition(id, { width: newDomWidth, height: newDomHeight, left: newDomLeft, top: newDomTop })
    }
    document.onmouseup = (e) => {
      e.stopPropagation()
      documentMouseUp(id, onEndDragging, onChangeOverlapLines)
    }
  }
}

export const movePositionLimited = (distance, oldSize, layoutSize) => {
  let newDistance = distance
  newDistance = newDistance < 0 ? 0 : newDistance
  newDistance = newDistance + oldSize > layoutSize ? layoutSize - oldSize : newDistance
  return newDistance
}

const getNewPositionOfRight = (oldPosition, mouseMoveX, layoutOption, wrapperDomOption, linesArray) => {
  let newDomWidth = oldPosition.width + mouseMoveX

  const domLineCenter = oldPosition.left + newDomWidth / 2
  const domLineRight = oldPosition.left + newDomWidth
  const snapDistanceXCenter = getSnapDistance(linesArray.x, [domLineCenter])
  const snapDistanceXRight = getSnapDistance(linesArray.x, [domLineRight])
  const snapDistanceX = Math.abs(snapDistanceXCenter) > Math.abs(snapDistanceXRight) ? snapDistanceXCenter * 2 : snapDistanceXRight
  newDomWidth = newDomWidth - snapDistanceX

  if (newDomWidth < wrapperDomOption.minWidth) newDomWidth = wrapperDomOption.minWidth
  if (newDomWidth + oldPosition.left > layoutOption.layoutWidth) newDomWidth = layoutOption.layoutWidth - oldPosition.left

  return { width: newDomWidth }
}

const getNewPositionOfDown = (oldPosition, mouseMoveY, layoutOption, wrapperDomOption, linesArray) => {
  let newDomHeight = oldPosition.height + mouseMoveY

  const domLineMiddle = oldPosition.top + newDomHeight / 2
  const domLineBottom = oldPosition.top + newDomHeight
  const snapDistanceXMiddle = getSnapDistance(linesArray.y, [domLineMiddle])
  const snapDistanceXBottom = getSnapDistance(linesArray.y, [domLineBottom])
  const snapDistanceY = Math.abs(snapDistanceXMiddle) > Math.abs(snapDistanceXBottom) ? snapDistanceXMiddle * 2 : snapDistanceXBottom
  newDomHeight = newDomHeight - snapDistanceY
  if (newDomHeight < wrapperDomOption.minHeight) newDomHeight = wrapperDomOption.minHeight
  if (newDomHeight + oldPosition.top > layoutOption.layoutHeight) newDomHeight = layoutOption.layoutHeight - oldPosition.top
  return { height: newDomHeight }
}

const getNewPositionOfLeft = (oldPosition, mouseMoveX, layoutOption, wrapperDomOption, linesArray) => {
  let newDomWidth = oldPosition.width - mouseMoveX
  let newDomLeft = oldPosition.left + mouseMoveX

  const domLineLeft = newDomLeft
  const domLineCenter = newDomLeft + newDomWidth / 2
  const snapDistanceXLeft = getSnapDistance(linesArray.x, [domLineLeft])
  const snapDistanceXCenter = getSnapDistance(linesArray.x, [domLineCenter])
  const snapDistanceX = Math.abs(snapDistanceXCenter) > Math.abs(snapDistanceXLeft) ? snapDistanceXCenter * 2 : snapDistanceXLeft
  newDomWidth = newDomWidth + snapDistanceX
  newDomLeft = newDomLeft - snapDistanceX

  if (newDomLeft < 0) {
    newDomWidth = oldPosition.right
    newDomLeft = 0
  }
  if (newDomLeft + wrapperDomOption.minWidth > oldPosition.right) {
    newDomWidth = wrapperDomOption.minWidth
    newDomLeft = oldPosition.right - wrapperDomOption.minWidth
  }

  return { width: newDomWidth, left: newDomLeft }
}

const getNewPositionOfUp = (oldPosition, mouseMoveY, layoutOption, wrapperDomOption, linesArray) => {
  let newDomHeight = oldPosition.height - mouseMoveY
  let newDomTop = oldPosition.top + mouseMoveY

  const domLineTop = newDomTop
  const domLineMiddle = newDomTop + newDomHeight / 2
  const snapDistanceXTop = getSnapDistance(linesArray.y, [domLineTop])
  const snapDistanceXMiddle = getSnapDistance(linesArray.y, [domLineMiddle])
  const snapDistanceY = Math.abs(snapDistanceXMiddle) > Math.abs(snapDistanceXTop) ? snapDistanceXMiddle * 2 : snapDistanceXTop
  newDomHeight = newDomHeight + snapDistanceY
  newDomTop = newDomTop - snapDistanceY

  if (newDomTop < 0) {
    newDomHeight = oldPosition.bottom
    newDomTop = 0
  }
  if (newDomTop + wrapperDomOption.minHeight > oldPosition.bottom) {
    newDomHeight = wrapperDomOption.minHeight
    newDomTop = oldPosition.bottom - wrapperDomOption.minHeight
  }

  return { height: newDomHeight, top: newDomTop }
}


export const getDomPosition = (dom, scale) => {
  const width = dom.offsetWidth
  const height = dom.offsetHeight
  const left = dom.offsetLeft / scale
  const top = dom.offsetTop / scale
  const right = left + width
  const bottom = top + height
  return { width, height, left, top, right, bottom }
}

const changeOverlapLines = (linesArray, width, height, left, top, onChangeOverlapLines) => {
  const newDomLines = getSnapLinesOfDom(width, height, left, top)
  const overlapLinesX = getOverlapLines(linesArray.x, newDomLines.x)
  const overlapLinesY = getOverlapLines(linesArray.y, newDomLines.y)
  onChangeOverlapLines({ x: overlapLinesX, y: overlapLinesY })
}

const documentMouseUp = (id, onEndDragging, onChangeOverlapLines) => {
  onEndDragging(id)
  onChangeOverlapLines({ x: [], y: [] })
  document.onmousemove = null
  document.onmouseup = null
}

const getOverlapLines = (linesArray, linesOfDom) => {
  const minSnapLineBoundary = min(linesOfDom)
  const maxSnapLineBoundary = max(linesOfDom)
  const newLinesArray = filter(linesArray, snapLine => snapLine >= minSnapLineBoundary && snapLine <= maxSnapLineBoundary)

  return filter(linesOfDom, domLine => includes(newLinesArray, domLine))
}

const getChildDomByClassName = (wrapperDom, dragHandleClassName) => {
  if (isUndefined(dragHandleClassName)) return wrapperDom

  const handleDom = wrapperDom.getElementsByClassName(dragHandleClassName)
  if (isEmpty(handleDom)) return wrapperDom

  return handleDom[0]
}

const getSnapDistance = (linesArray, linesOfDom) => {
  const snapGap = 20
  const minSnapLineBoundary = min(linesOfDom) - snapGap
  const maxSnapLineBoundary = max(linesOfDom) + snapGap
  const newLinesArray = filter(linesArray, snapLine => inRange(snapLine, minSnapLineBoundary, maxSnapLineBoundary))

  let tempSnapGap
  forEach(newLinesArray, snapLine => {
    forEach(linesOfDom, domLine => {
      if (inRange(domLine, snapLine - snapGap, snapLine + snapGap)) {
        if (isUndefined(tempSnapGap)) {
          tempSnapGap = domLine - snapLine
        } else if (Math.abs(domLine - snapLine) < Math.abs(tempSnapGap)) {
          tempSnapGap = domLine - snapLine
        }
      }
    })
  })

  return isUndefined(tempSnapGap) ? 0 : tempSnapGap
}

const getSiblingElementsLines = (dom, scale) => {
  const siblingElements = getSiblingElements(dom)
  const linesArray = { x: [], y: [] }
  forEach(siblingElements, (element) => {
    const position = getDomPosition(element, scale)
    const linesOfDom = getSnapLinesOfDom(position.width, position.height, position.left, position.top)
    linesArray.x = [...linesArray.x, ...linesOfDom.x]
    linesArray.y = [...linesArray.y, ...linesOfDom.y]
  })

  return { x: uniq(linesArray.x), y: uniq(linesArray.y) }
}

const getSnapLinesOfDom = (width, height, left, top) => {
  const center = left + width / 2
  const right = left + width
  const middle = top + height / 2
  const bottom = top + height
  return { x: [left, center, right], y: [top, middle, bottom] }
}

const getSiblingElements = (dom) => {
  let siblingElements = []

  let preElement = dom.previousSibling
  while (!isNull(preElement)) {
    siblingElements = [...siblingElements, preElement]
    preElement = preElement.previousSibling
  }

  let nextElement = dom.nextSibling
  while (!isNull(nextElement)) {
    siblingElements = [...siblingElements, nextElement]
    nextElement = nextElement.nextSibling
  }

  return siblingElements
}
