import {GaugeMiniLayerConfig} from '@influxdata/giraffe'
import {GAUGE_MINI_THEME_BULLET_DARK} from 'src/shared/constants/gaugeMiniSpecs'
import {
  AGG_WINDOW_AUTO,
  DEFAULT_FILLVALUES,
} from 'src/timeMachine/constants/queryBuilder'

export default {
  type: 'gauge-mini',
  shape: 'chronograf-v2',
  legend: {},

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

  ...GAUGE_MINI_THEME_BULLET_DARK,
} as GaugeMiniLayerConfig
