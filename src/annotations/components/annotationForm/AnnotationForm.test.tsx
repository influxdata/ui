import React from 'react'
import {renderWithRedux} from 'src/mockState'
import {AnnotationForm} from 'src/annotations/components/annotationForm/AnnotationForm'
import {fireEvent} from '@testing-library/react'


//jest.mock('src/resources/components/GetResources')
//jest.mock('src/annotations/actions/thunks')
const setup = (annoType, startTime) => {
  const doNothing = () => {}

  return renderWithRedux(
    <AnnotationForm
      title="Add"
      type={annoType}
      startTime={startTime}
      eventPrefix="testing"
      onClose={doNothing}
      onSubmit={doNothing}
    />
  )
}

describe('Annotation Form Component tests', () => {
  const startTime = new Date().getTime()

  it('should disallow an annotation without a message', () => {
    const {queryByTestId, getByTestId} = setup('point', startTime)

    expect(getByTestId('form--element-error')).toHaveTextContent(
      'This field is required'
    )

    fireEvent.change(getByTestId('edit-annotation-message'), {
      target: {value: 'abcde'},
    })

    expect(queryByTestId('form--element-error')).toBeNull()
  })

  it('should disallow a start time in the future', () => {
    const oneHourInFuture = startTime + (60 * 60 * 1000)

    const {queryByTestId, getByTestId} = setup('point', oneHourInFuture)

    fireEvent.change(getByTestId('edit-annotation-message'), {
      target: {value: 'abcde'},
    })

    expect(getByTestId('form--element-error')).toHaveTextContent('Start Time cannot be in the future')

    // fix it; error should go away:
    fireEvent.change(getByTestId('startTime-testID'), {
      target: {value: startTime},
    })

    const ack= queryByTestId('form--element-error')
    console.log(ack)


  })
})
