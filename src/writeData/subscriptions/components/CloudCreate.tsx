// Libraries
import React, {FC} from 'react'

// Types
import {ResourceType} from 'src/types'
// import {useSelector} from 'react-redux'
// import {useHistory} from 'react-router-dom'
// import {ORGS, SUBSCRIPTIONS} from 'src/shared/constants/routes'
// import {search} from 'src/writeData/subscriptions/components/contentCloudNative'

// Utils

// Components
import {
  Sort,
  Button,
  IconFont,
  ComponentSize,
  EmptyState,
  ComponentColor,
  ComponentStatus,
} from '@influxdata/clockface'
import {SortTypes} from 'src/shared/utils/sort'
import SearchWidget from 'src/shared/components/search_widget/SearchWidget'
import ResourceSortDropdown from 'src/shared/components/resource_sort_dropdown/ResourceSortDropdown'

// Styles
import 'src/writeData/subscriptions/components/CloudCreate.scss'

// Contexts

const CloudCreate: FC = () => (
  <div className="create-page">
    <div className="subscription-create">
      <div className="left">
        <SearchWidget
          placeholderText="Filter connections..."
          searchTerm={''}
          onSearch={() => {}}
        />
        <ResourceSortDropdown
          resourceType={ResourceType.Subscriptions}
          sortDirection={Sort.Ascending}
          sortKey={'name'}
          sortType={SortTypes.String}
          onSelect={() => {}}
        />
      </div>
      <div className="right">
        <Button
          text="Create Configuration"
          icon={IconFont.Plus_New}
          color={ComponentColor.Primary}
          onClick={() => {}}
          status={ComponentStatus.Default}
          titleText={''}
          testID="create-subscription-button"
        />
      </div>
    </div>
    <EmptyState size={ComponentSize.Medium}>
      <EmptyState.Text>
        Collect data from an external cloud source with a{' '}
        <b>Cloud Native Connection</b>.
      </EmptyState.Text>
      <Button
        text="Create Configuration"
        icon={IconFont.Plus_New}
        color={ComponentColor.Primary}
        onClick={() => {}}
        status={ComponentStatus.Default}
        titleText={''}
        testID="create-subscription-button"
      />
    </EmptyState>
  </div>
)

export default CloudCreate
