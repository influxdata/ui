// Libraries
import React, {PureComponent} from 'react'

// Components
import {Page, Form, CTAButton, ButtonType} from '@influxdata/clockface'
import {ErrorHandling} from 'src/shared/decorators/errors'
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'
import {Plot, newTable} from '@influxdata/giraffe'
// import {FITBIT_CLIENT_ID, FITBIT_REDIRECT_URI} from 'src/shared/constants'

@ErrorHandling
class FitbitPage extends PureComponent {
  public render() {
    const style = {
      width: 'calc(70vw - 20px)',
      height: 'calc(70vh - 20px)',
      margin: '40px',
    }
    const lineLayer = {
      type: 'line',
      x: '_time',
      y: '_value',
    }
    const table = newTable(3)
      .addColumn('_time', 'dateTime:RFC3339', 'time', [
        1589838401244,
        1589838461244,
        1589838521244,
      ])
      .addColumn('_value', 'double', 'number', [2.58, 7.11, 4.79])
    const config = {
      table,
      layers: [lineLayer],
    }

    /*
     * make request to get date range sleep when click button
     * parse for value and time to create table
     * display in plot
     */

    return (
      <Page titleTag={pageTitleSuffixer(['Fitbit', 'Load Data'])}>
        <Page.Header fullWidth={false}>
          <Page.Title title="Fitbit" />
        </Page.Header>
        <Page.Contents fullWidth={false} scrollable={true}>
          <Form onSubmit={this.handleSubmit}>
            <h1> Whatcha wanna look at? </h1>
            <CTAButton text="Lookit" type={ButtonType.Submit} />
          </Form>
          <Plot config={config} style={style} />
        </Page.Contents>
      </Page>
    )
  }

  private handleSubmit = () => {
    console.log('submittin')
  }
}

export default FitbitPage
