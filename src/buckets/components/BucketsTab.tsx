// Libraries
import React, {PureComponent} from 'react'
import {isEmpty} from 'lodash'
import {connect, ConnectedProps} from 'react-redux'
import Modal from 'react-modal'
// Components
import {ErrorHandling} from 'src/shared/decorators/errors'
import {
  Grid,
  ComponentSize,
  Sort,
  EmptyState,
  Columns,
} from '@influxdata/clockface'
import SearchWidget from 'src/shared/components/search_widget/SearchWidget'
import TabbedPageHeader from 'src/shared/components/tabbed_page/TabbedPageHeader'
import FilterList from 'src/shared/components/FilterList'
import BucketList from 'src/buckets/components/BucketList'
import AssetLimitAlert from 'src/cloud/components/AssetLimitAlert'
import BucketExplainer from 'src/buckets/components/BucketExplainer'
import DemoDataDropdown from 'src/buckets/components/DemoDataDropdown'
import {FeatureFlag} from 'src/shared/utils/featureFlag'
import ResourceSortDropdown from 'src/shared/components/resource_sort_dropdown/ResourceSortDropdown'
import CreateBucketButton from 'src/buckets/components/CreateBucketButton'
//import {usePortal} from "@influxdata/clockface";

// Actions
import {
  createBucket,
  updateBucket,
  deleteBucket,
  getBucketSchema,
} from 'src/buckets/actions/thunks'

import {showOverlay, dismissOverlay} from 'src/overlays/actions/overlays'

import {checkBucketLimits as checkBucketLimitsAction} from 'src/cloud/actions/limits'

// Utils
import {getBucketLimitStatus} from 'src/cloud/utils/limits'
import {getAll} from 'src/resources/selectors'
import {SortTypes} from 'src/shared/utils/sort'

// Types
import {AppState, Bucket, ResourceType, OwnBucket} from 'src/types'
import {BucketSortKey} from 'src/shared/components/resource_sort_dropdown/generateSortItems'
//import {ModalDialog} from "src/overlays/components/ModalDialog";

interface State {
  searchTerm: string
  sortKey: BucketSortKey
  sortDirection: Sort
  sortType: SortTypes
  showDialog: boolean
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = ReduxProps

const FilterBuckets = FilterList<Bucket>()

@ErrorHandling
class BucketsTab extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      searchTerm: '',
      sortKey: 'name',
      sortDirection: Sort.Ascending,
      sortType: SortTypes.String,
      showDialog: false,
    }
  }

  public componentDidMount() {
    this.props.checkBucketLimits()
  }

  private openModal = () => {
    this.setState({showDialog: true})
  }
  private closeModal = () => {
    this.setState({showDialog: false})
  }

  public render() {
    const {buckets, limitStatus} = this.props
    const {
      searchTerm,
      sortKey,
      sortDirection,
      sortType,
      showDialog,
    } = this.state

    const customStyle = {
      content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        zIndex: 9400,
      },
      overlay: {
        zIndex: 9399,
      },
    }
    //{height:400, width:200, position:'absolute', left: 400, top:200}
    const modalAck = (
      <Modal
        isOpen={showDialog}
        onRequestClose={this.closeModal}
        contentLabel="Example Modal"
        style={customStyle}
      >
        <h2>Hello</h2>
        <button onClick={this.closeModal}>close</button>
        <div>I am a modal</div>
        <form>
          <input />
          <button>tab navigation</button>
          <button>stays</button>
          <button>inside</button>
          <button>the modal</button>
        </form>
      </Modal>
    )

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
        <FeatureFlag name="demodata">
          <DemoDataDropdown />
        </FeatureFlag>
        <CreateBucketButton />
      </>
    )

    return (
      <>
        <TabbedPageHeader
          childrenLeft={leftHeaderItems}
          childrenRight={rightHeaderItems}
        />
        <Grid>
          <Grid.Row>
            <Grid.Column
              widthXS={Columns.Twelve}
              widthSM={Columns.Eight}
              widthMD={Columns.Ten}
            >
              <FilterBuckets
                searchTerm={searchTerm}
                searchKeys={['name', 'readableRetention', 'labels[].name']}
                list={buckets}
              >
                {bs => (
                  <BucketList
                    buckets={bs}
                    emptyState={this.emptyState}
                    onUpdateBucket={this.props.updateBucket}
                    onDeleteBucket={this.handleDeleteBucket}
                    onFilterChange={this.handleFilterUpdate}
                    onGetBucketSchema={this.handleShowBucketSchema}
                    sortKey={sortKey}
                    sortDirection={sortDirection}
                    sortType={sortType}
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
              widthMD={Columns.Two}
            >
              <BucketExplainer />
            </Grid.Column>
          </Grid.Row>
        </Grid>
        {modalAck}
      </>
    )
  }

  private handleSort = (
    sortKey: BucketSortKey,
    sortDirection: Sort,
    sortType: SortTypes
  ): void => {
    this.setState({sortKey, sortDirection, sortType})
  }

  private handleDeleteBucket = ({id, name}: OwnBucket) => {
    this.props.deleteBucket(id, name)
  }

  private handleShowBucketSchema = async ({id, name}: OwnBucket) => {
    const schemaData = await this.props.getBucketSchema(id)
    const schema = schemaData?.measurementSchemas

    console.log('arghh; showing schema stuff?', schema, name)

    this.openModal()
    /** */
    //const contents = <ModalDialog/>
    // const {addElementToPortal} = usePortal()

    //addElementToPortal(contents)
    // this.props.showOverlay(
    //   'bucket-schema-show',
    //   {schema, bucketName: name},
    //   this.props.dismissOverlay
    // )
  }

  private handleFilterUpdate = (searchTerm: string): void => {
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
