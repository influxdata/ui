// Libraries
import React, {useContext, FC, memo} from 'react'
import {withRouter, RouteComponentProps} from 'react-router-dom'
import {OverlayContext} from 'src/overlays/components/OverlayController'

import _ from 'lodash'

// Components
import DangerConfirmationOverlay from 'src/shared/components/dangerConfirmation/DangerConfirmationOverlay'
import RenameVariableForm from 'src/variables/components/RenameVariableForm'

const sendMessage = (): string => {
  return 'Updating the name of a Variable can have unintended consequences. Anything that references this Variable by name will stop working including:'
}

const effectedItems = (): string[] => {
  return ['Queries', 'Dashboards', 'Telegraf Configurations', 'Templates']
}

const RenameVariableOverlay: FC<RouteComponentProps<{
  orgID: string
}>> = () => {
  const {onClose} = useContext(OverlayContext)

  return (
    <DangerConfirmationOverlay
      title="Rename Variable"
      message={sendMessage()}
      effectedItems={effectedItems()}
      confirmButtonText="I understand, let's rename my Variable"
      onClose={onClose}
    >
      <RenameVariableForm onClose={onClose} />
    </DangerConfirmationOverlay>
  )
}

export default withRouter(memo(RenameVariableOverlay))
