// Libraries
import React, {FC} from 'react'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import {connect, ConnectedProps} from 'react-redux'

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
import {setDataLoadersType} from 'src/dataLoaders/actions/dataLoaders'
import {event} from 'src/cloud/utils/reporting'

// Types
import {Label, OwnBucket} from 'src/types'
import {DataLoaderType} from 'src/types/dataLoaders'

import {CLOUD} from 'src/shared/constants'

interface OwnProps {
  bucket: OwnBucket
  bucketType: 'user' | 'system'
  orgID: string
  onFilterChange: (searchTerm: string) => void
  onGetSchema: (b: OwnBucket) => void
}

type ReduxProps = ConnectedProps<typeof connector>
type RouterProps = RouteComponentProps<{orgID: string}>
type Props = OwnProps & ReduxProps & RouterProps

const BucketCardActions: FC<Props> = ({
  bucket,
  bucketType,
  orgID,
  onFilterChange,
  onGetSchema,
  onAddBucketLabel,
  onDeleteBucketLabel,
  history,
  onSetDataLoadersBucket,
  onSetDataLoadersType,
}) => {
  if (bucketType === 'system') {
    return null
  }

  const handleAddLabel = (label: Label) => {
    onAddBucketLabel(bucket.id, label)
  }

  const handleRemoveLabel = (label: Label) => {
    onDeleteBucketLabel(bucket.id, label)
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
    onSetDataLoadersBucket(orgID, bucket.name, bucket.id)

    onSetDataLoadersType(DataLoaderType.Streaming)
    history.push(`/orgs/${orgID}/load-data/telegrafs/new`)
  }

  const handleAddLineProtocol = () => {
    onSetDataLoadersBucket(orgID, bucket.name, bucket.id)

    history.push(`/orgs/${orgID}/load-data/file-upload/lp`)
  }

  const handleCSVUploader = () => {
    onSetDataLoadersBucket(orgID, bucket.name, bucket.id)

    history.push(`/orgs/${orgID}/load-data/file-upload/annotated_csv`)
  }

  const handleAddClientLibrary = (): void => {
    onSetDataLoadersBucket(orgID, bucket.name, bucket.id)
    onSetDataLoadersType(DataLoaderType.ClientLibrary)

    history.push(`/orgs/${orgID}/load-data/`)
  }

  const handleAddScraper = () => {
    onSetDataLoadersBucket(orgID, bucket.name, bucket.id)

    onSetDataLoadersType(DataLoaderType.Scraping)
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

const mdtp = {
  onAddBucketLabel: addBucketLabel,
  onDeleteBucketLabel: deleteBucketLabel,
  onSetDataLoadersBucket: setBucketInfo,
  onSetDataLoadersType: setDataLoadersType,
}

const connector = connect(null, mdtp)

export default connector(withRouter(BucketCardActions))
