import cuid from 'cuid'
import PropTypes from 'prop-types'
import React, { useContext, useState } from 'react'
import styled, { css } from 'styled-components'
import SVGContext from '@plugins/drawingTools/shared/SVGContext'
import DrawingToolMarks from './components/DrawingToolMarks'

const StyledRect = styled('rect')`
  ${props => props.disabled ? 
    css`cursor: not-allowed;` :
    css`cursor: crosshair;`
  }
`

function InteractionLayer ({
  activeMark,
  activeTool,
  activeToolIndex,
  children,
  disabled,
  frame,
  height,
  marks,
  move,
  setActiveMark,
  setSubTaskVisibility,
  scale,
  width
}) {
  const [ creating, setCreating ] = useState(false)
  const { svg, getScreenCTM } = useContext(SVGContext)

  function convertEvent (event) {
    const type = event.type

    const svgEventOffset = getEventOffset(event)

    const svgCoordinateEvent = {
      pointerId: event.pointerId,
      type,
      x: svgEventOffset.x,
      y: svgEventOffset.y
    }

    return svgCoordinateEvent
  }

  function getEventOffset (event) {
    const svgPoint = svg.createSVGPoint()
    svgPoint.x = event.clientX
    svgPoint.y = event.clientY
    const svgEventOffset = svgPoint.matrixTransform(getScreenCTM().inverse())
    return svgEventOffset
  }

  function onPointerDown (event) {
    if (disabled || move) {
      return true
    }

    const activeMark = activeTool.createMark({
      id: cuid(),
      frame,
      toolIndex: activeToolIndex
    })
    activeMark.initialPosition(convertEvent(event))
    setActiveMark(activeMark)
    setCreating(true)
    setSubTaskVisibility(false)
    return false
  }

  function onPointerMove (event) {
    if (creating) {
      const { target, pointerId } = event
      target.setPointerCapture(pointerId)
      activeMark.initialDrag(convertEvent(event))
    }
  }

  function onFinish (event, node) {
    const { target, pointerId } = event

    setCreating(false)
    if (activeMark && !activeMark.isValid) {
      activeTool.deleteMark(activeMark)
      setActiveMark(undefined)
    } else {
      setSubTaskVisibility(true, node)
    }

    if (target && pointerId) {
      target.releasePointerCapture(pointerId)
    }
  }

  return (
    <g
      onPointerMove={onPointerMove}
      touch-action='none'
    >
      <StyledRect
        disabled={disabled || move}
        pointerEvents={move ? 'none' : 'all'}
        width={width}
        height={height}
        fill='transparent'
        onPointerDown={onPointerDown}
      />
      {children}
      {marks &&
        <DrawingToolMarks
          activeMarkId={activeMark && activeMark.id}
          marks={marks}
          onDelete={() => {
            setSubTaskVisibility(false)
            setActiveMark(undefined)
          }}
          onFinish={onFinish}
          onSelectMark={mark => setActiveMark(mark)}
          onMove={(mark, difference) => mark.move(difference)}
          scale={scale}
        />
      }
    </g>
  )
}

InteractionLayer.propTypes = {
  activeMark: PropTypes.object,
  activeTool: PropTypes.object.isRequired,
  activeToolIndex: PropTypes.number,
  frame: PropTypes.number,
  marks: PropTypes.array,
  setActiveMark: PropTypes.func,
  setSubTaskVisibility: PropTypes.func,
  height: PropTypes.number.isRequired,
  disabled: PropTypes.bool,
  scale: PropTypes.number,
  width: PropTypes.number.isRequired
}

InteractionLayer.defaultProps = {
  activeMark: undefined,
  activeToolIndex: 0,
  frame: 0,
  marks: [],
  setActiveMark: () => {},
  setSubTaskVisibility: () => {},
  disabled: false,
  scale: 1
}

export default InteractionLayer
export { StyledRect }
