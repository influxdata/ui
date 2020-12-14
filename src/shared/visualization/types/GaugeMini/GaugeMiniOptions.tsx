import React, {FC} from 'react'

import {Grid} from '@influxdata/clockface'

import {GaugeViewProperties, VisOptionProps} from 'src/types'

interface Props extends VisOptionProps {
  properties: GaugeViewProperties
}

const GaugeMiniOptions: FC<Props> = () => {
  return (
    <>
      <Grid.Column>
        <h4 className="view-options--header">Customize Mini-Gauge </h4>
      </Grid.Column>
    </>
  )
}

export default GaugeMiniOptions
