// Installed libraries
import React from 'react'
import {fireEvent, cleanup, waitFor} from '@testing-library/react'

// Mock State
import {renderWithReduxAndRouter} from 'src/mockState'
import {mockAppState} from 'src/mockAppState'

// Redux
import {normalize} from 'normalizr'
import {Organization} from 'src/client'
import {OrgEntities, RemoteDataState} from 'src/types'
import {arrayOfOrgs} from 'src/schemas'
import {AnnotationsControlBar} from './AnnotationsControlBar'
import {
  setAnnotations,
  setAnnotationStreams,
} from 'src/annotations/actions/creators'
import {AnnotationResponse, AnnotationStream} from 'src/types'

const setup = () => {
  return renderWithReduxAndRouter(
    <AnnotationsControlBar />,
    _fakeLocalStorage => {
      const appState = {...mockAppState}
      return appState
    }
  )
}

let getByTestId
let store

describe('the annotations control bar ui functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    const renderResult = setup()

    store = renderResult.store
    getByTestId = renderResult.getByTestId

    const org = {name: 'test_org_name', id: 'test_org_id'}

    store.dispatch({
      type: 'SET_ORG',
      org: org,
    })
    const organizations = normalize<Organization, OrgEntities, string[]>(
      [org],
      arrayOfOrgs
    )
    store.dispatch({
      type: 'SET_ORGS',
      schema: organizations,
      status: RemoteDataState.Done,
    })

    // set some annotations
    const annotations = [
      {
        stream: 'default',
        annotations: [
          {
            summary: 'Annotation 1',
            endTime: new Date('2021-03-15T20:51:45.853Z').getTime(),
            startTime: new Date('2021-03-15T20:51:45.853Z').getTime(),
          },
          {
            summary: 'Annotation 2',
            endTime: new Date('2021-03-15T20:59:47.636Z').getTime(),
            startTime: new Date('2021-03-15T20:59:47.636Z').getTime(),
          },
          {
            summary: 'Annotation 3',
            endTime: new Date('2021-03-15T21:06:18.741Z').getTime(),
            startTime: new Date('2021-03-15T21:06:18.741Z').getTime(),
          },
        ],
      },
      {
        stream: 'not_default',
        annotations: [
          {
            summary: 'Annotation 1',
            endTime: new Date('2021-03-15T20:51:45.853Z').getTime(),
            startTime: new Date('2021-03-15T20:51:45.853Z').getTime(),
          },
          {
            summary: 'Annotation 2',
            endTime: new Date('2021-03-15T20:59:47.636Z').getTime(),
            startTime: new Date('2021-03-15T20:59:47.636Z').getTime(),
          },
          {
            summary: 'Annotation 3',
            endTime: new Date('2021-03-15T21:06:18.741Z').getTime(),
            startTime: new Date('2021-03-15T21:06:18.741Z').getTime(),
          },
        ],
      },
    ] as AnnotationResponse[]

    store.dispatch(setAnnotations(annotations))

    // set annotation streams
    const annotationStreams = [
      {
        stream: 'default',
        color: 'red',
        description: 'The default annotation stream.',
      },
      {
        stream: 'not_default',
        color: 'green',
        description: 'The not_default annotation stream.',
      },
    ] as AnnotationStream[]

    store.dispatch(setAnnotationStreams(annotationStreams))
  })

  afterEach(() => {
    cleanup()
  })

  // temporarily removing the notion of streams
  // see https://github.com/influxdata/ui/issues/901
  it.skip('can search for streams', async () => {
    const streamSearchBar = getByTestId('annotations-search-input')

    expect(streamSearchBar).toBeVisible()

    fireEvent.focus(streamSearchBar)

    const suggestions = getByTestId('annotations-searchbar-suggestions')

    expect(suggestions).toBeVisible()

    // start typing "not_" this will trigger the search filtering process.
    await waitFor(() => {
      fireEvent.change(streamSearchBar, {target: {value: 'not_'}})
    })

    const not_default_suggestion = getByTestId(
      'annotations-suggestion not_default'
    )

    expect(not_default_suggestion).toBeVisible()
  })

  // temporarily removing the notion of streams
  // see https://github.com/influxdata/ui/issues/901
  it.skip('can select stream from the available streams', async () => {
    const streamSearchBar = getByTestId('annotations-search-input')

    expect(streamSearchBar).toBeVisible()

    fireEvent.focus(streamSearchBar)

    const suggestions = getByTestId('annotations-searchbar-suggestions')

    expect(suggestions).toBeVisible()

    // start typing "not_" this will trigger the search filtering process.
    await waitFor(() => {
      fireEvent.change(streamSearchBar, {target: {value: 'not_'}})
    })

    const not_default_suggestion = getByTestId(
      'annotations-suggestion not_default'
    )

    expect(not_default_suggestion).toBeVisible()
    await waitFor(() => {
      fireEvent.click(not_default_suggestion)
    })

    const streamAnnotationPill = getByTestId('annotation-pill not_default')
    expect(streamAnnotationPill).toBeVisible()

    const visibleStreamsByID = store.getState().annotations.visibleStreamsByID
    expect(visibleStreamsByID).toStrictEqual(['default', 'not_default'])
  })

  // temporarily removing the notion of streams
  // see https://github.com/influxdata/ui/issues/901
  it.skip('can close the stream from the annotation pill', async () => {
    const streamSearchBar = getByTestId('annotations-search-input')

    expect(streamSearchBar).toBeVisible()

    fireEvent.focus(streamSearchBar)

    const suggestions = getByTestId('annotations-searchbar-suggestions')

    expect(suggestions).toBeVisible()

    // start typing "not_" this will trigger the search filtering process.
    await waitFor(() => {
      fireEvent.change(streamSearchBar, {target: {value: 'not_'}})
    })

    let not_default_suggestion = getByTestId(
      'annotations-suggestion not_default'
    )

    expect(not_default_suggestion).toBeVisible()
    await waitFor(() => {
      fireEvent.click(not_default_suggestion)
    })

    const streamAnnotationPillClose = getByTestId('annotation-pill not_default')
    expect(streamAnnotationPillClose).toBeVisible()

    await waitFor(() => {
      fireEvent.click(streamAnnotationPillClose)
    })

    fireEvent.focus(streamSearchBar)
    not_default_suggestion = getByTestId('annotations-suggestion not_default')
    expect(not_default_suggestion).toBeVisible()

    const visibleStreamsByID = store.getState().annotations.visibleStreamsByID
    expect(visibleStreamsByID).toStrictEqual(['default'])
  })

  it('can toggle write mode (which is on by defaul)', async () => {
    const toggleButton = getByTestId('annotations-write-mode-toggle')

    await waitFor(() => {
      fireEvent.click(toggleButton)
    })

    const enableWriteMode = store.getState().annotations.enableWriteMode

    // annotation write mode is on by default
    expect(enableWriteMode).toBeFalsy()
  })

  it('can toggle the visibility of annotations (which are on by default)', async () => {
    const toggleButton = getByTestId('annotations-visibility-toggle')

    await waitFor(() => {
      fireEvent.click(toggleButton)
    })

    expect(store.getState().annotations.annotationsAreVisible).toBeFalsy()
  })
})
