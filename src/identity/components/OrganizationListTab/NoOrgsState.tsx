import React, {FC} from 'react'
import {ComponentSize, EmptyState} from '@influxdata/clockface'

export const NoOrgsState: FC = () => {
  return (
    <EmptyState size={ComponentSize.Medium}>
      <EmptyState.Text>
        No <b>organizations</b> matching those search criteria were found.
      </EmptyState.Text>
    </EmptyState>
  )
}
