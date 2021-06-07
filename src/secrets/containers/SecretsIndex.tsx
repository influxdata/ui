// Libraries
import React, {Component} from 'react'
import {connect} from 'react-redux'

// Components
import {ErrorHandling} from 'src/shared/decorators/errors'
import SettingsTabbedPage from 'src/settings/components/SettingsTabbedPage'
import SettingsHeader from 'src/settings/components/SettingsHeader'
import {Page} from '@influxdata/clockface'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'

// Types
import {AppState, Organization} from 'src/types'

interface StateProps {
    org: Organization
}

@ErrorHandling
class SecretsIndex extends Component<StateProps> {
    public render() {
        const {org} = this.props

        return (
            <>
                <Page titleTag={pageTitleSuffixer(['Secrets', 'Settings'])}>
                    <SettingsHeader />
                    <SettingsTabbedPage activeTab="secrets" orgID={org.id}>
                        <div>Placeholder</div>
                    </SettingsTabbedPage>
                </Page>
            </>
        )
    }
}

const mstp = (state: AppState) => {
    return {org: state.resources.orgs.org}
}

export default connect<StateProps>(mstp)(SecretsIndex)