import React, {FC} from 'react'
import {useSelector} from 'react-redux'
import {Link} from 'react-router-dom'

import {Columns, Grid, InfluxColors, Page, Panel} from '@influxdata/clockface'

import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'
import {getOrg} from 'src/organizations/selectors'

export const HomepageContainer: FC = () => {
  const org = useSelector(getOrg)
  const pythonWizardLink = `/orgs/${org.id}/new-user-wizard/python`

  return (
    <>
      <Page titleTag={pageTitleSuffixer(['Get Started'])}>
        <Page.Header fullWidth={true} testID="alerts-page--header">
          <Page.Title title="Get Started" />
        </Page.Header>
        <Page.Contents>
          <p>
            Write and query data using the programming language of your choice
          </p>
          <Grid>
            <Grid.Row>
              <Grid.Column widthSM={Columns.Two}>
                <Panel backgroundColor={InfluxColors.Pepper}>
                  <Panel.Body>
                    <Link to={pythonWizardLink}>Python</Link>
                  </Panel.Body>
                </Panel>
              </Grid.Column>
              <Grid.Column widthSM={Columns.Two}>
                <Panel backgroundColor={InfluxColors.Pepper}>
                  <Panel.Body>JavaScript/Node.js</Panel.Body>
                </Panel>
              </Grid.Column>
              <Grid.Column widthSM={Columns.Two}>
                <Panel backgroundColor={InfluxColors.Pepper}>
                  <Panel.Body>Go</Panel.Body>
                </Panel>
              </Grid.Column>
              <Grid.Column widthSM={Columns.Two}>
                <Panel backgroundColor={InfluxColors.Pepper}>
                  <Panel.Body>More</Panel.Body>
                </Panel>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Page.Contents>
      </Page>
    </>
  )
}
