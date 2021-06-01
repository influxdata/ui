// Libraries
import React, {FC} from 'react'
import {Grid, Columns} from '@influxdata/clockface'
import FreePanel from 'src/billing/components/Free/FreePanel'
import PAYGConversion from 'src/billing/components/Free/PAYGConversion'

// Components
import GetAssetLimits from 'src/cloud/components/GetAssetLimits'

const BillingFree: FC = () => (
  <Grid>
    <Grid.Row>
      <Grid.Column widthXS={Columns.Twelve}>
        <GetAssetLimits>
          <FreePanel />
        </GetAssetLimits>
      </Grid.Column>
    </Grid.Row>
    <PAYGConversion />
  </Grid>
)

export default BillingFree
