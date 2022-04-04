// Libraries
import React, {FC} from 'react'
import {Link} from 'react-router-dom'
import {connect, ConnectedProps} from 'react-redux'

// Components
import {TreeNav, Icon, IconFont} from '@influxdata/clockface'
import CloudExclude from 'src/shared/components/cloud/CloudExclude'
import CloudOnly from 'src/shared/components/cloud/CloudOnly'

// Actions
import {showOverlay, dismissOverlay} from 'src/overlays/actions/overlays'

// Types
import {AppState} from 'src/types'

// Selectors
import {getOrg} from 'src/organizations/selectors'
import {getNavItemActivation} from '../utils'

type ReduxProps = ConnectedProps<typeof connector>
type Props = ReduxProps

const SupportList: FC<Props> = ({
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

  //   const orgPrefix = `/orgs/${org.id}`

  return (
    // <TreeNav.User username={me.name} team={org.name} testID="user-nav">

    <TreeNav.User username="Help & Support" team="Help">
      <TreeNav.SubHeading label="Account" />
      <TreeNav.UserItem
        id="billing"
        label="Billing"
        testID="user-nav-item-billing"
        linkElement={className => <Link className={className} to={``} />}
      />
      <TreeNav.UserItem
        id="account"
        label="Settings"
        testID="user-account-switching-page"
        linkElement={className => <Link className={className} to={``} />}
      />
      <TreeNav.SubHeading label="Organization" />
      <TreeNav.UserItem
        id="users"
        label="Members"
        testID="user-nav-item-users"
        linkElement={className => <Link className={className} to={``} />}
      />
      <TreeNav.UserItem
        id="about"
        label="Settings"
        testID="user-nav-item-about"
        linkElement={className => <Link className={className} to={``} />}
      />
      <TreeNav.UserItem
        id="usage"
        label="Usage"
        testID="user-nav-item-usage"
        linkElement={className => <Link className={className} to={``} />}
      />
      {/* </CloudOnly> */}
      {/* <CloudExclude> */}

      {/* // </TreeNav.User> */}
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
export default connector(SupportList)
