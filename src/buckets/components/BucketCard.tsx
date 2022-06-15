// Libraries
import React, {FC} from 'react'
import {useHistory, useParams} from 'react-router-dom'

// Components
import {ResourceCard} from '@influxdata/clockface'
import BucketContextMenu from 'src/buckets/components/BucketContextMenu'
import BucketCardMeta from 'src/buckets/components/BucketCardMeta'
import BucketCardActions from 'src/buckets/components/BucketCardActions'

// Constants
import {isSystemBucket} from 'src/buckets/constants/index'
import {PROJECT_NAME} from 'src/flows'

// Utils
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

// Types
import {OwnBucket} from 'src/types'

interface Props {
  bucket: OwnBucket
  onDeleteBucket: (b: OwnBucket) => void
  onUpdateBucket: (b: OwnBucket) => void
  onGetBucketSchema: (b: OwnBucket) => void
  onFilterChange: (searchTerm: string) => void
}

const BucketCard: FC<Props> = ({
  bucket,
  onDeleteBucket,
  onFilterChange,
  onGetBucketSchema,
}) => {
  const history = useHistory()
  const {orgID} = useParams<{orgID: string}>()
  const handleNameClick = () => {
    if (isFlagEnabled('exploreWithFlows')) {
      history.push(
        `/${PROJECT_NAME.toLowerCase()}/from/bucket/${bucket.name}/${bucket.id}`
      )
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
        bucketType={bucket.type}
        onFilterChange={onFilterChange}
        onGetSchema={onGetBucketSchema}
      />
    </ResourceCard>
  )
}

export default BucketCard
