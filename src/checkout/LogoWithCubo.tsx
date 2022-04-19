import {InfluxColors, InfluxDataLogo} from '@influxdata/clockface'
import React, {FC} from 'react'

const LogoWithCubo: FC = () => (
  <div className="logo-with-cubo">
    <InfluxDataLogo fill={InfluxColors.White} />
  </div>
)

export default LogoWithCubo
