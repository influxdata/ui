import {
  Icon,
  IconFont,
  InfluxColors,
  InfluxDBCloudLogo,
} from '@influxdata/clockface'
import React, {FC} from 'react'

import './CloudLogoWithCubo.scss'

const CloudLogoWithCubo: FC = () => (
  <div className="logo-with-cubo">
    <Icon glyph={IconFont.CuboSolid} className="cubo-logo" />
    <InfluxDBCloudLogo
      fill={InfluxColors.White}
      cloud={true}
      className="influx-cloud-logo"
    />
  </div>
)

export {CloudLogoWithCubo}
