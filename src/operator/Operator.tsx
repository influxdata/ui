// Libraries
import React, {FC} from 'react'
import {
  AppWrapper,
  FlexBox,
  FlexBoxChild,
  FlexDirection,
  Page,
} from '@influxdata/clockface'

// Components
import AppPageHeader from 'src/operator/AppPageHeader'
import ResourcesTable from 'src/operator/ResourcesTable'
import OperatorNav from 'src/operator/OperatorNav'

const Operator: FC = () => (
  <AppWrapper>
    <Page titleTag="Operator UI">
      <FlexBox direction={FlexDirection.Row}>
        <FlexBoxChild>
          <AppPageHeader title="Cloud 2.0 Resources" />
        </FlexBoxChild>
        <OperatorNav />
      </FlexBox>
      <Page.Contents scrollable={true}>
        <ResourcesTable />
      </Page.Contents>
    </Page>
  </AppWrapper>
)

export default Operator
