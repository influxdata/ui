import {DEFAULT_LINE_COLORS} from 'src/shared/constants/graphColorPalettes'
import {
  DEFAULT_FILLVALUES,
  AGG_WINDOW_AUTO,
} from 'src/timeMachine/constants/queryBuilder'

import {Axis, Base, Color, CheckViewProperties} from 'src/types'

export default {
  type: 'check',
  shape: 'chronograf-v2',
  checkID: '',
  geom: 'line',
  xColumn: null,
  yColumn: null,
  position: 'overlaid',
  hoverDimension: 'auto',

  queries: [
    {
      name: '',
      text: '',
      editMode: 'builder',
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

  colors: DEFAULT_LINE_COLORS as Color[],
  legend: {},
  note: '',
  showNoteWhenEmpty: false,
  axes: {
    x: {
      bounds: ['', ''],
      label: '',
      prefix: '',
      suffix: '',
      base: '10',
      scale: 'linear',
    } as Axis,
    y: {
      bounds: ['', ''],
      label: '',
      prefix: '',
      suffix: '',
      base: '10' as Base,
      scale: 'linear',
    } as Axis,
  },
} as CheckViewProperties
