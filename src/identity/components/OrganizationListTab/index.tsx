// Libraries
import React, {FC, useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {
  FlexBox,
  FlexDirection,
  ResourceList,
  Sort,
  PaginationNav,
} from '@influxdata/clockface'
import {cloneDeep} from 'lodash'

// Components
import {NoOrgsState} from 'src/identity/components/OrganizationListTab/NoOrgsState'
import {OrganizationCard} from 'src/identity/components/OrganizationListTab/OrganizationCard'
import {OrgBannerPanel} from 'src/identity/components/OrganizationListTab/OrgBannerPanel'
import {OrgListDropdown} from 'src/identity/components/OrganizationListTab/OrgListDropDown'
import SearchWidget from 'src/shared/components/search_widget/SearchWidget'

// API
import {fetchOrgCreationAllowance} from 'src/identity/apis/org'
import {getQuartzOrganizationsThunk} from 'src/identity/quartzOrganizations/actions/thunks'

// Selectors
import {
  selectCurrentAccountId,
  selectQuartzOrgsContents,
  selectQuartzOrgsStatus,
} from 'src/identity/selectors'

// Constants
import {
  orgListSortMethods,
  OrgListSortMethod,
} from 'src/identity/components/OrganizationListTab/OrgListMenuOptions'
import {GLOBAL_HEADER_HEIGHT} from 'src/identity/components/GlobalHeader/constants'

// Notifications
import {notify} from 'src/shared/actions/notifications'
import {fetchOrgAllowanceFailed} from 'src/cloud/notifications/account-settings-notifications'

// Types
import {RemoteDataState} from 'src/types'

// Test to be removed
// import {testOrgs} from 'src/identity/components/OrganizationListTab/testorgs'

// Style
import './OrganizationListTab.scss'

interface Props {
  height: number
}

export const OrganizationListTab: FC<Props> = ({height}) => {
  const dispatch = useDispatch()

  // Selectors
  const currentAccountId = useSelector(selectCurrentAccountId)
  const orgsInAccount = useSelector(selectQuartzOrgsContents)
  // const orgsInAccount = testOrgs
  const orgsLoadedStatus = useSelector(selectQuartzOrgsStatus)

  // Component State
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortMethod, setSortMethod] = useState(orgListSortMethods[0])
  const [isAtOrgLimit, setIsAtOrgLimit] = useState(false)
  const [canUpgrade, setCanUpgrade] = useState(false)
  const [visibleOrgs, setVisibleOrgs] = useState(orgsInAccount)

  // Pagination Calculations
  const adjustedHeight = height - GLOBAL_HEADER_HEIGHT - 60
  const orgsPerPage = Math.floor(adjustedHeight / 95)
  const totalPageCalculation = Math.ceil(visibleOrgs.length / orgsPerPage)
  const totalPagesShown = totalPageCalculation > 0 ? totalPageCalculation : 1
  const currentPageStart = orgsPerPage * (currentPage - 1)
  const currentPageEnd = orgsPerPage * (currentPage - 1) + orgsPerPage

  // Event Handlers
  const changeSort = (sortMethod: OrgListSortMethod) => {
    setSortMethod(sortMethod)
  }

  const changeFilter = (searchTerm: string) => {
    setSearchTerm(searchTerm)
  }

  // Load orgs, if not already present in redux.
  useEffect(() => {
    if (orgsLoadedStatus === RemoteDataState.NotStarted) {
      dispatch(getQuartzOrganizationsThunk(currentAccountId))
    }
  }, [dispatch, orgsLoadedStatus, currentAccountId])

  // Retrieve settings for banner to be displayed when user hits the org cap.
  useEffect(() => {
    const checkOrgCreationAllowance = async () => {
      try {
        const {allowed, upgradesAvailable} = await fetchOrgCreationAllowance()
        if (!allowed) {
          setIsAtOrgLimit(false)
        } else {
          setIsAtOrgLimit(true)
        }

        if (upgradesAvailable) {
          setCanUpgrade(true)
        } else {
          setCanUpgrade(false)
        }
      } catch (err) {
        setIsAtOrgLimit(false)
        setCanUpgrade(false)

        dispatch(notify(fetchOrgAllowanceFailed()))
      }
    }

    checkOrgCreationAllowance()
  }, [dispatch])

  // Sort and filter orgs whenever the user-selected filter or sort changes.
  useEffect(() => {
    const {sortKey, sortDirection} = sortMethod

    let sortedFilteredOrgs = cloneDeep(orgsInAccount)

    const localeCompareOptions = {
      sensitivity: 'base',
      ignorePunctuation: true,
      numeric: true,
    }

    // Filter
    if (searchTerm.trim() !== '') {
      sortedFilteredOrgs = sortedFilteredOrgs.filter(org =>
        org.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Sort
    if (sortDirection === Sort.Descending) {
      sortedFilteredOrgs.sort((a, b) =>
        a[sortKey].localeCompare(b[sortKey], localeCompareOptions)
      )
    } else {
      sortedFilteredOrgs.sort((a, b) =>
        b[sortKey].localeCompare(a[sortKey], localeCompareOptions)
      )
    }

    setVisibleOrgs(sortedFilteredOrgs)
    setCurrentPage(1)
  }, [orgsInAccount, searchTerm, sortMethod])

  return (
    <>
      <FlexBox direction={FlexDirection.Row}>
        <FlexBox className="account-settings-page-org-tab--searchwidget-container">
          <SearchWidget
            placeholderText="Search organizations"
            onSearch={changeFilter}
            searchTerm={searchTerm}
          ></SearchWidget>
        </FlexBox>
        <FlexBox className="account-settings-page-org-tab--sort-dropdown-container">
          <OrgListDropdown sortMethod={sortMethod} onClick={changeSort} />
        </FlexBox>
      </FlexBox>
      {isAtOrgLimit && (
        <OrgBannerPanel isAtOrgLimit={isAtOrgLimit} canUpgrade={canUpgrade} />
      )}
      <ResourceList>
        <ResourceList.Body
          emptyState={<NoOrgsState />}
          data-testid="account--organizations-tab-orgs-list"
        >
          {visibleOrgs.slice(currentPageStart, currentPageEnd).map(org => {
            return (
              <OrganizationCard
                key={org.id}
                name={org.name}
                provider={org.provider}
                regionCode={org.regionCode}
                regionName={org.regionName}
              />
            )
          })}
        </ResourceList.Body>
      </ResourceList>
      <PaginationNav.PaginationNav
        currentPage={currentPage}
        onChange={setCurrentPage}
        pageRangeOffset={1}
        totalPages={totalPagesShown}
      />
    </>
  )
}
