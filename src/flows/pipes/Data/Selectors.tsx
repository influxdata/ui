// Libraries
import React, {FC, useContext} from 'react'

// Components
import {InfluxColors, List, EmptyState} from '@influxdata/clockface'
import MeasurementSelectors from 'src/flows/pipes/Data/MeasurementSelectors'
import FieldSelectors from 'src/flows/pipes/Data/FieldSelectors'
import TagSelectors from 'src/flows/pipes/Data/TagSelectors'
import {SchemaContext} from 'src/flows/context/schemaProvider'

const Selectors: FC = () => {
  const {fields, measurements, tags, searchTerm} = useContext(SchemaContext)

  const noSearchResults =
    searchTerm && !fields.length && !measurements.length && !tags.length

  let list = (
    <List
      className="data-source--list"
      backgroundColor={InfluxColors.Obsidian}
      maxHeight="304px"
      style={{height: '304px'}}
    >
      <MeasurementSelectors measurements={measurements} />
      <FieldSelectors fields={fields} />
      <TagSelectors tags={tags} />
    </List>
  )

  if (noSearchResults) {
    list = (
      <EmptyState style={{height: '304px'}}>
        <p>{`No fields, meausurements, or tags match "${searchTerm}"`}</p>
      </EmptyState>
    )
  }

  return <div className="data-source--block-results">{list}</div>
}

export default Selectors
