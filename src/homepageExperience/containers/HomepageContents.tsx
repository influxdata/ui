// Libraries
import React, {FC} from 'react'

// Components
import {
  AlignItems,
  Columns,
  ComponentSize,
  FlexBox,
  FlexDirection,
  Grid,
  Heading,
  HeadingElement,
  JustifyContent,
  Page,
} from '@influxdata/clockface'
import {CloudWidgets} from 'src/me/components/CloudWidgets'

// Constants
import {CLOUD} from 'src/shared/constants'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'
import UsageProvider from 'src/usage/context/usage'
import {ManageDatabasesAccordion} from 'src/homepageExperience/components/OptionAccordion/ManageDatabasesAccordion'
import {AddDataAccordion} from 'src/homepageExperience/components/OptionAccordion/AddDataAccordion'
import {QueryDataAccordion} from 'src/homepageExperience/components/OptionAccordion/QueryDataAccordion'
import {VisualizeAccordion} from 'src/homepageExperience/components/OptionAccordion/VisualizeAccordion'

// Styles
import 'src/homepageExperience/containers/HomepageContents.scss'

export const HomepageContents: FC = () => {
  return (
    <Page titleTag={pageTitleSuffixer(['Get Started'])}>
      <Page.Header fullWidth={true}>
        <Heading
          id="home-page--header"
          element={HeadingElement.H1}
          testID="home-page--header"
        >
          Resource Center
        </Heading>
      </Page.Header>
      <Page.Contents fullWidth={false} scrollable={true}>
        <Grid>
          <Grid.Row>
            <Grid.Column widthSM={Columns.Eight}>
              <FlexBox
                direction={FlexDirection.Column}
                margin={ComponentSize.Large}
                justifyContent={JustifyContent.FlexStart}
                alignItems={AlignItems.FlexStart}
              >
                <FlexBox.Child>
                  <Heading
                    id="home-page--sub-header"
                    element={HeadingElement.H3}
                    testID="home-page--sub-header"
                  >
                    What would you like to do?
                  </Heading>
                </FlexBox.Child>
                <FlexBox.Child className="home-page--accordion-container">
                  <ManageDatabasesAccordion />
                  <AddDataAccordion />
                  <QueryDataAccordion />
                  <VisualizeAccordion />
                </FlexBox.Child>
              </FlexBox>
            </Grid.Column>
            <Grid.Column widthSM={Columns.Four}>
              {CLOUD ? (
                <UsageProvider>
                  <CloudWidgets />
                </UsageProvider>
              ) : (
                <CloudWidgets />
              )}
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Page.Contents>
    </Page>
  )
}
