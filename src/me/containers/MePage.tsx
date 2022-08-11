// Libraries
import React, {PureComponent} from 'react'
import {connect, ConnectedProps} from 'react-redux'

// Components
import {
  Panel,
  FlexBox,
  FlexDirection,
  ComponentSize,
  AlignItems,
  Grid,
  Columns,
  Page,
  Button,
  ComponentColor,
} from '@influxdata/clockface'
import Resources from 'src/me/components/Resources'
import PinnedItems from 'src/me/components/PinnedItems'
import GettingStarted from 'src/me/components/GettingStarted'
import RateLimitAlert from 'src/cloud/components/RateLimitAlert'
import AlertsActivity from 'src/me/components/AlertsActivity'
// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'
import {getOrg} from 'src/organizations/selectors'
import {notify} from 'src/shared/actions/notifications'
import {shouldShowUpgradeButton} from 'src/me/selectors'
// Types
import {AppState} from 'src/types'

// Decorators
import {ErrorHandling} from 'src/shared/decorators/errors'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

import {getUserWriteLimitHits} from 'src/cloud/components/onboarding/useGetUserStatus'
import {writeLimitReached} from 'src/shared/copy/notifications'

// Components
import {UpgradeContent} from 'src/cloud/components/RateLimitAlertContent'
import {dismissOverlay, showOverlay} from 'src/overlays/actions/overlays'
import {CLOUD} from 'src/shared/constants'

// Context
import PinnedItemsProvider from 'src/shared/contexts/pinneditems'
import UsageProvider from 'src/usage/context/usage'

const QUERY_WRITE_LIMIT_HITS = 100

type ReduxProps = ConnectedProps<typeof connector>
type Props = ReduxProps

let hasCalled = false // We only want to show the write limit notification once

@ErrorHandling
export class MePage extends PureComponent<Props> {
  async componentDidMount() {
    if (isFlagEnabled('newUsageAPI') && !hasCalled && CLOUD) {
      const hits = await getUserWriteLimitHits(this.props.orgID)
      hasCalled = true
      if (hits > QUERY_WRITE_LIMIT_HITS) {
        if (this.props.shouldUpgrade) {
          this.props.sendNotify(
            writeLimitReached(
              '',
              <UpgradeContent
                type="write"
                link="https://docs.influxdata.com/influxdb/v2.0/write-data/best-practices/optimize-writes/"
                className="flex-upgrade-content"
                limitText={`${hits} times in the last hour`}
              />,
              Infinity
            )
          )
        } else {
          this.props.sendNotify(
            writeLimitReached(
              `Data in has stopped because you've hit the query write limit ${hits} times in the last hour. Let's get it flowing again: `,
              <Button
                className="rate-alert-overlay-button"
                color={ComponentColor.Primary}
                size={ComponentSize.Small}
                onClick={this.appearOverlay}
                text="Request Write Limit Increase"
              />,
              Infinity
            )
          )
        }
      }
    }
  }

  private appearOverlay = () => {
    this.props.handleShowOverlay(
      'write-limit',
      null,
      this.props.handleHideOverlay
    )
  }
  public render() {
    return (
      <Page titleTag={pageTitleSuffixer(['Home'])}>
        <Page.Header fullWidth={false}>
          <Page.Title title="Getting Started" testID="home-page--header" />
          <RateLimitAlert location="me page" />
        </Page.Header>
        <Page.Contents fullWidth={false} scrollable={true}>
          <Grid>
            <Grid.Row>
              <Grid.Column widthSM={Columns.Eight} widthMD={Columns.Nine}>
                <FlexBox
                  direction={FlexDirection.Column}
                  margin={ComponentSize.Small}
                  alignItems={AlignItems.Stretch}
                  stretchToFitWidth={true}
                  testID="getting-started"
                >
                  <Panel>
                    <Panel.Body>
                      <GettingStarted />
                    </Panel.Body>
                  </Panel>
                  {isFlagEnabled('pinnedItems') && CLOUD && (
                    <PinnedItemsProvider>
                      <PinnedItems />
                    </PinnedItemsProvider>
                  )}
                  {isFlagEnabled('alertsActivity') && <AlertsActivity />}
                </FlexBox>
              </Grid.Column>
              <Grid.Column widthSM={Columns.Four} widthMD={Columns.Three}>
                {CLOUD ? (
                  <UsageProvider>
                    <Resources />
                  </UsageProvider>
                ) : (
                  <Resources />
                )}
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Page.Contents>
      </Page>
    )
  }
}

const mstp = (state: AppState) => {
  const {me} = state
  const {id} = getOrg(state)
  const shouldUpgrade = shouldShowUpgradeButton(state)

  return {me, orgID: id, shouldUpgrade}
}

const mdtp = {
  sendNotify: notify,
  handleShowOverlay: showOverlay,
  handleHideOverlay: dismissOverlay,
}
const connector = connect(mstp, mdtp)

export default connector(MePage)
