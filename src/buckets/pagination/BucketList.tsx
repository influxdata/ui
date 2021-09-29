// Libraries
import React, {PureComponent, RefObject} from 'react'
import {withRouter, RouteComponentProps} from 'react-router-dom'
import memoizeOne from 'memoize-one'

// Components
import BucketCard from 'src/buckets/components/BucketCard'
import DemoDataBucketCard from 'src/buckets/components/DemoDataBucketCard'
import {ResourceList} from '@influxdata/clockface'

// Selectors
import {getSortedResources} from 'src/shared/utils/sort'

// Types
import {Bucket, OwnBucket, Pageable} from 'src/types'
import {PaginationNav, Sort} from '@influxdata/clockface'

// Utils
import {SortTypes} from 'src/shared/utils/sort'

interface Props {
  buckets: Bucket[]
  bucketCount: number
  emptyState: JSX.Element
  onUpdateBucket: (b: OwnBucket) => void
  onDeleteBucket: (b: OwnBucket) => void
  onGetBucketSchema: (b: OwnBucket) => void
  onFilterChange: (searchTerm: string) => void
  pageHeight: number
  pageWidth: number
  paginationRef: RefObject<HTMLDivElement>
  sortKey: string
  sortDirection: Sort
  sortType: SortTypes
}

class BucketList
  extends PureComponent<Props & RouteComponentProps<{orgID: string}>>
  implements Pageable {
  private memGetSortedResources = memoizeOne<typeof getSortedResources>(
    getSortedResources
  )

  public currentPage: number = 1
  public rowsPerPage: number = 10
  public totalPages: number

  public render() {
    this.totalPages = Math.ceil(this.props.bucketCount / this.rowsPerPage)

    return (
      <>
        <ResourceList>
          <ResourceList.Body
            emptyState={this.props.emptyState}
            style={{
              maxHeight: this.props.pageHeight,
              minHeight: this.props.pageHeight,
              overflow: 'scroll',
            }}
          >
            {this.listBuckets}
          </ResourceList.Body>
        </ResourceList>
        <PaginationNav.PaginationNav
          ref={this.props.paginationRef}
          style={{width: this.props.pageWidth}}
          totalPages={this.totalPages}
          currentPage={this.currentPage}
          pageRangeOffset={1}
          onChange={this.paginate}
        />
      </>
    )
  }

  public paginate = page => {
    this.currentPage = page
    this.forceUpdate()
  }

  private get listBuckets(): JSX.Element[] {
    const {
      onDeleteBucket,
      onFilterChange,
      onUpdateBucket,
      onGetBucketSchema,
    } = this.props

    const sortedBuckets = this.memGetSortedResources(
      this.props.buckets,
      this.props.sortKey,
      this.props.sortDirection,
      this.props.sortType
    )

    const startIndex = this.rowsPerPage * Math.max(this.currentPage - 1, 0)
    const endIndex = Math.min(
      startIndex + this.rowsPerPage,
      this.props.bucketCount
    )

    const buckets = []
    for (let i = startIndex; i < endIndex; i++) {
      const bucket = sortedBuckets[i]
      if (bucket) {
        if (bucket.type === 'demodata') {
          buckets.push(<DemoDataBucketCard key={bucket.id} bucket={bucket} />)
          continue
        }

        buckets.push(
          <BucketCard
            key={bucket.id}
            bucket={bucket}
            onDeleteBucket={onDeleteBucket}
            onUpdateBucket={onUpdateBucket}
            onFilterChange={onFilterChange}
            onGetBucketSchema={onGetBucketSchema}
          />
        )
      }
    }

    return buckets
  }
}

export default withRouter(BucketList)
