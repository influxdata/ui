// Libraries
import React, {FC} from 'react'
import {Link} from 'react-router-dom'
import {connect, ConnectedProps} from 'react-redux'

// Components
import {TreeNav} from '@influxdata/clockface'
import CloudExclude from 'src/shared/components/cloud/CloudExclude'
import CloudOnly from 'src/shared/components/cloud/CloudOnly'

// Actions
import {showOverlay, dismissOverlay} from 'src/overlays/actions/overlays'

// Types
import {AppState} from 'src/types'

// Selectors
import {getOrg} from 'src/organizations/selectors'
import {getNavItemActivation} from '../utils'

// Utils
import {CLOUD} from 'src/shared/constants'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

type ReduxProps = ConnectedProps<typeof connector>
type Props = ReduxProps

const UserWidget: FC<Props> = ({
  org,
  me,
  handleShowOverlay,
  handleDismissOverlay,
}) => {
  if (!org) {
    return null
  }

  const handleSwitchOrganizations = (): void => {
    handleShowOverlay('switch-organizations', {}, handleDismissOverlay)
  }

  const orgPrefix = `/orgs/${org.id}`

  if (CLOUD && isFlagEnabled('multiOrg')) {
    return null
  }

  return (
    <TreeNav.User username={me.name} team={org.name} testID="user-nav">
      <CloudOnly>
        <TreeNav.SubHeading label="Account" />
        <TreeNav.UserItem
          id="account"
          label="Settings"
          testID="user-account-switching-page"
          linkElement={className => (
            <Link className={className} to={`${orgPrefix}/accounts/settings`} />
          )}
        />
        <TreeNav.UserItem
          id="billing"
          label="Billing"
          testID="user-nav-item-billing"
          linkElement={className => (
            <Link className={className} to={`${orgPrefix}/billing`} />
          )}
        />
        <TreeNav.SubHeading label="Organization" />
        <TreeNav.UserItem
          id="about"
          label="Settings"
          testID="user-nav-item-about"
          linkElement={className => (
            <Link className={className} to={`${orgPrefix}/org-settings`} />
          )}
        />
        <TreeNav.UserItem
          id="users"
          label="Members"
          testID="user-nav-item-users"
          linkElement={className => (
            <Link className={className} to={`${orgPrefix}/members`} />
          )}
        />
        <TreeNav.UserItem
          id="usage"
          label="Usage"
          testID="user-nav-item-usage"
          linkElement={className => (
            <Link className={className} to={`${orgPrefix}/usage`} />
          )}
        />
        )}
      </CloudOnly>
      <CloudExclude>
        <TreeNav.UserItem
          id="members"
          label="Members"
          testID="user-nav-item-members"
          active={getNavItemActivation(['members'], location.pathname)}
          linkElement={className => (
            <Link className={className} to={`${orgPrefix}/members`} />
          )}
        />
        <TreeNav.UserItem
          id="about"
          label="About"
          testID="user-nav-item-about"
          active={getNavItemActivation(['about'], location.pathname)}
          linkElement={className => (
            <Link className={className} to={`${orgPrefix}/about`} />
          )}
        />
        <TreeNav.UserItem
          id="switch-orgs"
          label="Switch Organizations"
          testID="user-nav-item-switch-orgs"
          onClick={handleSwitchOrganizations}
        />
        <TreeNav.UserItem
          id="create-org"
          label="Create Organization"
          testID="user-nav-item-create-orgs"
          linkElement={className => (
            <Link className={className} to="/orgs/new" />
          )}
        />
      </CloudExclude>
      <TreeNav.SubHeading label={me.name} lowercase={true} />
      <TreeNav.UserItem
        id="logout"
        label="Logout"
        testID="user-nav-item-logout"
        linkElement={className => <Link className={className} to="/logout" />}
      />
    </TreeNav.User>
  )
}

const mstp = (state: AppState) => {
  const org = getOrg(state)
  const me = state.me
  return {org, me}
}

const mdtp = {
  handleShowOverlay: showOverlay,
  handleDismissOverlay: dismissOverlay,
}

const connector = connect(mstp, mdtp)
export default connector(UserWidget)
