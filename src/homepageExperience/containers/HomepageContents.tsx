// Libraries
import React, {FC} from 'react'

// Components
import {Columns, Grid, Page} from '@influxdata/clockface'
import Resources from 'src/me/components/Resources'

// Constants
import {CLOUD} from 'src/shared/constants'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'
import UsageProvider from 'src/usage/context/usage'
import {ManageDatabasesAccordion} from 'src/homepageExperience/components/OptionAccordion/ManageDatabasesAccordion'
import {AddDataAccordion} from 'src/homepageExperience/components/OptionAccordion/AddDataAccordion'
import {QueryDataAccordion} from 'src/homepageExperience/components/OptionAccordion/QueryDataAccordion'
import {VisualizeAccordion} from 'src/homepageExperience/components/OptionAccordion/VisualizeAccordion'

export const HomepageContents: FC = () => {
  return (
    <Page titleTag={pageTitleSuffixer(['Get Started'])}>
      <Page.Header fullWidth={false} />
      <Page.Contents fullWidth={false} scrollable={true}>
        <Grid>
          <Grid.Row>
            <Grid.Column widthSM={Columns.Eight} widthMD={Columns.Nine}>
              <ManageDatabasesAccordion />
              <AddDataAccordion />
              <QueryDataAccordion />
              <VisualizeAccordion />
            </Grid.Column>
            <Grid.Column widthSM={Columns.Four} widthMD={Columns.Three}>
              {CLOUD ? (
                <UsageProvider>
                  <Resources />
                </UsageProvider>
              ) : (
                <Resources />
              )}
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Page.Contents>
    </Page>
  )
}
