import React, {FC} from 'react'
import {Grid, Columns} from '@influxdata/clockface'
import FreePanel from './FreePanel'
import PAYGConversion from './PAYGConversion'
import {Limits} from 'src/types'

interface Props {
  isRegionBeta: boolean
  orgLimits: Limits
}

const BillingFree: FC<Props> = ({orgLimits, isRegionBeta}) => {
  return (
    <Grid>
      <Grid.Row>
        <Grid.Column widthXS={Columns.Twelve}>
          <FreePanel orgLimits={orgLimits} />
        </Grid.Column>
      </Grid.Row>
      {isRegionBeta || <PAYGConversion />}
    </Grid>
  )
}

export default BillingFree
