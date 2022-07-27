// Libraries
import React, {FC, useContext} from 'react'
import {useSelector} from 'react-redux'
import {useHistory} from 'react-router-dom'

// Utils
import {getOrg} from 'src/organizations/selectors'
import {event} from 'src/cloud/utils/reporting'
import {ORGS, SUBSCRIPTIONS} from 'src/shared/constants/routes'
import {search} from 'src/writeData/subscriptions/components/CloudSubscriptionContent'

// Components
import {
  Heading,
  HeadingElement,
  FontWeight,
  SquareGrid,
  Icon,
  IconFont,
  FlexBox,
  ComponentSize,
  AlignItems,
  FlexDirection,
} from '@influxdata/clockface'
import WriteDataItem from 'src/writeData/components/WriteDataItem'

// Contexts
import {WriteDataSearchContext} from 'src/writeData/containers/WriteDataPage'

// Actions
import {shouldShowUpgradeButton} from 'src/me/selectors'

// Styles
import 'src/writeData/subscriptions/components/CloudNativeSources.scss'

const CloudNativeSources: FC = () => {
  const {searchTerm} = useContext(WriteDataSearchContext)
  const items = search(searchTerm)
  const history = useHistory()
  const org = useSelector(getOrg)
  const showUpgradeButton = useSelector(shouldShowUpgradeButton)
  if (!items.length) {
    return null
  }
  return (
    <div className="cloud-native-sources" data-testid="cloud-native-sources">
      <Heading
        element={HeadingElement.H2}
        weight={FontWeight.Regular}
        style={{marginTop: '24px', marginBottom: '4px'}}
      >
        Native Subscriptions
        {showUpgradeButton && (
          <FlexBox
            alignItems={AlignItems.Center}
            direction={FlexDirection.Row}
            margin={ComponentSize.Large}
            className="cloud-native-sources__premium-container"
          >
            <Icon glyph={IconFont.CrownSolid_New} />
            <Heading
              element={HeadingElement.H5}
              weight={FontWeight.Bold}
              className="cloud-native-sources__premium-container__text"
            >
              Premium
            </Heading>
          </FlexBox>
        )}
      </Heading>
      <Heading
        element={HeadingElement.H5}
        weight={FontWeight.Regular}
        style={{marginBottom: '24px'}}
      >
        Collect data directly from external cloud services and applications
      </Heading>
      <SquareGrid cardSize="170px" gutter={ComponentSize.Small}>
        {items.map(item => {
          const goto = () => {
            event(
              'Load cloud native subscriptions tile clicked',
              {type: item.name},
              {feature: 'subscriptions'}
            )
            history.push(`/${ORGS}/${org.id}/load-data/${SUBSCRIPTIONS}`)
          }
          return (
            <WriteDataItem
              key={item.id}
              id={item.id}
              name={item.name}
              image={item.image}
              onClick={goto}
            />
          )
        })}
      </SquareGrid>
    </div>
  )
}

export default CloudNativeSources
