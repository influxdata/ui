// Libraries
import React, {FC} from 'react'
import {useSelector} from 'react-redux'
import {Grid, Columns} from '@influxdata/clockface'
import {
  Credit250FreePanel,
  FreePanel,
} from 'src/billing/components/Free/FreePanel'
import {PAYGConversion} from 'src/billing/components/Free/PAYGConversion'

// Components
import GetAssetLimits from 'src/cloud/components/GetAssetLimits'

// Utils
import {shouldGetCredit250Experience} from 'src/me/selectors'

export const BillingFree: FC = () => {
  const isCredit250ExperienceActive = useSelector(shouldGetCredit250Experience)

  const original = (
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

  const credit250Experience = (
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

  if (isCredit250ExperienceActive) {
    return credit250Experience
  }
  return original
}
