// Libraries
import React, {FC, useContext} from 'react'

// Components
import {InfluxColors, List, EmptyState} from '@influxdata/clockface'
import MeasurementSelectors from 'src/flows/pipes/MetricSelector/MeasurementSelectors'
import FieldSelectors from 'src/flows/pipes/MetricSelector/FieldSelectors'
import TagSelectors from 'src/flows/pipes/MetricSelector/TagSelectors'
import {SchemaContext} from 'src/flows/context/schemaProvider'

const Selectors: FC = () => {
  const {fields, measurements, tags, searchTerm} = useContext(SchemaContext)

  const noResults = !fields.length && !measurements.length && !tags.length

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

  if (noResults && searchTerm) {
    list = (
      <EmptyState
        style={{height: '304px'}}
        className="data-source--list__no-results"
      >
        <p>{`No fields, meausurements, or tags match "${searchTerm}"`}</p>
      </EmptyState>
    )
  } else if (noResults && !searchTerm) {
    list = (
      <EmptyState
        style={{height: '304px'}}
        className="data-source--list__no-results"
      >
        <h5>No tags found in the selected time range</h5>
        <p>Try selecting a different time range</p>
      </EmptyState>
    )
  }

  return <div className="data-source--block-results">{list}</div>
}

export default Selectors
