// Libraries
import React, {FC} from 'react'
import {useHistory} from 'react-router-dom'
import {useSelector} from 'react-redux'

// Components
import {Overlay} from '@influxdata/clockface'
import VariableFormContext from 'src/variables/components/VariableFormContext'
import GetResources from 'src/resources/components/GetResources'
import {getOrg} from 'src/organizations/selectors'

// Types
import {ResourceType} from 'src/types'
import ErrorBoundary from 'src/shared/components/ErrorBoundary'

const CreateVariableOverlay: FC = () => {
  const history = useHistory()
  const org = useSelector(getOrg)

  const handleHide = () => {
    history.push(`/orgs/${org.id}/settings/variables`)
  }

  return (
    <Overlay.Container maxWidth={1000}>
      <Overlay.Header title="Create Variable" onDismiss={handleHide} />
      <Overlay.Body>
        <GetResources resources={[ResourceType.Variables]}>
          <ErrorBoundary>
            <VariableFormContext onHideOverlay={handleHide} />
          </ErrorBoundary>
        </GetResources>
      </Overlay.Body>
    </Overlay.Container>
  )
}

export {CreateVariableOverlay}
export default CreateVariableOverlay
