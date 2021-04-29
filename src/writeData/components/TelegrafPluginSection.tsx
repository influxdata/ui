// Libraries
import React, {useContext} from 'react'
import {TELEGRAF_PLUGINS} from 'src/shared/constants/routes'
import {search} from 'src/writeData/constants/contentTelegrafPlugins'

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

  if (!items.length) {
    return
  }

  return (
    <div
      className="write-data--section"
      data-testid={`write-data--section telegraf-plugins`}
    >
      <Heading
        element={HeadingElement.H2}
        weight={FontWeight.Regular}
        style={{marginTop: '24px', marginBottom: '4px'}}
      >
        Telegraf Plugins
      </Heading>
      <Heading
        element={HeadingElement.H5}
        weight={FontWeight.Regular}
        style={{marginBottom: '12px'}}
      >
        An open-source agent for collecting data and reporting metrics via a
        vast library of plugins
      </Heading>
      <SquareGrid cardSize="170px" gutter={ComponentSize.Small}>
        {items.map(item => (
          <WriteDataItem
            key={item.id}
            id={item.id}
            name={item.name}
            image={item.image}
            url={`${TELEGRAF_PLUGINS}/${item.id}`}
          />
        ))}
      </SquareGrid>
    </div>
  )
}

export default TelegrafPluginSection
