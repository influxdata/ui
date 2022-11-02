import {
  DEFAULT_FILLVALUES,
  AGG_WINDOW_AUTO,
} from 'src/timeMachine/constants/queryBuilder'
import {GeoViewProperties} from 'src/types'
import {DEFAULT_THRESHOLDS_GEO_COLORS} from 'src/shared/constants/thresholds'

export const GeoProperties = {
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
  allowPanAndZoom: true,
  detectCoordinateFields: false,
  mapStyle: '',
  note: '',
  showNoteWhenEmpty: false,
  layers: [
    {
      type: 'pointMap',
      colorDimension: {label: 'Value'},
      colorField: '_value',
      colors: DEFAULT_THRESHOLDS_GEO_COLORS,
      isClustered: false,
      tooltipColumns: [],
    },
  ],
  useS2CellID: true,
  s2Column: '',
  latLonColumns: {lat: {key: '', column: ''}, lon: {key: '', column: ''}},
} as GeoViewProperties
