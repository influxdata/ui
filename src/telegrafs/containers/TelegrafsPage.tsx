// Libraries
import React, {PureComponent} from 'react'
import {Route, Switch} from 'react-router-dom'

// Components
import {ErrorHandling} from 'src/shared/decorators/errors'
import LoadDataTabbedPage from 'src/settings/components/LoadDataTabbedPage'
import LoadDataHeader from 'src/settings/components/LoadDataHeader'
import Collectors from 'src/telegrafs/components/Collectors'
import GetResources from 'src/resources/components/GetResources'
import LimitChecker from 'src/cloud/components/LimitChecker'
import TelegrafUIRefreshWizard from 'src/dataLoaders/components/collectorsWizard/TelegrafUIRefreshWizard'
import {Page} from '@influxdata/clockface'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'

// Types
import {ResourceType} from 'src/types'

// Constant
import {ORGS, ORG_ID, TELEGRAFS} from 'src/shared/constants/routes'

const telegrafsPath = `/${ORGS}/${ORG_ID}/load-data/${TELEGRAFS}`

@ErrorHandling
class TelegrafsPage extends PureComponent {
  public render() {
    return (
      <>
        <Page titleTag={pageTitleSuffixer(['Telegraf', 'Load Data'])}>
          <LimitChecker>
            <LoadDataHeader />
            <LoadDataTabbedPage activeTab="telegrafs">
              <GetResources
                resources={[ResourceType.Buckets, ResourceType.Telegrafs]}
              >
                <Collectors />
              </GetResources>
            </LoadDataTabbedPage>
          </LimitChecker>
        </Page>
        <Switch>
          <Route
            path={`${telegrafsPath}/new`}
            component={TelegrafUIRefreshWizard}
          />
        </Switch>
      </>
    )
  }
}

export default TelegrafsPage
