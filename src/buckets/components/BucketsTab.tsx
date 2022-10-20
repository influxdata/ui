// Libraries
import React, {createRef, PureComponent, RefObject} from 'react'
import {isEmpty} from 'lodash'
import {connect, ConnectedProps} from 'react-redux'
import {AutoSizer} from 'react-virtualized'

// Components
import {ErrorHandling} from 'src/shared/decorators/errors'
import {
  Columns,
  ComponentSize,
  EmptyState,
  Grid,
  Sort,
} from '@influxdata/clockface'
import {SearchWidget} from 'src/shared/components/search_widget/SearchWidget'
import TabbedPageHeader from 'src/shared/components/tabbed_page/TabbedPageHeader'
import {FilterListContainer} from 'src/shared/components/FilterList'
import BucketList from 'src/buckets/components/BucketList'
import AssetLimitAlert from 'src/cloud/components/AssetLimitAlert'
import BucketExplainer from 'src/buckets/components/BucketExplainer'
import ResourceSortDropdown from 'src/shared/components/resource_sort_dropdown/ResourceSortDropdown'
import CreateBucketButton from 'src/buckets/components/CreateBucketButton'

// Actions
import {
  createBucket,
  deleteBucket,
  getBucketSchema,
  updateBucket,
} from 'src/buckets/actions/thunks'

import {dismissOverlay, showOverlay} from 'src/overlays/actions/overlays'

import {checkBucketLimits as checkBucketLimitsAction} from 'src/cloud/actions/limits'

// Utils
import {getBucketLimitStatus} from 'src/cloud/utils/limits'
import {getAll} from 'src/resources/selectors'
import {SortTypes} from 'src/shared/utils/sort'

// Types
import {AppState, Bucket, OwnBucket, ResourceType} from 'src/types'
import {BucketSortKey} from 'src/shared/components/resource_sort_dropdown/generateSortItems'
import {CLOUD} from 'src/shared/constants'

// Constants
import {GLOBAL_HEADER_HEIGHT} from 'src/identity/components/GlobalHeader/constants'

interface State {
  searchTerm: string
  sortKey: BucketSortKey
  sortDirection: Sort
  sortType: SortTypes
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = ReduxProps

const DEFAULT_PAGINATION_CONTROL_HEIGHT = 62
const DEFAULT_TAB_NAVIGATION_HEIGHT = 62

const FilterBuckets = FilterListContainer<Bucket>()

@ErrorHandling
class BucketsTab extends PureComponent<Props, State> {
  private paginationRef: RefObject<HTMLDivElement>

  constructor(props: Props) {
    super(props)

    this.state = {
      searchTerm: '',
      sortKey: 'name',
      sortDirection: Sort.Ascending,
      sortType: SortTypes.String,
    }

    this.paginationRef = createRef<HTMLDivElement>()
  }

  public componentDidMount() {
    this.props.checkBucketLimits()

    const params = new URLSearchParams(window.location.search)

    let sortType: SortTypes = this.state.sortType
    let sortKey: BucketSortKey = 'name'
    if (params.get('sortKey') === 'readableRetention') {
      sortKey = 'readableRetention'
      sortType = SortTypes.Date
    }

    let sortDirection: Sort = this.state.sortDirection
    if (params.get('sortDirection') === Sort.Ascending) {
      sortDirection = Sort.Ascending
    } else if (params.get('sortDirection') === Sort.Descending) {
      sortDirection = Sort.Descending
    }

    let searchTerm: string = ''
    if (params.get('searchTerm') !== null) {
      searchTerm = params.get('searchTerm')
    }

    this.setState({sortKey, sortDirection, sortType, searchTerm})
  }

  public render() {
    const {buckets, limitStatus} = this.props
    const {searchTerm, sortKey, sortDirection, sortType} = this.state
    const leftHeaderItems = (
      <>
        <SearchWidget
          placeholderText="Filter buckets..."
          searchTerm={searchTerm}
          onSearch={this.handleFilterUpdate}
        />
        <ResourceSortDropdown
          resourceType={ResourceType.Buckets}
          sortDirection={sortDirection}
          sortKey={sortKey}
          sortType={sortType}
          onSelect={this.handleSort}
          width={238}
        />
      </>
    )

    const rightHeaderItems = (
      <>
        <CreateBucketButton />
      </>
    )

    return (
      <AutoSizer>
        {({width, height}) => {
          const heightWithPagination =
            this.paginationRef?.current?.clientHeight +
              DEFAULT_TAB_NAVIGATION_HEIGHT ||
            DEFAULT_PAGINATION_CONTROL_HEIGHT + DEFAULT_TAB_NAVIGATION_HEIGHT

          const adjustedHeight =
            height -
            heightWithPagination -
            (CLOUD ? GLOBAL_HEADER_HEIGHT : 60) -
            (limitStatus === 'exceeded' ? 100 : 0)

          return (
            <>
              <TabbedPageHeader
                childrenLeft={leftHeaderItems}
                childrenRight={rightHeaderItems}
                width={width}
              />

              <Grid style={{height: adjustedHeight, width}}>
                <Grid.Row>
                  <Grid.Column
                    widthXS={Columns.Twelve}
                    widthSM={Columns.Eight}
                    widthMD={Columns.Nine}
                    widthLG={Columns.Ten}
                  >
                    <FilterBuckets
                      searchTerm={searchTerm}
                      searchKeys={[
                        'id',
                        'labels[].name',
                        'name',
                        'readableRetention',
                      ]}
                      list={buckets}
                    >
                      {bs => (
                        <BucketList
                          buckets={bs}
                          bucketCount={buckets.length}
                          emptyState={this.emptyState}
                          onUpdateBucket={this.props.updateBucket}
                          onDeleteBucket={this.handleDeleteBucket}
                          onFilterChange={this.handleFilterUpdate}
                          onGetBucketSchema={this.handleShowBucketSchema}
                          pageHeight={adjustedHeight}
                          pageWidth={width}
                          sortKey={sortKey}
                          sortDirection={sortDirection}
                          sortType={sortType}
                          paginationRef={this.paginationRef}
                        />
                      )}
                    </FilterBuckets>
                    <AssetLimitAlert
                      resourceName="buckets"
                      limitStatus={limitStatus}
                      className="load-data--asset-alert"
                    />
                  </Grid.Column>
                  <Grid.Column
                    widthXS={Columns.Twelve}
                    widthSM={Columns.Four}
                    widthMD={Columns.Three}
                    widthLG={Columns.Two}
                  >
                    <BucketExplainer />
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </>
          )
        }}
      </AutoSizer>
    )
  }

  private handleSort = (
    sortKey: BucketSortKey,
    sortDirection: Sort,
    sortType: SortTypes
  ): void => {
    const url = new URL(location.href)
    url.searchParams.set('sortKey', sortKey)
    url.searchParams.set('sortDirection', sortDirection)
    history.replaceState(null, '', url.toString())

    this.setState({sortKey, sortDirection, sortType})
  }

  private handleDeleteBucket = ({id, name}: OwnBucket) => {
    this.props.deleteBucket(id, name)
  }

  private handleShowBucketSchema = async ({id, name}: OwnBucket) => {
    const schemaData = await this.props.getBucketSchema(id)
    const schema = schemaData?.measurementSchemas

    this.props.showOverlay(
      'bucket-schema-show',
      {schema, bucketName: name},
      this.props.dismissOverlay
    )
  }

  private handleFilterUpdate = (searchTerm: string): void => {
    const url = new URL(location.href)
    url.searchParams.set('searchTerm', searchTerm)
    history.replaceState(null, '', url.toString())
    this.setState({searchTerm})
  }

  private get emptyState(): JSX.Element {
    const {searchTerm} = this.state

    if (isEmpty(searchTerm)) {
      return (
        <EmptyState size={ComponentSize.Large}>
          <EmptyState.Text>
            Looks like there aren't any <b>Buckets</b>, why not create one?
          </EmptyState.Text>
          <CreateBucketButton />
        </EmptyState>
      )
    }

    return (
      <EmptyState size={ComponentSize.Large}>
        <EmptyState.Text>No Buckets match your query</EmptyState.Text>
      </EmptyState>
    )
  }
}

const mstp = (state: AppState) => {
  const buckets = getAll<Bucket>(state, ResourceType.Buckets)
  return {
    buckets,
    limitStatus: getBucketLimitStatus(state),
  }
}

const mdtp = {
  createBucket,
  updateBucket,
  deleteBucket,
  getBucketSchema,
  showOverlay,
  dismissOverlay,
  checkBucketLimits: checkBucketLimitsAction,
}

const connector = connect(mstp, mdtp)

export default connector(BucketsTab)
