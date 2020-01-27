import { Markdownz, pxToRem } from '@zooniverse/react-components'
import { Box, Text } from 'grommet'
import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import zooTheme from '@zooniverse/grommet-theme'

import TaskInput from '../../components/TaskInput'

const StyledBox = styled(Box)`
  img:only-child, svg:only-child {
    background-color: ${zooTheme.global.colors.brand};
    max-width: ${pxToRem(60)};
  }
`

const StyledText = styled(Text)`
  margin: 0;
  padding: 0;
  width: 100%;

  > *:first-child {
    margin-top: 0;
  }
`

function MultipleChoiceTask (props) {
  const {
    annotation,
    disabled,
    task
  } = props
  const { value } = annotation

  function onChange (index, event) {
    const newValue = value ? value.slice(0) : []
    if (event.target.checked && !newValue.includes(index)) {
      newValue.push(index)
    } else if (!event.target.checked && newValue.includes(index)) {
      const indexInValue = newValue.indexOf(index)
      newValue.splice(indexInValue, 1)
    }
    annotation.update(newValue)
  }

  return (
    <StyledBox
      autoFocus={(value && value.length === 0)}
      disabled={disabled}
    >
      <StyledText size='small' tag='legend'>
        <Markdownz>
          {task.question}
        </Markdownz>
      </StyledText>
      {task.answers.map((answer, index) => {
        const checked = (value && value.length > 0) ? value.includes(index) : false
        return (
          <TaskInput
            autoFocus={checked}
            checked={checked}
            disabled={disabled}
            index={index}
            key={`${task.taskKey}_${index}`}
            label={answer.label}
            name={task.taskKey}
            onChange={onChange.bind(this, index)}
            required={task.required}
            type='checkbox'
          />
        )
      })}
    </StyledBox>
  )
}

MultipleChoiceTask.defaultProps = {
  disabled: false
}

MultipleChoiceTask.propTypes = {
  annotation: PropTypes.shape({
    update: PropTypes.func,
    value: PropTypes.array
  }).isRequired,
  disabled: PropTypes.bool,
  task: PropTypes.shape({
    answers: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string
    })),
    help: PropTypes.string,
    question: PropTypes.string,
    required: PropTypes.bool
  }).isRequired
}

export default MultipleChoiceTask
