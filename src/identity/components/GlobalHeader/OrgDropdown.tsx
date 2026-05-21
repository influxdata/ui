// Libraries
import React, {FC, useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'

// Components
import {IconFont, RemoteDataState} from '@influxdata/clockface'
import {
  GlobalHeaderDropdown,
  MainMenuItem,
  TypeAheadMenuItem,
} from 'src/identity/components/GlobalHeader/GlobalHeaderDropdown'

// Types
import {OrganizationSummaries} from 'src/client/unityRoutes'

// Constants
import {CLOUD_URL} from 'src/shared/constants'

// Eventing
import {
  HeaderNavEvent,
  MainMenuEventPrefix,
  multiOrgTag,
  TypeAheadEventPrefix,
} from 'src/identity/events/multiOrgEvents'
import {event} from 'src/cloud/utils/reporting'

// Thunks
import {getOrgCreationAllowancesThunk} from 'src/identity/allowances/actions/thunks'

// Selectors
import {
  selectCurrentAccount,
  selectOrgCreationAllowance,
  selectOrgCreationAllowanceStatus,
  selectOrgCreationAvailableUpgrade,
  selectUser,
} from 'src/identity/selectors'
import {CreateOrganizationMenuItem} from 'src/identity/components/GlobalHeader/GlobalHeaderDropdown/CreateOrganization/MenuItem'
import {dismissOverlay, showOverlay} from 'src/overlays/actions/overlays'

type OrgSummaryItem = OrganizationSummaries[number]

interface Props {
  activeOrg: OrgSummaryItem
  orgsList: OrganizationSummaries
}

const menuStyle = {width: '250px', padding: '16px'}
const orgDropdownStyle = {width: 'auto'}

export const OrgDropdown: FC<Props> = ({activeOrg, orgsList}) => {
  const orgCreationAllowed = useSelector(selectOrgCreationAllowance)
  const availableUpgrade = useSelector(selectOrgCreationAvailableUpgrade)
  const orgCreationAllowanceStatus = useSelector(
    selectOrgCreationAllowanceStatus
  )
  const user = useSelector(selectUser)
  const account = useSelector(selectCurrentAccount)

  const dispatch = useDispatch()

  const openMarketoOverlay = () => {
    event(HeaderNavEvent.UpgradeButtonClick, multiOrgTag, {
      accountId: account.id,
      accountName: account.name,
      accountType: account.type,
      userId: user.id,
    })
    dispatch(
      showOverlay('marketo-upgrade-account-overlay', null, () =>
        dispatch(dismissOverlay())
      )
    )
  }

  useEffect(() => {
    if (orgCreationAllowanceStatus === RemoteDataState.NotStarted) {
      dispatch(getOrgCreationAllowancesThunk())
    }
  }, [dispatch, orgCreationAllowanceStatus])

  const switchOrg = (org: TypeAheadMenuItem) => {
    event(HeaderNavEvent.OrgSwitch, multiOrgTag, {
      oldOrgID: activeOrg.id,
      oldOrgName: activeOrg.name,
      newOrgID: org.id,
      newOrgName: org.name,
    })
    window.location.href = `${CLOUD_URL}/orgs/${org.id}`
  }

  const orgMainMenu: MainMenuItem[] = [
    {
      name: 'Settings',
      iconFont: IconFont.CogSolid_New,
      href: `/orgs/${activeOrg.id}/org-settings`,
    },
    {
      name: 'Members',
      iconFont: IconFont.Group,
      href: `/orgs/${activeOrg.id}/members`,
    },
    {
      name: 'Usage',
      iconFont: IconFont.PieChart,
      href: `/orgs/${activeOrg.id}/usage`,
    },
  ]

  if (
    !orgCreationAllowed &&
    (availableUpgrade === 'pay_as_you_go' || availableUpgrade === 'contract')
  ) {
    const upgradeAccountMenuItem: MainMenuItem = {
      name: 'Add More Organizations',
      iconFont: IconFont.CrownSolid_New,
      className: 'upgrade-payg-add-org--button',
      showDivider: true,
    }

    if (availableUpgrade === 'pay_as_you_go') {
      upgradeAccountMenuItem.href = '/checkout'
    } else {
      upgradeAccountMenuItem.onClick = openMarketoOverlay
    }

    orgMainMenu.push(upgradeAccountMenuItem)
  }

  const sendDropdownClickEvent = () => {
    event(HeaderNavEvent.OrgDropdownClick, multiOrgTag)
  }

  const additionalHeaderItems = []
  if (orgCreationAllowed) {
    additionalHeaderItems.push(
      <CreateOrganizationMenuItem key="CreateOrgMenuItem" />
    )
  }

  return (
    <div onClick={sendDropdownClickEvent}>
      <GlobalHeaderDropdown
        dropdownMenuStyle={menuStyle}
        mainMenuEventPrefix={MainMenuEventPrefix.SwitchOrg}
        mainMenuHeaderIcon={IconFont.Switch_New}
        mainMenuHeaderText="Switch Organization"
        mainMenuOptions={orgMainMenu}
        mainMenuTestID="globalheader--org-dropdown-main"
        style={orgDropdownStyle}
        testID="globalheader--org-dropdown"
        typeAheadEventPrefix={TypeAheadEventPrefix.HeaderNavSearchOrg}
        typeAheadInputPlaceholder="Search Organizations"
        typeAheadMenuOptions={orgsList}
        typeAheadOnSelectOption={switchOrg}
        typeAheadSelectedOption={activeOrg}
        typeAheadTestID="globalheader--org-dropdown-typeahead"
        additionalHeaderItems={additionalHeaderItems}
      />
    </div>
  )
}
