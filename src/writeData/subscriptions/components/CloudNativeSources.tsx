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
  ComponentSize,
} from '@influxdata/clockface'
import WriteDataItem from 'src/writeData/components/WriteDataItem'

// Contexts
import {WriteDataSearchContext} from 'src/writeData/containers/WriteDataPage'

const CloudNativeSection: FC = () => {
  const {searchTerm} = useContext(WriteDataSearchContext)
  const items = search(searchTerm)
  const history = useHistory()
  const org = useSelector(getOrg)

  if (!items.length) {
    return null
  }
  return (
    <div
      className="write-data--section"
      data-testid="write-data--section cloud-connections"
    >
      <Heading
        element={HeadingElement.H2}
        weight={FontWeight.Regular}
        style={{marginTop: '24px', marginBottom: '4px'}}
      >
        Cloud Native Connections
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
            event('Load cloud native connections clicked', {type: item.name})
            history.push(
              `/${ORGS}/${org.id}/load-data/${SUBSCRIPTIONS}/${item.id}`
            )
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

export default CloudNativeSection
