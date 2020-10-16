// Libraries
import React, {FC, useContext} from 'react'
import {useHistory, useParams} from 'react-router-dom'

// Components
import {
  Button,
  ButtonType,
  ComponentColor,
  ComponentStatus,
} from '@influxdata/clockface'

// Types
import {PipeProp} from 'src/types/flows'

// Contexts
import BucketProvider from 'src/flows/context/buckets'
import {PipeContext} from 'src/flows/context/pipe'
import {TimeContext} from 'src/flows/context/time'

// Components
import BucketSelector from 'src/flows/pipes/Bucket/BucketSelector'

// Styles
import 'src/flows/pipes/Query/style.scss'

const BucketSource: FC<PipeProp> = ({Context}) => {
  const history = useHistory()
  const {data, queryText} = useContext(PipeContext)
  const {timeContext} = useContext(TimeContext)
  const {orgID, id} = useParams<{orgID: string; id: string}>()
  const timeRange = timeContext[id]
  const onClick = () =>
    history.push(`/orgs/${orgID}/flows/${id}/export-task`, [
      {bucket: data.bucket, queryText, timeRange: timeRange.range},
    ])
  const controls = (
    <Button
      text="Export as Task"
      color={ComponentColor.Success}
      type={ButtonType.Submit}
      onClick={onClick}
      status={data.bucket ? ComponentStatus.Default : ComponentStatus.Disabled}
      testID="task-form-save"
    />
  )
  return (
    <BucketProvider>
      <Context controls={controls}>
        <div className="data-source--controls">
          <BucketSelector />
        </div>
      </Context>
    </BucketProvider>
  )
}

export default BucketSource
