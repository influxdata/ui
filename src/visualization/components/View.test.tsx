import React from 'react'
import {render} from '@testing-library/react'
import {AnnotationsList, RemoteDataState} from 'src/types'

import Band from 'src/visualization/types/Band/index'
import Check from 'src/visualization/types/Check/index'
import Gauge from 'src/visualization/types/Gauge/index'
import Graph from 'src/visualization/types/Graph/index'
import Heatmap from 'src/visualization/types/Heatmap/index'
import Histogram from 'src/visualization/types/Histogram/index'
import GeoMap from 'src/visualization/types/Map/index'
import Mosaic from 'src/visualization/types/Mosaic/index'
import Scatter from 'src/visualization/types/Scatter/index'
import SimpleTable from 'src/visualization/types/SimpleTable/index'
import SingleStat from 'src/visualization/types/SingleStat/index'
import SingleStatWithLine from 'src/visualization/types/SingleStatWithLine/index'
import Table from 'src/visualization/types/Table/index'

const supportedVisualizations = {}

Band(visualization => {
  supportedVisualizations[visualization.type] = visualization
})
Check(visualization => {
  supportedVisualizations[visualization.type] = visualization
})
Gauge(visualization => {
  supportedVisualizations[visualization.type] = visualization
})
Graph(visualization => {
  supportedVisualizations[visualization.type] = visualization
})
Heatmap(visualization => {
  supportedVisualizations[visualization.type] = visualization
})
Histogram(visualization => {
  supportedVisualizations[visualization.type] = visualization
})
GeoMap(visualization => {
  supportedVisualizations[visualization.type] = visualization
})
Mosaic(visualization => {
  supportedVisualizations[visualization.type] = visualization
})
Scatter(visualization => {
  supportedVisualizations[visualization.type] = visualization
})
SimpleTable(visualization => {
  supportedVisualizations[visualization.type] = visualization
})
SingleStat(visualization => {
  supportedVisualizations[visualization.type] = visualization
})
SingleStatWithLine(visualization => {
  supportedVisualizations[visualization.type] = visualization
})
Table(visualization => {
  supportedVisualizations[visualization.type] = visualization
})

jest.doMock('src/visualization/contextLoader', () => {
  return {
    ...(jest as any).requireActual('src/visualization/contextLoader'),
    buildSupportedVisualizations: jest.fn(() => {
      return supportedVisualizations
    }),
  }
})

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
