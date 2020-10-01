// Libraries
import React, {FC, useContext} from 'react'

// Components
import {InfluxColors, List} from '@influxdata/clockface'
import MeasurementSelectors from 'src/flows/pipes/Data/MeasurementSelectors'
import FieldSelectors from 'src/flows/pipes/Data/FieldSelectors'
import TagSelectors from 'src/flows/pipes/Data/TagSelectors'
import {SchemaContext} from 'src/flows/context/schemaProvider'

const Selectors: FC = () => {
  const {fields, measurements, tags} = useContext(SchemaContext)

  return (
    <div className="data-source--block-results">
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
    </div>
  )
}

export default Selectors
