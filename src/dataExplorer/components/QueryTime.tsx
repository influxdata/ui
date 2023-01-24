import React, {FC, useContext} from 'react'
import {ResultsContext} from 'src/dataExplorer/context/results'
import {RemoteDataState} from 'src/types'

import 'src/dataExplorer/components/QueryTime.scss'

const humanReadable = (time: number): string => {
  return '' + time + 'ms'
}

const QueryTime: FC = () => {
  const {status, time} = useContext(ResultsContext)

  if (status === RemoteDataState.Done) {
    return (
      <div className="query-status">
        <div className="status done" />
        <label>Ready ({humanReadable(time)})</label>
      </div>
    )
  }

  if (status === RemoteDataState.Loading) {
    if (time < 1000) {
      return (
        <div className="query-status">
          <div className="status loading" />
          <label>Running...</label>
        </div>
      )
    }
    return (
      <div className="query-status">
        <div className="status loading" />
        <label>Running ({humanReadable(time)})...</label>
      </div>
    )
  }

  if (status === RemoteDataState.Error) {
    return (
      <div className="query-status">
        <div className="status error" />
        <label>Error ({humanReadable(time)})</label>
      </div>
    )
  }

  return (
    <div className="query-status">
      <div className="status pending" />
    </div>
  )
}

export default QueryTime
