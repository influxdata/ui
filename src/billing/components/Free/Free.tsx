// Libraries
import React, {FC} from 'react'
import {Grid, Columns} from '@influxdata/clockface'
import {Credit250FreePanel} from 'src/billing/components/Free/FreePanel'

// Components
import GetAssetLimits from 'src/cloud/components/GetAssetLimits'

const BillingFree: FC = () => (
  <Grid key="1">
    <Grid.Row>
      <Grid.Column widthXS={Columns.Twelve}>
        <GetAssetLimits>
          <Credit250FreePanel />
        </GetAssetLimits>
      </Grid.Column>
    </Grid.Row>
  </Grid>
)

export default BillingFree
