import {
  DEFAULT_FILLVALUES,
  AGG_WINDOW_AUTO,
} from 'src/timeMachine/constants/queryBuilder'
import {GeoViewProperties} from 'src/types'

export default {
  type: 'geo',
  queries: [
    {
      text: '',
      editMode: 'builder',
      name: '',
      builderConfig: {
        buckets: [],
        tags: [
          {
            key: '_measurement',
            values: [],
            aggregateFunctionType: 'filter',
          },
        ],
        functions: [{name: 'mean'}],
        aggregateWindow: {
          period: AGG_WINDOW_AUTO,
          fillValues: DEFAULT_FILLVALUES,
        },
      },
    },
  ],
  shape: 'chronograf-v2',
  center: {
    lat: 0,
    lon: 0,
  },
  zoom: 0,
  allowPanAndZoom: false,
  detectCoordinateFields: false,
  mapStyle: '',
  note: '',
  showNoteWhenEmpty: false,
  colors: null,
  layers: [],
} as GeoViewProperties
