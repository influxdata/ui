// Libraries
import React, {FC, memo} from 'react'
import {useHistory} from 'react-router-dom'

// Components
import {Tabs, Orientation, ComponentSize} from '@influxdata/clockface'
import {FeatureFlag} from 'src/shared/utils/featureFlag'

// Decorators
import CloudExclude from 'src/shared/components/cloud/CloudExclude'
import CloudOnly from 'src/shared/components/cloud/CloudOnly'
import {event} from 'src/cloud/utils/reporting'
import {useSelector} from 'react-redux'
import {getOrg} from 'src/organizations/selectors'

interface Props {
  activeTab: string
}

const LoadDataNavigation: FC<Props> = ({activeTab}) => {
  const history = useHistory()
  const orgID = useSelector(getOrg).id

  const handleTabClick = (id: string): void => {
    event('page-nav clicked', {which: `load-data--${id}`})
    history.push(`/orgs/${orgID}/load-data/${id}`)
  }

  const tabs = [
    {
      text: 'Sources',
      id: 'sources',
      cloudExclude: false,
      cloudOnly: false,
      featureFlag: null,
    },
    {
      text: 'Buckets',
      id: 'buckets',
      cloudExclude: false,
      cloudOnly: false,
      featureFlag: null,
    },
    {
      text: 'Telegraf',
      id: 'telegrafs',
      cloudExclude: false,
      cloudOnly: false,
      featureFlag: null,
    },
    {
      text: 'Scrapers',
      id: 'scrapers',
      cloudExclude: true,
      cloudOnly: false,
      featureFlag: null,
    },
    {
      text: 'API Tokens',
      id: 'tokens',
      cloudOnly: false,
      cloudExclude: false,
      featureFlag: null,
    },
  ]

  const activeTabName = tabs.find(t => t.id === activeTab).text

  return (
    <Tabs
      orientation={Orientation.Horizontal}
      size={ComponentSize.Large}
      dropdownBreakpoint={872}
      dropdownLabel={activeTabName}
    >
      {tabs.map(t => {
        let tabElement = (
          <Tabs.Tab
            testID={`${t.id}--tab`}
            key={t.id}
            text={t.text}
            id={t.id}
            onClick={handleTabClick}
            active={t.id === activeTab}
          />
        )

        if (t.cloudExclude) {
          tabElement = <CloudExclude key={t.id}>{tabElement}</CloudExclude>
        }

        if (t.cloudOnly) {
          tabElement = <CloudOnly key={t.id}>{tabElement}</CloudOnly>
        }

        if (t.featureFlag) {
          tabElement = (
            <FeatureFlag key={t.id} name={t.featureFlag}>
              {tabElement}
            </FeatureFlag>
          )
        }
        return tabElement
      })}
    </Tabs>
  )
}

export default memo(LoadDataNavigation)
