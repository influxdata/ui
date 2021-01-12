// Libraries
import React, {Component} from 'react'
import {AppWrapper, Page} from '@influxdata/clockface'
import ErrorBoundary from '@honeybadger-io/react'

// Components
import Nav from 'src/billing/components/Nav/Nav'
import BillingPageContents from './BillingPageContents.jsx'
import HBContext from 'js/honeyBadgerContext.js'
import AppPageHeader from 'src/billing/components/AppPageHeader'
import AlertStatusCancelled from 'src/billing/components/Usage/AlertStatusCancelled'
import RateLimitAlert from 'src/billing/components/Notifications/RateLimitAlert'

class Billing extends Component {
  static contextType = HBContext
  render() {
    const {
      influxdbURL,
      organizationID,
      email,
      invoices,
      paymentMethods,
      account,
      accountType,
      orgLimits,
      ccPageParams,
      countries,
      states,
      contact,
      balanceThreshold,
      isNotify,
      notifyEmail,
      limitStatuses,
      region,
    } = this.props
    const isCancelled = accountType === 'cancelled'

    return (
      <>
        <AppWrapper>
          <Nav
            user={email}
            accountType={accountType}
            influxdbURL={influxdbURL}
            organizationID={organizationID}
            active="billing"
          />
          <Page titleTag="Billing">
            <AppPageHeader title="Billing">
              {!isCancelled && <RateLimitAlert />}
            </AppPageHeader>
            <Page.Contents scrollable={true}>
              {isCancelled && <AlertStatusCancelled />}
              <ErrorBoundary honeybadger={this.context}>
                {/* <BillingPageContext.Provider
                  value={{ccPageParams, contact, countries, states}}
                > */}
                <BillingPageContents />
                {/* </BillingPageContext.Provider> */}
              </ErrorBoundary>
            </Page.Contents>
          </Page>
        </AppWrapper>
      </>
    )
  }
}

export default Billing
