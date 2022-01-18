// Libraries
import React, {FC, useContext} from 'react'
import {
  Panel,
  HeadingElement,
  Heading,
  TechnoSpinner,
  JustifyContent,
  AlignItems,
} from '@influxdata/clockface'

// Contexts
import {UsageContext} from 'src/usage/context/usage'

// Constants

// Types
import {RemoteDataState} from 'src/types'
import UsagePanelDetails from 'src/me/components/UsagePanelDetails'

const UsagePanel: FC = () => {
  const {creditUsage} = useContext(UsageContext)

  return (
    <Panel>
      <Panel.Header>
        <Heading element={HeadingElement.H3}>
          <label htmlFor="usagepanel--title">Usage ARTEMIS</label>
        </Heading>
      </Panel.Header>
      <Panel.Body
        justifyContent={JustifyContent.Center}
        alignItems={AlignItems.Center}
      >
        {creditUsage.status === RemoteDataState.Loading ? (
          <TechnoSpinner />
        ) : (
          <UsagePanelDetails />
        )}
      </Panel.Body>
    </Panel>
  )
}

export default UsagePanel
