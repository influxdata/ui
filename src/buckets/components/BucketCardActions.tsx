// Libraries
import React, {FC} from 'react'
import {useHistory} from 'react-router-dom'
import {useDispatch} from 'react-redux'

// Components
import {
  Button,
  ComponentSize,
  FlexBox,
  FlexDirection,
} from '@influxdata/clockface'
import BucketAddDataButton from 'src/buckets/components/BucketAddDataButton'
import InlineLabels from 'src/shared/components/inlineLabels/InlineLabels'

// Actions
import {addBucketLabel, deleteBucketLabel} from 'src/buckets/actions/thunks'
import {setBucketInfo} from 'src/dataLoaders/actions/steps'
import {
  setDataLoadersType,
  setLocationOnDismiss,
} from 'src/dataLoaders/actions/dataLoaders'
import {event} from 'src/cloud/utils/reporting'

// Types
import {Label, OwnBucket} from 'src/types'
import {DataLoaderType} from 'src/types/dataLoaders'

import {CLOUD} from 'src/shared/constants'

interface Props {
  bucket: OwnBucket
  bucketType: 'user' | 'system'
  orgID: string
  onFilterChange: (searchTerm: string) => void
  onGetSchema: (b: OwnBucket) => void
}

const BucketCardActions: FC<Props> = ({
  bucket,
  bucketType,
  orgID,
  onFilterChange,
  onGetSchema,
}) => {
  const history = useHistory()
  const dispatch = useDispatch()

  if (bucketType === 'system') {
    return null
  }

  const handleAddLabel = (label: Label) => {
    dispatch(addBucketLabel(bucket.id, label))
  }

  const handleRemoveLabel = (label: Label) => {
    dispatch(deleteBucketLabel(bucket.id, label))
  }

  const handleClickSettings = () => {
    event('bucket.view.settings')
    history.push(`/orgs/${orgID}/load-data/buckets/${bucket.id}/edit`)
  }

  // to turn on metrics locally: influx.toggle('appMetrics')
  const handleShowSchema = () => {
    event('bucket.view.schema.explicit')
    onGetSchema(bucket)
  }

  const handleAddCollector = () => {
    dispatch(setBucketInfo(orgID, bucket.name, bucket.id))

    dispatch(setDataLoadersType(DataLoaderType.Streaming))
    dispatch(setLocationOnDismiss(`/orgs/${orgID}/load-data/buckets`))
    history.push(`/orgs/${orgID}/load-data/telegrafs/new`)
  }

  const handleAddLineProtocol = () => {
    dispatch(setBucketInfo(orgID, bucket.name, bucket.id))

    history.push(`/orgs/${orgID}/load-data/file-upload/lp`)
  }

  const handleCSVUploader = () => {
    dispatch(setBucketInfo(orgID, bucket.name, bucket.id))

    history.push(`/orgs/${orgID}/load-data/file-upload/annotated_csv`)
  }

  const handleAddClientLibrary = (): void => {
    dispatch(setBucketInfo(orgID, bucket.name, bucket.id))
    dispatch(setDataLoadersType(DataLoaderType.ClientLibrary))

    history.push(`/orgs/${orgID}/load-data/`)
  }

  const handleAddScraper = () => {
    dispatch(setBucketInfo(orgID, bucket.name, bucket.id))

    dispatch(setDataLoadersType(DataLoaderType.Scraping))
    history.push(`/orgs/${orgID}/load-data/buckets/${bucket.id}/scrapers/new`)
  }

  const makeSchemaButton = () => {
    if (CLOUD && bucket?.schemaType === 'explicit') {
      return (
        <Button
          text="Show Schema"
          testID="bucket-showSchema"
          size={ComponentSize.ExtraSmall}
          onClick={handleShowSchema}
        />
      )
    }
  }

  return (
    <FlexBox
      direction={FlexDirection.Row}
      margin={ComponentSize.Medium}
      style={{marginTop: '4px'}}
    >
      <InlineLabels
        selectedLabelIDs={bucket.labels}
        onFilterChange={onFilterChange}
        onAddLabel={handleAddLabel}
        onRemoveLabel={handleRemoveLabel}
      />
      <BucketAddDataButton
        onAddCollector={handleAddCollector}
        onAddLineProtocol={handleAddLineProtocol}
        onAddCsv={handleCSVUploader}
        onAddClientLibrary={handleAddClientLibrary}
        onAddScraper={handleAddScraper}
      />
      <Button
        text="Settings"
        testID="bucket-settings"
        size={ComponentSize.ExtraSmall}
        onClick={handleClickSettings}
      />
      {makeSchemaButton()}
    </FlexBox>
  )
}

export default BucketCardActions
