// Libraries
import React, {FC, useCallback, useMemo} from 'react'
import {useHistory} from 'react-router-dom'
import {useSelector} from 'react-redux'

// Components
import BucketCard from 'src/buckets/components/BucketCard'
import DemoDataBucketCard from 'src/buckets/components/DemoDataBucketCard'
import {ResourceList} from '@influxdata/clockface'

// Selectors
import {getSortedResources} from 'src/shared/utils/sort'

// Types
import {Bucket, OwnBucket} from 'src/types'
import {Sort} from '@influxdata/clockface'

// Utils
import {SortTypes} from 'src/shared/utils/sort'
import {getOrg} from 'src/organizations/selectors'

interface Props {
  buckets: Bucket[]
  emptyState: JSX.Element
  onUpdateBucket: (b: OwnBucket) => void
  onDeleteBucket: (b: OwnBucket) => void
  onFilterChange: (searchTerm: string) => void
  sortKey: string
  sortDirection: Sort
  sortType: SortTypes
}

const BucketList: FC<Props> = ({
  emptyState,
  buckets,
  sortKey,
  sortDirection,
  sortType,
  onDeleteBucket,
  onFilterChange,
  onUpdateBucket,
}) => {
  const org = useSelector(getOrg)
  const history = useHistory()
  const handleStartDeleteData = useCallback(
    (bucket: OwnBucket) => {
      history.push(`/orgs/${org.id}/load-data/buckets/${bucket.id}/delete-data`)
    },
    [history, org.id]
  )

  const bucketList = useMemo(
    () =>
      getSortedResources(buckets, sortKey, sortDirection, sortType).map(
        bucket => {
          if (bucket.type === 'demodata') {
            return <DemoDataBucketCard key={bucket.id} bucket={bucket} />
          }

          return (
            <BucketCard
              key={bucket.id}
              bucket={bucket}
              onDeleteBucket={onDeleteBucket}
              onDeleteData={handleStartDeleteData}
              onUpdateBucket={onUpdateBucket}
              onFilterChange={onFilterChange}
            />
          )
        }
      ),
    [buckets, sortKey, sortDirection, sortType]
  )

  return (
    <ResourceList>
      <ResourceList.Body emptyState={emptyState}>
        {bucketList}
      </ResourceList.Body>
    </ResourceList>
  )
}

export default BucketList
