import React from 'react'
import {render} from '@testing-library/react'
import {AnnotationsList, RemoteDataState} from 'src/types'

jest.mock('src/flows/index', () => {
  return {
    PROJECT_NAME: 'NoteBook',
    DEFAULT_PROJECT_NAME: 'Untitled Notebook',
  }
})

jest.mock('src/flows/templates/index', () => {
  return {
    TEMPLATES: {},
  }
})

import {View, SUPPORTED_VISUALIZATIONS} from 'src/visualization'

const setup = properties => {
  const loading = RemoteDataState.NotStarted
  const id = 'a2710d76-021a-49ca-a7aa-b2e8bacf4022'
  const annotations: AnnotationsList = {}
  const errorMessage = ''
  const ranges: any = {}
  const giraffeResult = null
  const isInitialFetch = true

  return render(
    <View
      loading={loading}
      error={errorMessage}
      isInitial={isInitialFetch}
      properties={properties}
      result={giraffeResult}
      timeRange={ranges}
      annotations={annotations}
      cellID={id}
    />
  )
}

describe('the view rendering pipeline', () => {
  Object.keys(SUPPORTED_VISUALIZATIONS).forEach(visualizationType => {
    it('does not fail to render a component', () => {
      const {container} = setup(SUPPORTED_VISUALIZATIONS[visualizationType])
      expect(container).not.toHaveTextContent(
        'An InfluxDB error has occurred. Please report the issue'
      )
    })
  })
})
