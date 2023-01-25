import React, {FC} from 'react'
import {
  Columns,
  FlexBox,
  Grid,
  RangeSlider,
  SlideToggle,
} from '@influxdata/clockface'

import {RecursivePartial} from 'src/types'
import {DropdownList as SelectorList} from 'src/shared/components/DropdownList'
import SelectorTitle from 'src/dataExplorer/components/SelectorTitle'
import {ViewOptions} from 'src/dataExplorer/context/resultsView'

import './SqlViewOptions.scss'

interface SqlViewOptionsT {
  selectViewOptions: (_: RecursivePartial<ViewOptions>) => void
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

  const handleSmoothingRangeSlider = event =>
    selectViewOptions({
      smoothing: {percentageRetained: parseInt(event.target.value)},
    })

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

  const smoothingTooltipContents = (
    <div>
      <span>Smoothing used for the graph subquery.</span>
      <br />
      <br />
      <span>
        Smoothing applies a{' '}
        <a href="https://docs.influxdata.com/flux/v0.x/stdlib/experimental/polyline/rdp/">
          RDP algorithm
        </a>{' '}
        to downsample your data, while maintaining the trends. Smoothing will be
        applied to a single column of data, based upon your chosen 'Y column'.
      </span>
      <br />
      <br />
      <span>
        Goal is to display a graph covering the entire time range, even if your
        full returned results are truncated in the table view.
      </span>
    </div>
  )

  return (
    <div
      className="view-options sql-view-options"
      data-testid="sql-view-options"
    >
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
              testID="view-options--grouping--selector-list"
            />
            <FlexBox className="view-options--smoothing-header">
              <SelectorTitle
                label="Graph smoothing"
                tooltipContents={smoothingTooltipContents}
              />
              <SlideToggle
                active={selectedViewOptions?.smoothing?.applied}
                onChange={() =>
                  selectViewOptions({
                    smoothing: {
                      applied: !selectedViewOptions?.smoothing?.applied,
                    },
                  })
                }
                testID="view-options--smoothing-toggle"
              />
            </FlexBox>
            <SelectorList
              items={allViewOptions?.smoothing?.columns ?? []}
              selectedItems={selectedViewOptions?.smoothing?.columns ?? []}
              onSelectItem={column =>
                selectViewOptions({smoothing: {columns: [column]}})
              }
              multiSelect={false}
              disabled={!selectedViewOptions?.smoothing?.applied}
              testID="view-options--smoothing--selector-list"
            />
            <RangeSlider
              value={selectedViewOptions?.smoothing?.percentageRetained}
              min={5}
              max={100}
              step={5}
              onChange={handleSmoothingRangeSlider}
              labelPrefix="retained "
              labelSuffix="%"
            />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </div>
  )
}
