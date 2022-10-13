import React, {FC} from 'react'

// Components
import {Page} from '@influxdata/clockface'

const LoadDataHeader: FC = () => {
  return (
    <Page.Header fullWidth={true} testID="load-data--header">
      <Page.Title title="Load Data" />
    </Page.Header>
  )
}

export default LoadDataHeader
