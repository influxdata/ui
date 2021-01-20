import {
  Icon,
  IconFont,
  InfluxColors,
  InfluxDBCloudLogo,
} from '@influxdata/clockface'
import React, {FC} from 'react'

const LogoWithCubo: FC = () => (
  <>
    <Icon glyph={IconFont.Cubo} className="cubo-logo" />
    <InfluxDBCloudLogo
      fill={InfluxColors.White}
      cloud={true}
      className="influx-cloud-logo"
    />
  </>
)

export default LogoWithCubo
