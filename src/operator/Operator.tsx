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
import {User} from 'src/types/operator'
import ResourcesTable from 'src/operator/ResourcesTable'
import {
  getAccounts,
  getOrgsLimits,
  getOrg,
  getOperatorOrg,
  putOrgsLimits,
} from 'src/client/unityRoutes'
import OperatorNav from 'src/operator/OperatorNav'
import OrgOverlay from 'src/operator/OrgOverlay'

interface Props {
  operator: User
}

const Operator: FC<Props> = ({operator}) => {
  return (
    <AppWrapper>
      <Page titleTag="Operator UI">
        <FlexBox direction={FlexDirection.Row}>
          <FlexBoxChild>
            <AppPageHeader title="Cloud 2.0 Resources" />
          </FlexBoxChild>
          <OperatorNav operator={operator} />
        </FlexBox>
        <Page.Contents scrollable={true}>
          <ResourcesTable />
          {/*
              <OrgOverlay
                fetchOrganization={getOrg}
                fetchLimits={getOrgsLimits}
                updateLimits={putOrgsLimits}
              />
          */}
        </Page.Contents>
      </Page>
    </AppWrapper>
  )
}

export default Operator
