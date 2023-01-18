import React, {FC} from 'react'
import {Columns, Form, Grid} from '@influxdata/clockface'

import SelectorList from 'src/timeMachine/components/SelectorList'
import {ViewOptions} from 'src/dataExplorer/context/resultsView'

import './SqlViewOptions.scss'

interface SqlViewOptionsT {
  selectViewOptions: (_: Partial<ViewOptions>) => void
  allViewOptions: ViewOptions
  selectedViewOptions: ViewOptions
}

export const SqlViewOptions: FC<SqlViewOptionsT> = ({
  selectViewOptions,
  allViewOptions,
  selectedViewOptions,
}) => {
  const handleSelectedListItem = (propKey, value) => {
    if ((selectedViewOptions[propKey] ?? []).includes(value)) {
      selectViewOptions({
        [propKey]: selectedViewOptions[propKey].filter(v => v !== value),
      })
    } else {
      selectViewOptions({
        [propKey]: (selectedViewOptions[propKey] ?? []).concat([value]),
      })
    }
  }

  return (
    <div className="view-options sql-view-options">
      <Grid>
        <Grid.Row>
          <Grid.Column
            widthXS={Columns.Twelve}
            widthMD={Columns.Six}
            widthLG={Columns.Four}
            className="view-options-container"
          >
            <h5 className="view-options--header">Query Modifier</h5>
            <Form.Element label="Dataseries Grouping">
              <SelectorList
                items={allViewOptions?.groupby ?? []}
                selectedItems={selectedViewOptions?.groupby ?? []}
                onSelectItem={tagKey =>
                  handleSelectedListItem('groupby', tagKey)
                }
                multiSelect={true}
              />
            </Form.Element>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </div>
  )
}
