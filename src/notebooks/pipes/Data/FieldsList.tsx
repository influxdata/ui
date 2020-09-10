// Libraries
import React, {FC, useContext} from 'react'

// Components
import {
  TechnoSpinner,
  ComponentSize,
  RemoteDataState,
} from '@influxdata/clockface'
import Selectors from 'src/notebooks/pipes/Data/Selectors'
import {SchemaContext} from 'src/notebooks/context/schemaProvider'

const FieldsList: FC = () => {
  const {loading, data} = useContext(SchemaContext)

  if (loading === RemoteDataState.Loading) {
    return (
      <div className="data-source--list__empty">
        <TechnoSpinner strokeWidth={ComponentSize.Small} diameterPixels={32} />
      </div>
    )
  }

  if (loading === RemoteDataState.Error) {
    return (
      <div className="data-source--list__empty">
        <p>Could not fetch schema</p>
      </div>
    )
  }

  if (loading === RemoteDataState.Done && Object.keys(data).length > 0) {
    return <Selectors />
  }

  return null
}

export default FieldsList
