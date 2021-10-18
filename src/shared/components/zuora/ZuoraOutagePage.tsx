// Libraries
import React, {FC} from 'react'
import {FunnelPage} from '@influxdata/clockface'
import LogoWithCubo from 'src/checkout/LogoWithCubo'
import ZuoraOutagePanel from './ZuoraOutagePanel'

// Components

// Types

// Constants

const ZuoraOutagePage: FC = () => {
  return (
    <FunnelPage
      logo={<LogoWithCubo />}
      enableGraphic={true}
      className="zuora-outage-funnel-page"
    >
      <ZuoraOutagePanel />
    </FunnelPage>
  )
}

export default ZuoraOutagePage
