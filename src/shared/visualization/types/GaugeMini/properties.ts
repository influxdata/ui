import { GaugeMiniLayerConfig } from "@influxdata/giraffe";
import { GAUGE_MINI_THEME_BULLET_DARK } from "src/shared/constants/gaugeMiniSpecs";
import {GaugeViewProperties} from 'src/types'


// todo: regenerate swagger
type GaugeMiniViewProperties = GaugeViewProperties;

export default {
  type: 'gauge-mini',
  shape: 'chronograf-v2',
  legend: {},
  blah: "666666666666666666666",

  ...GAUGE_MINI_THEME_BULLET_DARK,
// todo: regenerate swagger
} as GaugeMiniLayerConfig as any as GaugeMiniViewProperties