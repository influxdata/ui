import React, {FC} from 'react'
import {Route} from 'react-router-dom'
import OperatorProvider from 'src/operator/context/operator'
import Operator from 'src/operator/Operator'
import {OrgOverlay} from 'src/shared/containers'

// Utilities
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

// Constants
import {CLOUD} from 'src/shared/constants'

const OperatorPage: FC = () => (
  <OperatorProvider>
    <>
      <Operator />
      {CLOUD && isFlagEnabled('unity-operator') && (
        <Route path="/operator/organizations/:orgID" component={OrgOverlay} />
      )}
    </>
  </OperatorProvider>
)

export default OperatorPage
