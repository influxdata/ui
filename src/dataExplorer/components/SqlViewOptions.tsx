import React, {FC} from 'react'
import {Columns, Grid, Button, ComponentStatus} from '@influxdata/clockface'

import SelectorList from 'src/timeMachine/components/SelectorList'
import SelectorTitle from 'src/dataExplorer/components/SelectorTitle'
import {ViewOptions} from 'src/dataExplorer/context/resultsView'

import './SqlViewOptions.scss'

interface SqlViewOptionsT {
  selectViewOptions: (_: Partial<ViewOptions>) => void
  allViewOptions: ViewOptions
  selectedViewOptions: ViewOptions
  seeSubquery: () => void
}

export const SqlViewOptions: FC<SqlViewOptionsT> = ({
  selectViewOptions,
  allViewOptions,
  selectedViewOptions,
  seeSubquery,
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

  const groupbyTooltipContents = (
    <div>
      <span>Select the GROUPBY used for the graph subquery.</span>
      <br />
      <br />
      <span>
        Options are based on returned data results (refer to your table
        columns).
      </span>
      <br />
      <br />
      <span>
        By default, the GROUPBY is done on all tagKeys in order to produce a
        dataseries.
      </span>
    </div>
  )

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
            <SelectorTitle
              label="Grouping"
              tooltipContents={groupbyTooltipContents}
            />
            <SelectorList
              items={allViewOptions?.groupby ?? []}
              selectedItems={selectedViewOptions?.groupby ?? []}
              onSelectItem={tagKey => handleSelectedListItem('groupby', tagKey)}
              multiSelect={true}
            />
            <div className="sql-view-options--see-query">
              <Button
                testID="sql-view-options--see-query"
                text="View graph subquery"
                status={
                  !seeSubquery
                    ? ComponentStatus.Disabled
                    : ComponentStatus.Valid
                }
                onClick={seeSubquery}
              />
            </div>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </div>
  )
}
