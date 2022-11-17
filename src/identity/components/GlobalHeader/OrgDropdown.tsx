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

// Utils
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

// Selectors
import {
  selectOrgCreationAllowance,
  selectOrgCreationAllowanceStatus,
  selectOrgCreationAvailableUpgrade,
} from 'src/identity/selectors'
import {CreateOrganizationMenuItem} from 'src/identity/components/GlobalHeader/GlobalHeaderDropdown/CreateOrganization/MenuItem'

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

  const dispatch = useDispatch()

  useEffect(() => {
    if (
      isFlagEnabled('createDeleteOrgs') &&
      orgCreationAllowanceStatus === RemoteDataState.NotStarted
    ) {
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
    isFlagEnabled('createDeleteOrgs') &&
    !orgCreationAllowed &&
    availableUpgrade !== 'none'
  ) {
    orgMainMenu.push({
      name: 'Add More Organizations',
      iconFont: IconFont.CrownSolid_New,
      href: '/checkout',
      className: 'upgrade-payg-add-org--button',
      showDivider: true,
    })
  }

  const sendDropdownClickEvent = () => {
    event(HeaderNavEvent.OrgDropdownClick, multiOrgTag)
  }

  const additionalHeaderItems = []
  if (isFlagEnabled('createDeleteOrgs') && orgCreationAllowed) {
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
