// Libraries
import React, {FC} from 'react'
import {Grid, Columns} from '@influxdata/clockface'
import {
  Credit250FreePanel,
  FreePanel,
} from 'src/billing/components/Free/FreePanel'
import {PAYGConversion} from 'src/billing/components/Free/PAYGConversion'

// Components
import GetAssetLimits from 'src/cloud/components/GetAssetLimits'

// Utils
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {GoogleOptimizeExperiment} from 'src/cloud/components/experiments/GoogleOptimizeExperiment'

// Constants
import {CREDIT_250_EXPERIMENT_ID} from 'src/shared/constants'

const BillingFree: FC = () => {
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

  if (isFlagEnabled('credit250Experiment')) {
    return (
      <GoogleOptimizeExperiment
        experimentID={CREDIT_250_EXPERIMENT_ID}
        original={original}
        variants={[
          <Grid key="1">
            <Grid.Row>
              <Grid.Column widthXS={Columns.Twelve}>
                <GetAssetLimits>
                  <Credit250FreePanel />
                </GetAssetLimits>
              </Grid.Column>
            </Grid.Row>
          </Grid>,
        ]}
      />
    )
  }
  return original
}

export default BillingFree
