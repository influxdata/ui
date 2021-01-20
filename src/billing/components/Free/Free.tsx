// Libraries
import React, {FC, useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {Grid, Columns} from '@influxdata/clockface'
import FreePanel from 'src/billing/components/Free/FreePanel'
import PAYGConversion from 'src/billing/components/Free/PAYGConversion'
import {SpinnerContainer, TechnoSpinner} from '@influxdata/clockface'

// Thunks
import {getAssetLimits} from 'src/cloud/actions/limits'

// Types
import {AppState, RemoteDataState} from 'src/types'

const BillingFree: FC = () => {
  const status = useSelector((state: AppState) => state?.cloud?.limits?.status)

  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(getAssetLimits())
  }, [dispatch])

  const loading = status ?? RemoteDataState.NotStarted
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
