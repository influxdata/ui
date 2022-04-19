import {
  InfluxColors,
  InfluxLogo,
  LogoAuxiliaryText,
  LogoBaseText,
  LogoMarks,
  LogoSymbols,
} from '@influxdata/clockface'
import React, {FC} from 'react'

const LogoWithCubo: FC = () => (
  <div className="logo-with-cubo">
    <InfluxLogo
      logoMark={LogoMarks.Kubo}
      baseText={LogoBaseText.InfluxDb}
      auxiliaryText={LogoAuxiliaryText.Cloud}
      symbol={LogoSymbols.Trademark}
      fill={InfluxColors.White}
      centeredLogo={false}
    />
  </div>
)

export default LogoWithCubo
