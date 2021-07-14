// Libraries
import React, {FC} from 'react'
import {withRouter, RouteComponentProps} from 'react-router-dom'

// Components
import {ResourceCard} from '@influxdata/clockface'
import BucketContextMenu from 'src/buckets/components/BucketContextMenu'
import BucketCardMeta from 'src/buckets/components/BucketCardMeta'
import BucketCardActions from 'src/buckets/components/BucketCardActions'

// Constants
import {isSystemBucket} from 'src/buckets/constants/index'

// Utils
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

// Types
import {OwnBucket} from 'src/types'

interface Props {
  bucket: OwnBucket
  onDeleteData: (b: OwnBucket) => void
  onDeleteBucket: (b: OwnBucket) => void
  onUpdateBucket: (b: OwnBucket) => void
  onFilterChange: (searchTerm: string) => void
}

const BucketCard: FC<Props & RouteComponentProps<{orgID: string}>> = ({
  bucket,
  onDeleteBucket,
  onFilterChange,
  onDeleteData,
  history,
  match: {
    params: {orgID},
  },
}) => {
  const handleNameClick = () => {
    if (isFlagEnabled('exploreWithFlows')) {
      history.push(`/notebook/from/bucket/${bucket.name}`)
    } else {
      history.push(`/orgs/${orgID}/data-explorer?bucket=${bucket.name}`)
    }
  }

  return (
    <ResourceCard
      testID={`bucket-card ${bucket.name}`}
      contextMenu={
        !isSystemBucket(bucket.name) && (
          <BucketContextMenu bucket={bucket} onDeleteBucket={onDeleteBucket} />
        )
      }
    >
      <ResourceCard.Name
        testID={`bucket--card--name ${bucket.name}`}
        onClick={handleNameClick}
        name={bucket.name}
      />
      <BucketCardMeta bucket={bucket} />
      <BucketCardActions
        bucket={bucket}
        orgID={orgID}
        bucketType={bucket.type}
        onDeleteData={onDeleteData}
        onFilterChange={onFilterChange}
      />
    </ResourceCard>
  )
}

export default withRouter(BucketCard)
