// Libraries
import React, {useContext, FC, memo} from 'react'
import {OverlayContext} from 'src/overlays/components/OverlayController'

// Components
import DangerConfirmationOverlay from 'src/shared/components/dangerConfirmation/DangerConfirmationOverlay'
import RenameVariableForm from 'src/variables/components/RenameVariableForm'

const sendMessage = (): string => {
  return 'Updating the name of a Variable can have unintended consequences. Anything that references this Variable by name will stop working including:'
}

const effectedItems = (): string[] => {
  return ['Queries', 'Dashboards', 'Telegraf Configurations', 'Templates']
}

const RenameVariableOverlay: FC = () => {
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

export default memo(RenameVariableOverlay)
