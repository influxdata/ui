import React, {FC} from 'react'
import {
  SpinnerContainer,
  TechnoSpinner,
  RemoteDataState,
} from '@influxdata/clockface'

interface Props {
  loading?: RemoteDataState
  children?: React.ReactChild
}

const PageSpinner: FC<Props> = ({loading, children}) => {
  return (
    <SpinnerContainer
      loading={loading ?? RemoteDataState.Loading}
      spinnerComponent={<TechnoSpinner />}
    >
      {children}
    </SpinnerContainer>
  )
}

export default PageSpinner
