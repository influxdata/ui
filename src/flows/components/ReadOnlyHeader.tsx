// Libraries
import React, {FC, useContext} from 'react'
import {
  Page,
  Grid,
  Button,
  IconFont,
  ComponentColor,
  ButtonShape,
  ComponentSize,
  Columns,
} from '@influxdata/clockface'

// Contexts
import {FlowContext} from 'src/flows/context/flow.current'

// Components
import TimeZoneDropdown from 'src/shared/components/TimeZoneDropdown'
import TimeRangeLabel from 'src/flows/components/header/TimeRangeLabel'

import {DEFAULT_PROJECT_NAME} from 'src/flows'

import './ReadOnlyHeader.scss'
import GetInfluxButton from 'src/shared/components/GetInfluxButton'

const ReadOnlyHeader: FC = () => {
  const {flow} = useContext(FlowContext)

  const handleLogoClick = () => {
    window.open('https://influxdata.com', '_blank').focus()
  }

  return (
    <>
      <Page.Header fullWidth>
        <Grid>
          <Grid.Row className="flows-header-row">
            <Grid.Column widthMD={Columns.Two}>
              <div className="flows-header-logo" onClick={handleLogoClick} />
            </Grid.Column>
            <Grid.Column
              widthMD={Columns.Ten}
              className="flows-header-column-signup"
            >
              <GetInfluxButton />
            </Grid.Column>
          </Grid.Row>
          <Page.Title title={flow.name || DEFAULT_PROJECT_NAME} />
        </Grid>
      </Page.Header>
      <Page.ControlBar fullWidth>
        <Page.ControlBarRight>
          <TimeRangeLabel />
          <TimeZoneDropdown />
        </Page.ControlBarRight>
      </Page.ControlBar>
    </>
  )
}

export default ReadOnlyHeader
