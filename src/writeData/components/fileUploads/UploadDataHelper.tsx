// Libraries
import React, {FC} from 'react'

// Components
import {Panel, InfluxColors, ComponentSize} from '@influxdata/clockface'
import WriteDataHelperBuckets from 'src/writeData/components/WriteDataHelperBuckets'

const UploadDataHelper: FC = () => (
  <Panel backgroundColor={InfluxColors.Castle}>
    <Panel.Body size={ComponentSize.ExtraSmall}>
      <WriteDataHelperBuckets />
    </Panel.Body>
  </Panel>
)

export default UploadDataHelper
