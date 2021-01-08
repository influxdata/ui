import React, {FC, useEffect} from 'react'
import {Grid, Columns} from '@influxdata/clockface'
import FreePanel from './FreePanel'
import PAYGConversion from './PAYGConversion'
import {SpinnerContainer, TechnoSpinner} from '@influxdata/clockface'

// Thunks
import {getOrgLimits} from 'src/billing/thunks'

// Hooks
import {useBilling} from 'src/billing/components/BillingPage'

// Types
import {RemoteDataState} from 'src/types'

const BillingFree: FC = () => {
  const [{orgLimits}, dispatch] = useBilling()

  useEffect(() => {
    getOrgLimits(dispatch)
  }, [dispatch])

  const loading = orgLimits?.status ?? RemoteDataState.NotStarted

  return (
    <Grid>
      <Grid.Row>
        <Grid.Column widthXS={Columns.Twelve}>
          <SpinnerContainer
            spinnerComponent={<TechnoSpinner />}
            loading={loading}
          >
            <FreePanel />
          </SpinnerContainer>
        </Grid.Column>
      </Grid.Row>
      <PAYGConversion />
    </Grid>
  )
}

export default BillingFree
