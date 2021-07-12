import React from 'react'
import {renderWithRedux} from 'src/mockState'
import {
  AnnotationForm,
  END_TIME_IN_FUTURE_MESSAGE,
  START_TIME_IN_FUTURE_MESSAGE,
  TIMES_ARE_SAME_MESSAGE,
  WRONG_ORDER_MESSAGE,
} from 'src/annotations/components/annotationForm/AnnotationForm'
import {fireEvent} from '@testing-library/react'
import {createDateTimeFormatter} from 'src/utils/datetime/formatters'
import {REQUIRED_ERROR} from 'src/annotations/components/annotationForm/AnnotationTimeInput'

const setup = (annoType: 'point' | 'range', startTime, endTime) => {
  const doNothing = () => {}

  return renderWithRedux(
    <AnnotationForm
      title="Add"
      type={annoType}
      startTime={startTime}
      endTime={endTime}
      eventPrefix="testing"
      onClose={doNothing}
      onSubmit={doNothing}
    />
  )
}

const setupPoint = time => {
  return setup('point', time, null)
}

const setupRange = (start, end) => {
  return setup('range', start, end)
}

describe('Annotation Form Component tests', () => {
  const fiveMinutesAgo = new Date().getTime() - 1000 * 60 * 5
  const oneHourAgo = new Date().getTime() - 1000 * 60 * 60
  const oneHourInFuture = fiveMinutesAgo + 60 * 60 * 1000

  const formatter = createDateTimeFormatter('YYYY-MM-DD hh:mm:ss a')

  it('should not allow an annotation without a message', () => {
    const {queryByTestId, getByTestId} = setupPoint(fiveMinutesAgo)

    expect(getByTestId('form--element-error')).toHaveTextContent(
      'This field is required'
    )
    expect(getByTestId('annotation-submit-button')).toBeDisabled()

    fireEvent.change(getByTestId('edit-annotation-message'), {
      target: {value: 'abcde'},
    })

    expect(queryByTestId('form--element-error')).toBeNull()
    expect(getByTestId('annotation-submit-button')).not.toBeDisabled()
  })

  it('should not allow a start time in the future', () => {
    const {queryByTestId, getByTestId} = setupPoint(oneHourInFuture)

    fireEvent.change(getByTestId('edit-annotation-message'), {
      target: {value: 'abcde'},
    })

    expect(getByTestId('form--element-error')).toHaveTextContent(
      START_TIME_IN_FUTURE_MESSAGE
    )
    expect(getByTestId('annotation-submit-button')).toBeDisabled()

    // fix it; error should go away:
    fireEvent.change(getByTestId('startTime-testID'), {
      target: {value: formatter.format(fiveMinutesAgo)},
    })

    expect(queryByTestId('form--element-error')).toBeNull()
    expect(getByTestId('annotation-submit-button')).not.toBeDisabled()
  })
  it('should not allow the end time to be before the start time', () => {
    const {queryByTestId, getByTestId} = setupRange(oneHourAgo, fiveMinutesAgo)

    // needs message still:
    expect(getByTestId('form--element-error')).toHaveTextContent(
      'This field is required'
    )
    expect(getByTestId('annotation-submit-button')).toBeDisabled()

    fireEvent.change(getByTestId('edit-annotation-message'), {
      target: {value: 'abcde'},
    })

    expect(queryByTestId('form--element-error')).toBeNull()
    expect(getByTestId('annotation-submit-button')).not.toBeDisabled()

    const twoHoursAgo = new Date().getTime() - 1000 * 60 * 60 * 2

    fireEvent.change(getByTestId('endTime-testID'), {
      target: {value: formatter.format(twoHoursAgo)},
    })

    expect(getByTestId('form--element-error')).toHaveTextContent(
      WRONG_ORDER_MESSAGE
    )
    expect(getByTestId('annotation-submit-button')).toBeDisabled()

    // make it good again
    fireEvent.change(getByTestId('endTime-testID'), {
      target: {value: formatter.format(fiveMinutesAgo)},
    })

    expect(queryByTestId('form--element-error')).toBeNull()
    expect(getByTestId('annotation-submit-button')).not.toBeDisabled()
  })
  it('should not allow the end time to be in the future', () => {
    const {queryByTestId, getByTestId} = setupRange(oneHourAgo, oneHourInFuture)

    fireEvent.change(getByTestId('edit-annotation-message'), {
      target: {value: 'abcde'},
    })

    expect(getByTestId('form--element-error')).toHaveTextContent(
      END_TIME_IN_FUTURE_MESSAGE
    )
    expect(getByTestId('annotation-submit-button')).toBeDisabled()

    // fix it; error should go away:
    fireEvent.change(getByTestId('endTime-testID'), {
      target: {value: formatter.format(fiveMinutesAgo)},
    })

    expect(queryByTestId('form--element-error')).toBeNull()
    expect(getByTestId('annotation-submit-button')).not.toBeDisabled()
  })
  it('should not allow the end time to be the same as the start time', () => {
    const {queryByTestId, getByTestId} = setupRange(oneHourAgo, oneHourAgo)

    fireEvent.change(getByTestId('edit-annotation-message'), {
      target: {value: 'abcde'},
    })

    expect(getByTestId('form--element-error')).toHaveTextContent(
      TIMES_ARE_SAME_MESSAGE
    )
    expect(getByTestId('annotation-submit-button')).toBeDisabled()

    // fix it:
    fireEvent.change(getByTestId('endTime-testID'), {
      target: {value: formatter.format(fiveMinutesAgo)},
    })

    expect(queryByTestId('form--element-error')).toBeNull()
    expect(getByTestId('annotation-submit-button')).not.toBeDisabled()

    // now change the start time! (sneaky!)
    fireEvent.change(getByTestId('startTime-testID'), {
      target: {value: formatter.format(fiveMinutesAgo)},
    })

    expect(getByTestId('form--element-error')).toHaveTextContent(
      TIMES_ARE_SAME_MESSAGE
    )
    expect(getByTestId('annotation-submit-button')).toBeDisabled()

    // fix it:
    fireEvent.change(getByTestId('startTime-testID'), {
      target: {value: formatter.format(oneHourAgo)},
    })

    expect(queryByTestId('form--element-error')).toBeNull()
    expect(getByTestId('annotation-submit-button')).not.toBeDisabled()
  })
  it('should not allow an empty end time', () => {
    const {queryByTestId, getByTestId} = setupRange(oneHourAgo, fiveMinutesAgo)

    fireEvent.change(getByTestId('edit-annotation-message'), {
      target: {value: 'abcde'},
    })

    expect(queryByTestId('form--element-error')).toBeNull()
    expect(getByTestId('annotation-submit-button')).not.toBeDisabled()

    // now zero out the end time:
    fireEvent.change(getByTestId('endTime-testID'), {
      target: {value: ''},
    })

    expect(getByTestId('annotation-submit-button')).toBeDisabled()
    expect(getByTestId('form--element-error')).toHaveTextContent(REQUIRED_ERROR)

    // restore:
    fireEvent.change(getByTestId('endTime-testID'), {
      target: {value: formatter.format(fiveMinutesAgo)},
    })

    expect(queryByTestId('form--element-error')).toBeNull()
    expect(getByTestId('annotation-submit-button')).not.toBeDisabled()
  })
  it('should not allow an empty start time', () => {
    const {queryByTestId, getByTestId} = setupRange(oneHourAgo, fiveMinutesAgo)

    fireEvent.change(getByTestId('edit-annotation-message'), {
      target: {value: 'abcde'},
    })

    expect(queryByTestId('form--element-error')).toBeNull()
    expect(getByTestId('annotation-submit-button')).not.toBeDisabled()

    // now zero out the end time:
    fireEvent.change(getByTestId('startTime-testID'), {
      target: {value: ''},
    })

    expect(getByTestId('annotation-submit-button')).toBeDisabled()
    expect(getByTestId('form--element-error')).toHaveTextContent(REQUIRED_ERROR)

    // restore:
    fireEvent.change(getByTestId('startTime-testID'), {
      target: {value: formatter.format(oneHourAgo)},
    })

    expect(queryByTestId('form--element-error')).toBeNull()
    expect(getByTestId('annotation-submit-button')).not.toBeDisabled()
  })
})
