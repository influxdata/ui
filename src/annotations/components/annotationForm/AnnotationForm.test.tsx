import React from 'react'
import {renderWithRedux} from 'src/mockState'
import {AnnotationForm} from 'src/annotations/components/annotationForm/AnnotationForm'

jest.mock('src/resources/components/GetResources')
jest.mock('src/annotations/actions/thunks')
const setup = (annoType, startTime) => {
    const doNothing = () => {}

    return renderWithRedux(<AnnotationForm
     title='Add'
     type={annoType}
     startTime={startTime}
     eventPrefix='testing'
     onClose={doNothing}
     onSubmit={doNothing}
    />)
}
// <AnnotationForm
//     title="Add"
//     type={annoType}
//     onClose={onClose}
//     onSubmit={handleSubmit}
//     startTime={startTime}
//     endTime={endTime}
//     eventPrefix={eventPrefix}
// />

describe('Annotation Form Component tests', () => {
    const startTime = new Date().getTime()



    it('should disallow an annotation without a message', () => {
        const {getByTestId} = setup('point', startTime)
        
        expect(getByTestId('form--element-error')).toHaveTextContent("This field is required")
    })
})