// Libraries
import React, {useContext} from 'react'
import {useSelector} from 'react-redux'
import {useHistory} from 'react-router-dom'
import {ORGS, CLIENT_LIBS} from 'src/shared/constants/routes'
import {searchClients} from 'src/writeData'

// Utils
import {getOrg} from 'src/organizations/selectors'
import {event} from 'src/cloud/utils/reporting'
import { isOrgIOx } from 'src/organizations/selectors'

// Contexts
import {WriteDataSearchContext} from 'src/writeData/containers/WriteDataPage'

// Components
import {
  SquareGrid,
  ComponentSize,
  Heading,
  HeadingElement,
  FontWeight,
} from '@influxdata/clockface'
import WriteDataItem from 'src/writeData/components/WriteDataItem'

const ClientLibrarySection = () => {
  const {searchTerm} = useContext(WriteDataSearchContext)
  const items = searchClients(searchTerm)

  const history = useHistory()
  const org = useSelector(getOrg)

  const onBoardingItems = {
    arduino: 'arduino',
    go: 'golang',
    'javascript-node': 'nodejs',
    python: 'python',
  }

  const SqlWrite = {
    go: 'golang',
    python: 'python'
  }

  const isIOxOrg = useSelector(isOrgIOx)

  if (!items.length) {
    return null
  }

  return (
    <div
      className="write-data--section"
      data-testid="write-data--section client-libraries"
    >
      <Heading
        element={HeadingElement.H2}
        weight={FontWeight.Regular}
        style={{marginTop: '24px', marginBottom: '4px'}}
      >
        Client Libraries
      </Heading>
      <Heading
        element={HeadingElement.H5}
        weight={FontWeight.Regular}
        style={{marginBottom: '24px'}}
      >
        Back-end, front-end, and mobile applications
      </Heading>
      <SquareGrid cardSize="170px" gutter={ComponentSize.Small}>
        {items.map(item => {
          const goto = () => {
            event('Load data client library clicked', {type: item.name})
            if (onBoardingItems.hasOwnProperty(`${item.id}`)) {
              return history.push(
                `/${ORGS}/${org.id}/new-user-setup/${onBoardingItems[item.id]}`
              )
            }
            return history.push(
              `/${ORGS}/${org.id}/load-data/${CLIENT_LIBS}/${item.id}`
            )
          }

          let capabilityTag = isIOxOrg && 'write'
          
          if (SqlWrite.hasOwnProperty(`${item.id}`)) {
            capabilityTag = 'write | query'
          }

          return (
            <WriteDataItem
              key={item.id}
              id={item.id}
              name={item.name}
              image={item.logo}
              onClick={goto}
              tag={capabilityTag}
            />
          )
        })}
      </SquareGrid>
    </div>
  )
}

export default ClientLibrarySection
