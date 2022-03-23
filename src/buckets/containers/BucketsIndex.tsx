// Libraries
import React, {Component} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Switch, Route} from 'react-router-dom'

import {Page, SpinnerContainer, TechnoSpinner} from '@influxdata/clockface'

// Components
import {ErrorHandling} from 'src/shared/decorators/errors'
import LoadDataTabbedPage from 'src/settings/components/LoadDataTabbedPage'
import LoadDataHeader from 'src/settings/components/LoadDataHeader'
import BucketsTab from 'src/buckets/components/BucketsTab'
import GetAssetLimits from 'src/cloud/components/GetAssetLimits'
import LimitChecker from 'src/cloud/components/LimitChecker'
import CollectorsWizard from 'src/dataLoaders/components/collectorsWizard/CollectorsWizard'
import UpdateBucketOverlay from 'src/buckets/components/createBucketForm/UpdateBucketOverlay'
import RenameBucketOverlay from 'src/buckets/components/RenameBucketOverlay'
import CreateScraperOverlay from 'src/scrapers/components/CreateScraperOverlay'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'

// Types
import {AppState, ResourceType} from 'src/types'

// Actions
import {getBuckets} from 'src/buckets/actions/thunks'
import {getLabels} from 'src/labels/actions/thunks'
import {getTelegrafs} from 'src/telegrafs/actions/thunks'

// Selectors
import {getResourcesStatus} from 'src/resources/selectors/getResourcesStatus'

const bucketsPath = '/orgs/:orgID/load-data/buckets/:bucketID'

type ReduxProps = ConnectedProps<typeof connector>
type Props = ReduxProps

@ErrorHandling
class BucketsIndex extends Component<Props> {
  public componentDidMount() {
    this.props.getBuckets()
    this.props.getLabels()
    this.props.getTelegrafs()
  }

  public render() {
    return (
      <SpinnerContainer
        loading={this.props.remoteDataState}
        spinnerComponent={<TechnoSpinner />}
      >
        <Page titleTag={pageTitleSuffixer(['Buckets', 'Load Data'])}>
          <LimitChecker>
            <LoadDataHeader />
            <LoadDataTabbedPage activeTab="buckets">
              <GetAssetLimits>
                <BucketsTab />
              </GetAssetLimits>
            </LoadDataTabbedPage>
          </LimitChecker>
        </Page>
        <Switch>
          <Route
            path={`${bucketsPath}/telegrafs/new`}
            component={CollectorsWizard}
          />
          <Route
            path={`${bucketsPath}/scrapers/new`}
            component={CreateScraperOverlay}
          />
          <Route path={`${bucketsPath}/edit`} component={UpdateBucketOverlay} />
          <Route
            path={`${bucketsPath}/rename`}
            component={RenameBucketOverlay}
          />
        </Switch>
      </SpinnerContainer>
    )
  }
}

const mstp = (state: AppState) => {
  const remoteDataState = getResourcesStatus(state, [
    ResourceType.Buckets,
    ResourceType.Labels,
    ResourceType.Telegrafs,
  ])
  return {remoteDataState}
}

const mdtp = {
  getBuckets,
  getLabels,
  getTelegrafs,
}

const connector = connect(mstp, mdtp)

export default connector(BucketsIndex)
