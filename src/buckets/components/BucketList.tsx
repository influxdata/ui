// Libraries
import React, {PureComponent} from 'react'
import {withRouter, RouteComponentProps} from 'react-router-dom'
import memoizeOne from 'memoize-one'

// Components
import BucketCard from 'src/buckets/components/BucketCard'
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
  onDeleteBucket: (b: OwnBucket) => void
  onGetBucketSchema: (b: OwnBucket) => void
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
      onDeleteBucket,
      onFilterChange,
      onUpdateBucket,
      onGetBucketSchema,
    } = this.props
   
    const sortedBuckets = this.memGetSortedResources(
      buckets,
      sortKey,
      sortDirection,
      sortType,
      
    )
    const userBuckets = []
    const systemBuckets = []
    sortedBuckets.forEach(bucket => {
      if(bucket.type === 'user') {
        userBuckets.push(bucket)
      }else {
        systemBuckets.push(bucket)
      }
    })
    const userAndSystemBuckets = [...userBuckets, ...systemBuckets]

    return userAndSystemBuckets.map(bucket => {
      return (
        <BucketCard
          key={bucket.id}
          bucket={bucket}
          onDeleteBucket={onDeleteBucket}
          onUpdateBucket={onUpdateBucket}
          onFilterChange={onFilterChange}
          onGetBucketSchema={onGetBucketSchema}
        />
      )
    })
  }
}

export default withRouter(BucketList)
