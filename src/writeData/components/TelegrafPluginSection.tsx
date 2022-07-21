// Libraries
import React, {useContext} from 'react'
import {useSelector} from 'react-redux'
import {useHistory} from 'react-router-dom'
import {ORGS, TELEGRAF_PLUGINS} from 'src/shared/constants/routes'
import {search} from 'src/writeData/constants/contentTelegrafPlugins'

// Utils
import {getOrg} from 'src/organizations/selectors'
import {event} from 'src/cloud/utils/reporting'

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

const TelegrafPluginSection = () => {
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
      data-testid="write-data--section telegraf-plugins"
    >
      <Heading
        element={HeadingElement.H2}
        weight={FontWeight.Regular}
        style={{marginTop: '24px', marginBottom: '4px'}}
        testID="sources-telegraf-plugins"
      >
        Telegraf Plugins
      </Heading>
      <Heading
        element={HeadingElement.H5}
        weight={FontWeight.Regular}
        style={{marginBottom: '24px'}}
      >
        An open-source agent for collecting data and reporting metrics via a
        vast library of plugins
      </Heading>
      <SquareGrid cardSize="170px" gutter={ComponentSize.Small}>
        {items.map(item => {
          const goto = () => {
            event('loadData.TelegrafPlugin.clicked', {type: item.name})
            history.push(
              `/${ORGS}/${org.id}/load-data/${TELEGRAF_PLUGINS}/${item.id}`
            )
          }

          return (
            <WriteDataItem
              key={item.id}
              id={item.id}
              name={item.name}
              image={item.image}
              style={item.style}
              onClick={goto}
            />
          )
        })}
      </SquareGrid>
    </div>
  )
}

export default TelegrafPluginSection
