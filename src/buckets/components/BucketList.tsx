// Libraries
import React, {PureComponent} from 'react'
import {withRouter, RouteComponentProps} from 'react-router-dom'
import memoizeOne from 'memoize-one'

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

interface Props {
  buckets: Bucket[]
  emptyState: JSX.Element
  onUpdateBucket: (b: OwnBucket) => void
  onFilterChange: (searchTerm: string) => void
  sortKey: string
  sortDirection: Sort
  sortType: SortTypes
}

class BucketList extends PureComponent<
  Props & RouteComponentProps<{orgID: string}>
> {
  private memGetSortedResources = memoizeOne<typeof getSortedResources>(
    getSortedResources
  )

  public render() {
    return (
      <ResourceList>
        <ResourceList.Body emptyState={this.props.emptyState}>
          {this.listBuckets}
        </ResourceList.Body>
      </ResourceList>
    )
  }

  private get listBuckets(): JSX.Element[] {
    const {
      buckets,
      sortKey,
      sortDirection,
      sortType,
      onFilterChange,
      onUpdateBucket,
    } = this.props
    const sortedBuckets = this.memGetSortedResources(
      buckets,
      sortKey,
      sortDirection,
      sortType
    )

    return sortedBuckets.map(bucket => {
      if (bucket.type === 'demodata') {
        return <DemoDataBucketCard key={bucket.id} bucket={bucket} />
      }
      return (
        <BucketCard
          key={bucket.id}
          bucket={bucket}
          onUpdateBucket={onUpdateBucket}
          onFilterChange={onFilterChange}
        />
      )
    })
  }
}

export default withRouter(BucketList)
