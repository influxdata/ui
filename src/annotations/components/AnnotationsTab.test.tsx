import React from 'react'
import {renderWithRedux} from 'src/mockState'
import {AnnotationsTab} from 'src/annotations/components/AnnotationsTab'
import * as reactRedux from 'react-redux'

jest.mock('src/resources/components/GetResources')
jest.mock('src/annotations/actions/thunks')
const setup = () => {
  return renderWithRedux(<AnnotationsTab />)
}

describe('Annotations Tab Component', () => {
  const useSelectorMock = jest.spyOn(reactRedux, 'useSelector')
  jest.spyOn(reactRedux, 'useDispatch')

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders with a helpful message if no annotation streams are found', () => {
    useSelectorMock.mockReturnValue({id: 'blahidorg'})
    useSelectorMock.mockReturnValue([])

    const {getByTestId} = setup()

    expect(getByTestId('annotations-empty-state')).toHaveTextContent(
      "Looks like there aren't any Annotation Streams, why not create one?"
    )
  })

  it('renders with annotation streams displayed if the user has annotations', () => {
    useSelectorMock.mockReturnValue({id: 'blahidorg'})
    useSelectorMock.mockReturnValue([
      {stream: 'Aaron Rodgers'},
      {stream: 'Vince Lombardi'},
    ])

    const {getByText, getAllByTestId} = setup()

    const annotationStreamListItems = getAllByTestId(
      'resource-card annotation-stream'
    )
    expect(annotationStreamListItems.length).toEqual(2)
    expect(getByText('Aaron Rodgers')).toBeVisible()
  })
})
